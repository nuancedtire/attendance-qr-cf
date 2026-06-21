import { formatDateTime, relativeTime } from '#/utils/dateTime'
import { EmptyState } from '#/components/EmptyState'
import { Badge } from '#/components/Badge'

export type PresentStaff = {
  id: number
  name: string
  role: string | null
  check_in_at: string
}

export function WhoIsInSection({ present }: { present: PresentStaff[] }) {
  return (
    <section id="who-is-in" className="bg-white p-4 rounded-xl shadow-md border border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-neutral-900">Who is in</h2>
        <Badge variant="success">{present.length}</Badge>
      </div>
      {present.length === 0 ? (
        <EmptyState
          title="Nobody checked in"
          description="Check-ins will appear here once staff scan the QR code."
          icon="alert"
        />
      ) : (
        <ul className="divide-y divide-neutral-100">
          {present.map((s) => (
            <li key={s.id} className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="font-medium text-neutral-900">
                {s.name} {s.role ? <span className="text-neutral-500 font-normal">({s.role})</span> : ''}
              </span>
              <span className="text-sm text-neutral-500" title={formatDateTime(s.check_in_at)}>
                {relativeTime(s.check_in_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
