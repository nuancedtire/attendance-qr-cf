/**
 * Runtime shape returned by raw D1 queries in sessions.functions.ts.
 * Unlike Drizzle's $inferSelect (which uses camelCase), raw D1 queries
 * return the actual SQL column names (snake_case).
 */
export type RosterEntrySnake = {
  id: number
  rota_id: number
  name: string
  role: string | null
  shift_start: string | null
  shift_end: string | null
  source: string
  created_at: string
}

export type RosterEntryWithStatus = RosterEntrySnake & {
  checkedIn: boolean
  checkInAt: string | null
  checkOutAt: string | null
}

export type SessionRow = {
  id: number
  name: string
  role: string | null
  check_in_at: string
  check_out_at: string | null
}
