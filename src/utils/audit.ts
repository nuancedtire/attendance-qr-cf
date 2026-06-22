import { getDb } from '#/db/client'
import { auditLog } from '#/db/schema'

export async function logAudit(event: string, details?: Record<string, unknown>, actor?: string) {
  const db = await getDb()
  await db.insert(auditLog).values({
    event,
    details: details ? JSON.stringify(details) : null,
    actor: actor ?? null,
  })
}


