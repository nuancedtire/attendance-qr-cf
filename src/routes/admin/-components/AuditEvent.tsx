import { useState } from 'react'
import { formatDateTime, formatTime, relativeTime } from '#/utils/dateTime'
import { Badge } from '#/components/Badge'

export type AuditEventItem = {
  id: number
  event: string
  details: Record<string, unknown> | null
  actor: string | null
  created_at: string
}

export const auditEventLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  checked_in: { label: 'Checked in', variant: 'success' },
  checked_out: { label: 'Checked out', variant: 'info' },
  checkin_undone: { label: 'Undo check-in', variant: 'warning' },
  checkout_undone: { label: 'Undo check-out', variant: 'warning' },
  manual_checkin: { label: 'Manual check-in', variant: 'info' },
  rota_uploaded: { label: 'Rota uploaded', variant: 'info' },
  adhoc_staff_added: { label: 'Ad-hoc staff added', variant: 'info' },
  roster_entry_updated: { label: 'Roster updated', variant: 'warning' },
  roster_entry_deleted: { label: 'Roster deleted', variant: 'danger' },
  admin_session_updated: { label: 'Session edited', variant: 'warning' },
  admin_session_deleted: { label: 'Session deleted', variant: 'danger' },
  admin_manual_checkin: { label: 'Admin check-in', variant: 'info' },
  auto_checkout_run: { label: 'Auto-checkout', variant: 'neutral' },
}

export function AuditEvent({ event }: { event: AuditEventItem }) {
  const [open, setOpen] = useState(false)
  const meta = auditEventLabels[event.event] ?? { label: event.event, variant: 'neutral' as const }
  const actorLabel = event.actor ?? 'system'
  const personName = event.details && typeof event.details.name === 'string' ? event.details.name : null
  const rawFallback = event.details && typeof event.details.raw === 'string' ? event.details.raw : null

  return (
    <li className="py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <span className="text-sm text-neutral-700">
          {personName || rawFallback || ''}
        </span>
        <span className="text-xs text-neutral-400 sm:ml-auto" title={formatDateTime(event.created_at)}>
          {relativeTime(event.created_at)} · {formatTime(event.created_at)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-xs text-neutral-500">by {actorLabel}</span>
        {event.details && (
          <button
            className="text-xs text-primary-600 hover:text-primary-700 underline"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Hide details' : 'Details'}
          </button>
        )}
      </div>
      {open && event.details && (
        <pre className="mt-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200 overflow-x-auto">
          {JSON.stringify(event.details, null, 2)}
        </pre>
      )}
    </li>
  )
}
