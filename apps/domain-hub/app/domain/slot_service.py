import datetime
import uuid
from typing import List, Optional, Set
import pytz
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.core.logging import get_logger
from app.db.models import User, EventType, AvailabilityRule, AvailabilityException, Slot, Booking
from app.domain.slot_generation import (
    TimeWindow,
    apply_exceptions_for_date,
    merge_windows,
    overlaps_booked,
    split_into_slots,
    windows_for_weekday_rule,
    parse_iso_date,
)

logger = get_logger("SlotService")

def generate_slot_id() -> str:
    return f"c{uuid.uuid4().hex[:24]}"

def regenerate_host_slots(
    db: Session,
    host_id: int,
    from_date_str: Optional[str] = None,
    to_date_str: Optional[str] = None,
    days_ahead: int = 30,
) -> int:
    host = db.query(User).filter(User.id == host_id).first()
    if not host:
        logger.warning(f"Host {host_id} not found for slot regeneration")
        return 0

    now_utc = datetime.datetime.now(pytz.UTC)
    today = now_utc.date()

    if from_date_str:
        from_date = parse_iso_date(from_date_str)
    else:
        from_date = today

    if to_date_str:
        to_date = parse_iso_date(to_date_str)
    else:
        to_date = from_date + datetime.timedelta(days=days_ahead)

    logger.info(
        f"Regenerating slots for host {host.name} (id={host_id}) from {from_date} to {to_date}",
        extra={"host_id": host_id, "from_date": str(from_date), "to_date": str(to_date)},
    )

    from_dt = datetime.datetime(from_date.year, from_date.month, from_date.day, 0, 0, 0, tzinfo=pytz.UTC)
    to_dt = datetime.datetime(to_date.year, to_date.month, to_date.day, 23, 59, 59, tzinfo=pytz.UTC)

    # 1. Fetch active rules
    rules = db.query(AvailabilityRule).filter(
        AvailabilityRule.userId == host_id,
        AvailabilityRule.isActive == True
    ).all()

    # 2. Fetch exceptions in range
    exceptions = db.query(AvailabilityException).filter(
        AvailabilityException.userId == host_id,
        AvailabilityException.date >= from_date,
        AvailabilityException.date <= to_date
    ).all()

    # 3. Fetch active event types for host
    event_types = db.query(EventType).filter(
        EventType.hostId == host_id,
        EventType.isActive == True
    ).all()

    if not event_types:
        logger.info(f"No active event types for host {host_id}, skipping slot generation")
        return 0

    # 4. Fetch existing non-canceled bookings in range
    bookings = db.query(Booking).filter(
        Booking.hostId == host_id,
        Booking.status != "CANCELED",
        Booking.startAt <= to_dt,
        Booking.endAt >= from_dt
    ).all()

    booked_windows = [
        TimeWindow(
            start=b.startAt if b.startAt.tzinfo else pytz.UTC.localize(b.startAt),
            end=b.endAt if b.endAt.tzinfo else pytz.UTC.localize(b.endAt),
        )
        for b in bookings
    ]

    total_created_or_updated = 0

    # 5. Generate slots per event type
    for event_type in event_types:
        generated_slot_keys: Set[str] = set()

        curr = from_date
        while curr <= to_date:
            weekday = (curr.weekday() + 1) % 7 # Luxon weekday: 0=Sun, 1=Mon, ..., 6=Sat

            # Build available windows for this date from rules
            day_windows: List[TimeWindow] = []
            for rule in rules:
                if rule.weekday == weekday:
                    day_windows.extend(windows_for_weekday_rule(rule, curr, host.timezone or "UTC"))

            # Merge overlapping windows
            day_windows = merge_windows(day_windows)

            # Apply date exceptions
            day_windows = apply_exceptions_for_date(day_windows, exceptions, curr, host.timezone or "UTC")

            # Split into discrete event-duration slots
            slots = split_into_slots(
                windows=day_windows,
                duration_minutes=event_type.durationMinutes,
                buffer_before=event_type.bufferBeforeMinutes,
                buffer_after=event_type.bufferAfterMinutes,
            )

            # Filter past slots and booked collisions
            for slot_win in slots:
                if slot_win.start < now_utc:
                    continue
                if overlaps_booked(slot_win, booked_windows):
                    continue

                start_iso = slot_win.start
                end_iso = slot_win.end
                slot_key = f"{event_type.id}|{start_iso.isoformat()}|{end_iso.isoformat()}"
                generated_slot_keys.add(slot_key)

                # Upsert slot into DB
                existing_slot = db.query(Slot).filter(
                    Slot.eventTypeId == event_type.id,
                    Slot.startAt == start_iso,
                    Slot.endAt == end_iso,
                ).first()

                if existing_slot:
                    if existing_slot.status != "BOOKED":
                        existing_slot.status = "AVAILABLE"
                        existing_slot.updatedAt = datetime.datetime.utcnow()
                else:
                    new_slot = Slot(
                        id=generate_slot_id(),
                        hostId=host_id,
                        eventTypeId=event_type.id,
                        startAt=start_iso,
                        endAt=end_iso,
                        status="AVAILABLE",
                        createdAt=datetime.datetime.utcnow(),
                        updatedAt=datetime.datetime.utcnow(),
                    )
                    db.add(new_slot)
                    total_created_or_updated += 1

            curr += datetime.timedelta(days=1)

        # Mark obsolete slots as BLOCKED
        existing_future_slots = db.query(Slot).filter(
            Slot.eventTypeId == event_type.id,
            Slot.startAt >= from_dt,
            Slot.startAt <= to_dt,
            Slot.status.in_(["AVAILABLE", "BLOCKED"])
        ).all()

        for slot in existing_future_slots:
            slot_start = slot.startAt if slot.startAt.tzinfo else pytz.UTC.localize(slot.startAt)
            slot_end = slot.endAt if slot.endAt.tzinfo else pytz.UTC.localize(slot.endAt)
            key = f"{event_type.id}|{slot_start.isoformat()}|{slot_end.isoformat()}"
            if key not in generated_slot_keys:
                slot.status = "BLOCKED"
                slot.updatedAt = datetime.datetime.utcnow()

    db.commit()
    logger.info(
        f"Slot regeneration finished for host {host_id}. New/updated slots: {total_created_or_updated}",
        extra={"host_id": host_id, "generated_count": total_created_or_updated},
    )
    return total_created_or_updated
