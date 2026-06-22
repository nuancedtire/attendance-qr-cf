import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAdminContext } from '#/routes/admin/-context'
import { adminGetDashboard } from '#/utils/sessions.functions'
import { DailySummary } from '#/routes/admin/-components/DailySummary'
import { WhoIsInSection, type PresentStaff } from '#/routes/admin/-components/WhoIsInSection'
import { Card } from '#/components/Card'
import type { RosterEntryWithStatus, SessionRow } from '#/routes/admin/-types'
import type { AuditEventItem } from '#/routes/admin/-components/AuditEvent'
import { Users, UserCheck, Clock } from 'lucide-react'
import { parseShiftTime } from '#/utils/dateTime'

type DashboardData = {
  entries: RosterEntryWithStatus[]
  present: PresentStaff[]
  sessions: SessionRow[]
  audit: AuditEventItem[]
}

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { authToken, viewDate, today } = useAdminContext()
  const [entries, setEntries] = useState<RosterEntryWithStatus[]>([])
  const [present, setPresent] = useState<PresentStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    adminGetDashboard({ data: { date: viewDate, authToken } })
      .then((d) => {
        if (!cancelled) {
          const data = d as DashboardData
          setEntries(data.entries ?? [])
          setPresent(data.present ?? [])
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [viewDate, authToken])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-neutral-200 rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-neutral-200 rounded-xl" />
        <div className="h-48 bg-neutral-200 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-danger-50 text-danger-800 rounded-lg border border-danger-200">
        <p className="font-medium">Failed to load dashboard data</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  const checkedInCount = entries.filter((e) => e.checkInAt).length
  const stillInCount = present.length

  const now = new Date()
  const isToday = viewDate === today

  const missingCheckIn = isToday
    ? entries.filter(
        (e) =>
          !e.checkInAt &&
          (!e.shift_start ||
            (parseShiftTime(viewDate, e.shift_start)?.getTime() ?? 0) < now.getTime()),
      )
    : []

  const missingCheckOut = isToday
    ? entries.filter(
        (e) =>
          e.checkInAt &&
          !e.checkOutAt &&
          e.shift_end &&
          (parseShiftTime(viewDate, e.shift_end)?.getTime() ?? Infinity) < now.getTime(),
      )
    : []

  const allGood = entries.filter((e) => e.checkInAt && e.checkOutAt)

  const checkedInPct = entries.length > 0 ? Math.round((checkedInCount / entries.length) * 100) : 0
  const stillInPct = entries.length > 0 ? Math.round((stillInCount / entries.length) * 100) : 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">On rota</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{entries.length}</p>
          <p className="text-sm text-neutral-500 mt-0.5">staff scheduled today</p>
        </Card>
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-success-100 text-success-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Checked in</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{checkedInCount}</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>{checkedInPct}% of rota</span>
              <span>{entries.length - checkedInCount} remaining</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-success-500 rounded-full transition-all duration-500"
                style={{ width: `${checkedInPct}%` }}
              />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-warning-100 text-warning-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Currently in</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{stillInCount}</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>{stillInPct}% of rota</span>
              <span>{checkedInCount - stillInCount} checked out</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-warning-500 rounded-full transition-all duration-500"
                style={{ width: `${stillInPct}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <DailySummary
        missingCheckIn={missingCheckIn}
        missingCheckOut={missingCheckOut}
        allGood={allGood}
        entries={entries}
        viewDate={viewDate}
      />
      <WhoIsInSection present={present} />
    </div>
  )
}
