import type { RosterEntry } from '#/db/schema'

export type RosterEntryWithStatus = RosterEntry & {
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
