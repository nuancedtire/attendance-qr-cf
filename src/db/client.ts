import type { D1Database } from '@cloudflare/workers-types'
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './schema'

type Db = DrizzleD1Database<typeof schema>

let _drizzle: Db | undefined
let _drizzlePromise: Promise<Db> | undefined

export async function getDb(): Promise<Db> {
  if (_drizzle) return _drizzle
  if (!_drizzlePromise) {
    _drizzlePromise = import('cloudflare:workers').then(({ env }) => {
      const db = (env as { DB?: D1Database }).DB
      if (!db) throw new Error('D1 database binding "DB" not found. Check wrangler.jsonc.')
      _drizzle = drizzle(db, { schema })
      return _drizzle
    })
  }
  return _drizzlePromise
}
