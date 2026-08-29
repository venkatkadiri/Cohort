export type DateLike = Date | string | { toJSDate?: () => Date; toISO?: () => string }

function parseDate(value: DateLike): Date {
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? new Date() : d
  }
  if (value && typeof (value as any).toJSDate === 'function') {
    return (value as any).toJSDate()
  }
  return new Date()
}

export function formatTime(value: DateLike, timezone: string = 'UTC'): string {
  try {
    const date = parseDate(value)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || 'UTC',
    }).format(date)
  } catch {
    return String(value)
  }
}

export function formatDate(value: DateLike, timezone: string = 'UTC'): string {
  try {
    const date = parseDate(value)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone || 'UTC',
    }).format(date)
  } catch {
    return String(value)
  }
}

export function formatDateShort(value: DateLike, timezone: string = 'UTC'): string {
  try {
    const date = parseDate(value)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: timezone || 'UTC',
    }).format(date)
  } catch {
    return String(value)
  }
}

export function formatDateTime(value: DateLike, timezone: string = 'UTC'): string {
  try {
    const date = parseDate(value)
    const datePart = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timezone || 'UTC',
    }).format(date)
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || 'UTC',
    }).format(date)
    return `${datePart} · ${timePart}`
  } catch {
    return String(value)
  }
}

export function toISODate(value: DateLike): string {
  const d = parseDate(value)
  return d.toISOString().split('T')[0]
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

export function isToday(dateInput: any): boolean {
  const d = parseDate(dateInput)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

export function isSameDay(aInput: any, bInput: any): boolean {
  const a = parseDate(aInput)
  const b = parseDate(bInput)
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}