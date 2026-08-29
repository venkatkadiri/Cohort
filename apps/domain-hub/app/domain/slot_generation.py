import datetime
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import pytz

from dateutil import parser

@dataclass
class TimeWindow:
    start: datetime.datetime
    end: datetime.datetime

def parse_iso_datetime(val: str) -> datetime.datetime:
    if not val:
        return datetime.datetime.now(pytz.UTC)
    dt = parser.isoparse(val)
    if dt.tzinfo is None:
        dt = pytz.UTC.localize(dt)
    return dt

def parse_iso_date(val: str) -> datetime.date:
    if not val:
        return datetime.date.today()
    if len(val) >= 10:
        val = val[:10]
    return parser.isoparse(val).date()

def parse_time_on_date(date: datetime.date, time_str: str, tz_name: str = "UTC") -> datetime.datetime:
    tz = pytz.timezone(tz_name)
    hour, minute = map(int, time_str.split(":"))
    dt_naive = datetime.datetime(date.year, date.month, date.day, hour, minute, 0, 0)
    return tz.localize(dt_naive).astimezone(pytz.UTC)

def merge_windows(windows: List[TimeWindow]) -> List[TimeWindow]:
    if not windows:
        return []
    
    sorted_windows = sorted(windows, key=lambda w: w.start)
    merged: List[TimeWindow] = [TimeWindow(start=sorted_windows[0].start, end=sorted_windows[0].end)]
    
    for current in sorted_windows[1:]:
        last = merged[-1]
        if current.start <= last.end:
            if current.end > last.end:
                last.end = current.end
        else:
            merged.append(TimeWindow(start=current.start, end=current.end))
            
    return merged

def split_into_slots(
    windows: List[TimeWindow],
    duration_minutes: int,
    buffer_before_minutes: int = 0,
    buffer_after_minutes: int = 0,
) -> List[TimeWindow]:
    slots: List[TimeWindow] = []
    total_delta = datetime.timedelta(minutes=duration_minutes + buffer_before_minutes + buffer_after_minutes)
    duration_delta = datetime.timedelta(minutes=duration_minutes)
    buffer_before_delta = datetime.timedelta(minutes=buffer_before_minutes)

    for window in windows:
        cursor = window.start
        while cursor + total_delta <= window.end:
            slot_start = cursor + buffer_before_delta
            slot_end = slot_start + duration_delta
            slots.append(TimeWindow(start=slot_start, end=slot_end))
            cursor += duration_delta
            
    return slots

def subtract_windows(windows: List[TimeWindow], block: TimeWindow) -> List[TimeWindow]:
    result: List[TimeWindow] = []
    
    for window in windows:
        # Check if window overlaps block
        if not (window.start < block.end and window.end > block.start):
            result.append(window)
            continue
            
        if block.start > window.start:
            result.append(TimeWindow(start=window.start, end=block.start))
            
        if block.end < window.end:
            result.append(TimeWindow(start=block.end, end=window.end))
            
    return [w for w in result if w.end > w.start]

def overlaps_booked(
    slot: TimeWindow,
    booked: List[TimeWindow],
    buffer_before_minutes: int = 0,
    buffer_after_minutes: int = 0,
) -> bool:
    padded_start = slot.start - datetime.timedelta(minutes=buffer_before_minutes)
    padded_end = slot.end + datetime.timedelta(minutes=buffer_after_minutes)
    
    for b in booked:
        if padded_start < b.end and padded_end > b.start:
            return True
    return False

def apply_exceptions_for_date(
    date: datetime.date,
    base_windows: List[TimeWindow],
    exceptions: List[Dict[str, Any]],
) -> List[TimeWindow]:
    windows = list(base_windows)
    
    for ex in exceptions:
        ex_type = ex.get("type")
        start_time = ex.get("startTime") or ex.get("start_time")
        end_time = ex.get("endTime") or ex.get("end_time")
        tz_name = ex.get("timezone") or ex.get("timeZone") or "UTC"
        
        if ex_type == "BLOCK_FULL_DAY":
            return []
            
        if ex_type == "BLOCK_PARTIAL" and start_time and end_time:
            block = TimeWindow(
                start=parse_time_on_date(date, start_time, tz_name),
                end=parse_time_on_date(date, end_time, tz_name),
            )
            windows = subtract_windows(windows, block)
            
        if ex_type == "ADD_AVAILABLE_WINDOW" and start_time and end_time:
            windows.append(
                TimeWindow(
                    start=parse_time_on_date(date, start_time, tz_name),
                    end=parse_time_on_date(date, end_time, tz_name),
                )
            )
            
    return merge_windows(windows)

def windows_for_weekday_rule(
    date: datetime.date,
    weekday: int,
    start_time: str,
    end_time: str,
    tz_name: str = "UTC",
) -> List[TimeWindow]:
    # In JS: 0=Sun, 1=Mon, ..., 6=Sat
    # In Python date.weekday(): 0=Mon, ..., 6=Sun. date.isoweekday(): 1=Mon, ..., 7=Sun
    # JS weekday conversion:
    # JS 0 (Sun) -> Python 6
    # JS 1 (Mon) -> Python 0
    # ... JS 6 (Sat) -> Python 5
    py_weekday = 6 if weekday == 0 else (weekday - 1)
    
    if date.weekday() != py_weekday:
        return []
        
    start = parse_time_on_date(date, start_time, tz_name)
    end = parse_time_on_date(date, end_time, tz_name)
    
    if start >= end:
        return []
        
    return [TimeWindow(start=start, end=end)]
