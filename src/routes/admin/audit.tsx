import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAdminContext } from '#/routes/admin/-context'
import { adminGetDashboard } from '#/utils/sessions.functions'
import { AuditLogSection } from '#/routes/admin/-components/AuditLogSection'
import type { AuditEventItem } from '#/routes/admin/-components/AuditEvent'

type AuditDashboard = { audit: AuditEventItem[] }

export const Route = createFileRoute('/admin/audit')({
  component: AdminAudit,
})

function AdminAudit() {
  const { authToken, viewDate } = useAdminContext()
  const [audit, setAudit] = useState<AuditEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    adminGetDashboard({ data: { date: viewDate, authToken } })
      .then((d) => {
        if (!cancelled) setAudit(((d as AuditDashboard).audit as AuditEventItem[]) ?? [])
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load audit log')
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
      <div className="animate-pulse">
        <div className="h-96 bg-neutral-200 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-danger-50 text-danger-800 rounded-lg border border-danger-200">
        <p className="font-medium">Failed to load audit log</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <AuditLogSection audit={audit} />
    </div>
  )
}
