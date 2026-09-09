import { DateTime, Interval } from 'luxon'

export interface TimeWindow {
  start: DateTime
  end: DateTime
}

export function mergeWindows(windows: TimeWindow[]): TimeWindow[] {
  if (windows.length === 0) return []
  const sorted = [...windows].sort((a, b) => a.start.toMillis() - b.start.toMillis())
  const merged: TimeWindow[] = [{ start: sorted[0].start, end: sorted[0].end }]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]
    if (current.start <= last.end) {
      if (current.end > last.end) {
        last.end = current.end
      }
    } else {
      merged.push({ start: current.start, end: current.end })
    }
  }

  return merged
}

export function subtractWindows(windows: TimeWindow[], block: TimeWindow): TimeWindow[] {
  const result: TimeWindow[] = []

  for (const window of windows) {
    // No overlap
    if (window.start >= block.end || window.end <= block.start) {
      result.push(window)
      continue
    }

    // Left piece
    if (block.start > window.start) {
      result.push({ start: window.start, end: block.start })
    }

    // Right piece
    if (block.end < window.end) {
      result.push({ start: block.end, end: window.end })
    }
  }

  return result.filter((w) => w.end > w.start)
}

export function splitIntoSlots(
  windows: TimeWindow[],
  durationMinutes: number,
  bufferBeforeMinutes = 0,
  bufferAfterMinutes = 0
): TimeWindow[] {
  const slots: TimeWindow[] = []
  const totalDurationMinutes = durationMinutes + bufferBeforeMinutes + bufferAfterMinutes

  for (const window of windows) {
    let cursor = window.start
    while (cursor.plus({ minutes: totalDurationMinutes }) <= window.end) {
      const slotStart = cursor.plus({ minutes: bufferBeforeMinutes })
      const slotEnd = slotStart.plus({ minutes: durationMinutes })
      slots.push({ start: slotStart, end: slotEnd })
      cursor = cursor.plus({ minutes: durationMinutes })
    }
  }

  return slots
}

export function overlapsBooked(
  slot: TimeWindow,
  booked: TimeWindow[],
  bufferBeforeMinutes = 0,
  bufferAfterMinutes = 0
): boolean {
  const paddedStart = slot.start.minus({ minutes: bufferBeforeMinutes })
  const paddedEnd = slot.end.plus({ minutes: bufferAfterMinutes })

  for (const b of booked) {
    if (paddedStart < b.end && paddedEnd > b.start) {
      return true
    }
  }
  return false
}

export function parseTimeToDateTime(dateStr: string, timeStr: string, timezone = 'UTC'): DateTime {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const dt = DateTime.fromISO(dateStr, { zone: timezone }).set({
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0,
  })
  return dt.toUTC()
}
