import type { D1Database } from '@cloudflare/workers-types'

// ponytail: lazy dynamic import keeps cloudflare:workers out of the client bundle.
// getDb() is only called inside createServerFn handlers (always async).
let _db: D1Database | undefined
let _dbPromise: Promise<D1Database> | undefined

export async function getDb(): Promise<D1Database> {
  if (_db) return _db
  if (!_dbPromise) {
    _dbPromise = import('cloudflare:workers').then(({ env }) => {
      const db = env.DB as D1Database | undefined
      if (!db) {
        throw new Error('D1 database binding "DB" not found. Check wrangler.jsonc.')
      }
      _db = db
      return db
    })
  }
  return _dbPromise
}
