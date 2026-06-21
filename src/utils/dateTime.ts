const UK_TIMEZONE = 'Europe/London'

export function isValidDate(d: unknown): d is string {
  return typeof d === 'string' && !isNaN(Date.parse(d))
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso || !isValidDate(iso)) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso || !isValidDate(iso)) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso || !isValidDate(iso)) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    dateStyle: 'short',
  }).format(new Date(iso))
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso || !isValidDate(iso)) return '-'
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.round((now - then) / 1000)
  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.round(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.round(diffHrs / 24)
  return `${diffDays}d ago`
}

export function formatDurationHours(startIso: string, endIso?: string | null): string {
  if (!isValidDate(startIso)) return '-'
  const start = new Date(startIso).getTime()
  const end = endIso && isValidDate(endIso) ? new Date(endIso).getTime() : Date.now()
  const hours = (end - start) / 36e5
  return `${hours.toFixed(2)}h`
}

export function todayDate(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: UK_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

export function isoForDateTimeLocal(iso: string | null | undefined): string {
  if (!iso || !isValidDate(iso)) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function parseShiftTime(date: string, time: string | null): Date | null {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  const d = new Date(`${date}T00:00:00`)
  d.setHours(h, m, 0, 0)
  return d
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Return Monday of the week containing `date` (YYYY-MM-DD). */
export function getWeekStart(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const day = d.getDay() // 0=Sun, 1=Mon, …, 6=Sat
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}
