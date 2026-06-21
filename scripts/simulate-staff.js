#!/usr/bin/env node
/**
 * Seed the local D1 database with a realistic number of staff and sessions
 * for load testing / UI simulation.
 *
 * Usage:
 *   node scripts/simulate-staff.js [count]
 *
 * Default count: 60 staff. ~80% get a check-in, ~60% of those also check out.
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const COUNT = Number(process.argv[2]) || 60

const DB_PATH = path.resolve(
  '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/82898e5c694c594f82d1cb27d406f7bc2576d96c3d76df608056d33d8cf32b89.sqlite',
)

if (!existsSync(DB_PATH)) {
  console.error('Local D1 database not found at', DB_PATH)
  console.error('Start the dev server first so wrangler creates the local DB.')
  process.exit(1)
}

function todayUk() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

const firstNames = [
  'James', 'Maria', 'Robert', 'Sarah', 'Michael', 'Emma', 'William', 'Olivia', 'David', 'Ava',
  'Richard', 'Isabella', 'Joseph', 'Sophia', 'Thomas', 'Mia', 'Charles', 'Charlotte', 'Daniel', 'Amelia',
  'Matthew', 'Harper', 'Anthony', 'Evelyn', 'Mark', 'Abigail', 'Donald', 'Emily', 'Steven', 'Elizabeth',
  'Andrew', 'Mila', 'Paul', 'Ella', 'Joshua', 'Avery', 'Kenneth', 'Sofia', 'Kevin', 'Camila',
  'Brian', 'Aria', 'George', 'Scarlett', 'Timothy', 'Victoria', 'Ronald', 'Madison', 'Edward', 'Luna',
  'Jason', 'Grace', 'Jeffrey', 'Chloe', 'Ryan', 'Penelope', 'Jacob', 'Layla', 'Gary', 'Riley',
  'Nicholas', 'Zoey', 'Eric', 'Nora', 'Jonathan', 'Lily', 'Stephen', 'Eleanor', 'Larry', 'Hannah',
]

const surnames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
]

const roles = [
  { name: 'Consultant', prob: 0.1 },
  { name: 'Registrar', prob: 0.25 },
  { name: 'Nurse', prob: 0.35 },
  { name: 'HCA', prob: 0.2 },
  { name: 'ANP', prob: 0.05 },
  { name: 'Admin', prob: 0.05 },
]

const shifts = [
  { start: '08:00', end: '16:00' },
  { start: '08:00', end: '18:00' },
  { start: '09:00', end: '17:00' },
  { start: '12:00', end: '20:00' },
  { start: '13:00', end: '23:00' },
  { start: '19:00', end: '07:00' },
  { start: '20:00', end: '08:00' },
]

function pickRole() {
  const r = Math.random()
  let cum = 0
  for (const role of roles) {
    cum += role.prob
    if (r <= cum) return role.name
  }
  return roles[roles.length - 1].name
}

function pickShift() {
  return shifts[Math.floor(Math.random() * shifts.length)]
}

function randomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  const last = surnames[Math.floor(Math.random() * surnames.length)]
  const title = Math.random() > 0.5 ? 'Dr' : Math.random() > 0.5 ? 'Nurse' : ''
  return title ? `${title} ${first} ${last}` : `${first} ${last}`
}

function randomIsoBetween(start, end) {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return new Date(startMs + Math.random() * (endMs - startMs)).toISOString()
}

function run(sql) {
  return execSync(`sqlite3 "${DB_PATH}" "${sql.replace(/"/g, '""')}"`, { encoding: 'utf-8' })
}

function runFile(path) {
  return execSync(`sqlite3 "${DB_PATH}" < "${path}"`, { encoding: 'utf-8' })
}

const date = todayUk()
console.log(`Seeding ${COUNT} staff for ${date}...`)

// Ensure rota exists for today with a stable test token
run(`
INSERT OR IGNORE INTO rotas (date, token) VALUES ('${date}', 'test-token-123');
`)

const rotaRow = run(`SELECT id FROM rotas WHERE date = '${date}';`).trim()
if (!rotaRow) {
  console.error('Could not find/create rota for', date)
  process.exit(1)
}
const rotaId = rotaRow

// Clear existing entries/sessions for this rota
run(`DELETE FROM roster_entries WHERE rota_id = ${rotaId};`)

// Build inserts
const values = []
for (let i = 0; i < COUNT; i++) {
  const name = randomName()
  const role = pickRole()
  const shift = pickShift()
  values.push(`(${rotaId}, '${name.replace(/'/g, "''")}', '${role}', '${shift.start}', '${shift.end}', 'rota')`)
}

const insertSql = `
INSERT INTO roster_entries (rota_id, name, role, shift_start, shift_end, source)
VALUES ${values.join(',\n')};
`
run(insertSql)

// Add sessions
const entriesResult = run(`SELECT id FROM roster_entries WHERE rota_id = ${rotaId};`).trim().split('\n')
const sessionValues = []
const now = new Date()
const dayStart = new Date(`${date}T00:00:00+01:00`).toISOString()
const dayEnd = new Date(`${date}T23:59:59+01:00`).toISOString()

for (const entryId of entriesResult) {
  if (Math.random() > 0.8) continue // 20% no-show
  const checkInAt = randomIsoBetween(dayStart, new Date(now.getTime() - 30 * 60 * 1000).toISOString())
  let checkOutAt = null
  if (Math.random() > 0.4) {
    checkOutAt = randomIsoBetween(checkInAt, now.toISOString())
  }
  sessionValues.push(`(${entryId}, '${checkInAt}', ${checkOutAt ? `'${checkOutAt}'` : 'NULL'}, 'test-token-123', ${checkOutAt ? `'test-token-123'` : 'NULL'})`)
}

if (sessionValues.length > 0) {
  run(`
INSERT INTO sessions (roster_entry_id, check_in_at, check_out_at, qr_token_in, qr_token_out)
VALUES ${sessionValues.join(',\n')};
`)
}

// Add audit events
run(`
INSERT INTO audit_log (event, details, actor)
VALUES ('rota_uploaded', '{"date":"${date}","staffCount":${COUNT},"simulated":true}', 'simulator');
`)

console.log(`Done. ${COUNT} roster entries, ${sessionValues.length} sessions.`)
