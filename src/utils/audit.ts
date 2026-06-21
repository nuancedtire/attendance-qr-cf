import { getDb } from '#/db/client'

export async function logAudit(event: string, details?: Record<string, unknown>, actor?: string) {
  const db = await getDb()
  await db
    .prepare('INSERT INTO audit_log (event, details, actor) VALUES (?, ?, ?)')
    .bind(event, details ? JSON.stringify(details) : null, actor ?? null)
    .run()
}

export async function getRecentAudit(limit = 100) {
  const db = await getDb()
  const result = await db
    .prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT ?')
    .bind(limit)
    .all<{ id: number; event: string; details: string | null; actor: string | null; created_at: string }>()
  return result.results ?? []
}
