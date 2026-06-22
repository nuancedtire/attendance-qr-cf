import { formatDateTime, relativeTime } from '#/utils/dateTime'
import { EmptyState } from '#/components/EmptyState'
import { Card } from '#/components/Card'
import { Badge } from '#/components/Badge'

export type PresentStaff = {
  id: number
  name: string
  role: string | null
  check_in_at: string
}

const AVATAR_COLORS = [
  'bg-primary-100 text-primary-700',
  'bg-success-100 text-success-700',
  'bg-warning-100 text-warning-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function WhoIsInSection({ present }: { present: PresentStaff[] }) {
  return (
    <Card
      title="Who is in"
      action={<Badge variant="success">{present.length} present</Badge>}
    >
      {present.length === 0 ? (
        <EmptyState
          title="Nobody checked in"
          description="Check-ins will appear here once staff scan the QR code."
          icon="alert"
        />
      ) : (
        <ul className="divide-y divide-neutral-100 -mx-4 -mb-4">
          {present.map((s) => (
            <li key={s.id} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${getAvatarColor(s.name)}`}
                aria-hidden="true"
              >
                {getInitials(s.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 truncate">{s.name}</p>
                {s.role && (
                  <p className="text-xs text-neutral-500 truncate">{s.role}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-neutral-500" title={formatDateTime(s.check_in_at)}>
                  {relativeTime(s.check_in_at)}
                </p>
                <p className="text-xs text-success-600 font-medium">checked in</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
