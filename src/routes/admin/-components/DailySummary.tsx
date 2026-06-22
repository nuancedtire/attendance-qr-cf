import { Badge } from '#/components/Badge'
import type { RosterEntryWithStatus } from '#/routes/admin/-types'
import { Card } from '#/components/Card'
import { formatTime, parseShiftTime } from '#/utils/dateTime'
import { AlertCircle, CheckCircle2, Clock, Users, AlertTriangle } from 'lucide-react'

const LATE_THRESHOLD_MS = 15 * 60 * 1000

export function DailySummary({
  missingCheckIn,
  missingCheckOut,
  allGood,
  entries,
  viewDate,
}: {
  missingCheckIn: RosterEntryWithStatus[]
  missingCheckOut: RosterEntryWithStatus[]
  allGood: RosterEntryWithStatus[]
  entries: RosterEntryWithStatus[]
  viewDate: string
}) {
  const lateArrivals = entries.filter((e) => {
    if (!e.checkInAt || !e.shift_start) return false
    const shiftStart = parseShiftTime(viewDate, e.shift_start)
    if (!shiftStart) return false
    return new Date(e.checkInAt).getTime() - shiftStart.getTime() > LATE_THRESHOLD_MS
  })

  const earlyDepartures = entries.filter((e) => {
    if (!e.checkOutAt || !e.shift_end) return false
    const shiftEnd = parseShiftTime(viewDate, e.shift_end)
    if (!shiftEnd) return false
    return shiftEnd.getTime() - new Date(e.checkOutAt).getTime() > LATE_THRESHOLD_MS
  })

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary-600" />
        <h2 className="font-semibold text-neutral-900">Daily summary</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-3 rounded-lg bg-danger-50 border border-danger-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-danger-600" />
            <span className="text-sm font-medium text-danger-900">Missing check-in</span>
            <Badge variant="danger">{missingCheckIn.length}</Badge>
          </div>
          {missingCheckIn.length === 0 ? (
            <p className="text-sm text-danger-700">Everyone has checked in.</p>
          ) : (
            <ul className="space-y-1">
              {missingCheckIn.map((p) => (
                <li key={p.id} className="text-sm text-danger-800">
                  {p.name} {p.role ? `(${p.role})` : ''}
                  {p.shift_start ? <span className="text-danger-600 ml-1">— shift {p.shift_start}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-3 rounded-lg bg-warning-50 border border-warning-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning-600" />
            <span className="text-sm font-medium text-warning-900">Missing check-out</span>
            <Badge variant="warning">{missingCheckOut.length}</Badge>
          </div>
          {missingCheckOut.length === 0 ? (
            <p className="text-sm text-warning-700">No one is overdue.</p>
          ) : (
            <ul className="space-y-1">
              {missingCheckOut.map((p) => (
                <li key={p.id} className="text-sm text-warning-800">
                  {p.name} {p.role ? `(${p.role})` : ''}
                  {p.checkInAt ? (
                    <span className="text-warning-600 ml-1">— in at {formatTime(p.checkInAt)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-3 rounded-lg bg-success-50 border border-success-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success-600" />
            <span className="text-sm font-medium text-success-900">All good</span>
            <Badge variant="success">{allGood.length}</Badge>
          </div>
          {allGood.length === 0 ? (
            <p className="text-sm text-success-700">No completed check-ins yet.</p>
          ) : (
            <p className="text-sm text-success-700">
              {allGood.length} staff member{allGood.length === 1 ? '' : 's'} have completed check-in and check-out.
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg bg-primary-50 border border-primary-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-900">Late arrivals</span>
            <Badge variant="info">{lateArrivals.length}</Badge>
          </div>
          {lateArrivals.length === 0 ? (
            <p className="text-sm text-primary-700">Everyone was on time.</p>
          ) : (
            <ul className="space-y-1">
              {lateArrivals.map((p) => (
                <li key={p.id} className="text-sm text-primary-800">
                  {p.name} {p.role ? `(${p.role})` : ''}
                  {p.checkInAt ? (
                    <span className="text-primary-600 ml-1">— in at {formatTime(p.checkInAt)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-3 rounded-lg bg-neutral-100 border border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">Early departures</span>
            <Badge variant="neutral">{earlyDepartures.length}</Badge>
          </div>
          {earlyDepartures.length === 0 ? (
            <p className="text-sm text-neutral-600">No one left early.</p>
          ) : (
            <ul className="space-y-1">
              {earlyDepartures.map((p) => (
                <li key={p.id} className="text-sm text-neutral-700">
                  {p.name} {p.role ? `(${p.role})` : ''}
                  {p.checkOutAt ? (
                    <span className="text-neutral-500 ml-1">— out at {formatTime(p.checkOutAt)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  )
}
