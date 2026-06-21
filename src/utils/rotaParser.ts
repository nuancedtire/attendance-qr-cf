import * as XLSX from 'xlsx'

export interface RotaColumnConfig {
  nameHeader?: string
  roleHeader?: string
  shiftHeader?: string
}

export interface ParsedEntry {
  name: string
  role: string | null
  shiftStart: string | null
  shiftEnd: string | null
  rawShift: string
}

function getText(cell: unknown): string {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'string') return cell.trim()
  if (typeof cell === 'number') return String(cell)
  if (typeof cell === 'object' && 'w' in cell && typeof cell.w === 'string') return cell.w.trim()
  if (typeof cell === 'object' && 'v' in cell) return String(cell.v).trim()
  return String(cell).trim()
}

function looksLikeTier(value: string): boolean {
  // Actual NHS role groupings — not "Tier A" style labels
  return /^(Consultants?|Registrars?|Nurses?|HCAs?|ANPs?|ENPs?|Doctors?|Medics?|Allied Health|Admin|Support|Physiotherapists?|Pharmacists?|Radiographers?|Paramedics?|OTs?|SALTs?|Midwife|Midwives|Porters?|Domestics?|Catering|Security|Phlebotomists?|Healthcare Scientists?|Physician Associates?|Anaesthetists?|Surgeons?|Psychologists?|Social Workers?)$/i.test(value)
}

function looksLikeName(value: string): boolean {
  // At least two alphabetic words, e.g. "Dr Fazeen", "Nurse Jones"
  return /^[A-Za-z]+\.?\s+[A-Za-z\-'.]+$/.test(value) && value.length > 3
}

function isTierGroup(value: string): boolean {
  return /^Tier\s+[A-Z0-9]+$/i.test(value)
}

function looksLikeHeader(value: string): boolean {
  return /^(Name|Shift|Role|Date|Notes|Tier)$/i.test(value)
}

function parseShift(raw: string): { start: string | null; end: string | null } {
  const cleaned = raw.replace(/\s+/g, '').replace(/[\u2013\u2014]/g, '-')
  const match = cleaned.match(/^(\d{1,2})[:\.]?(\d{2})?-(\d{1,2})[:\.]?(\d{2})?$/)
  if (!match) return { start: null, end: null }

  const [, startH, startM = '00', endH, endM = '00'] = match
  const start = `${startH.padStart(2, '0')}:${startM}`
  const end = `${endH.padStart(2, '0')}:${endM}`
  return { start, end }
}

export function parseRota(
  buffer: ArrayBuffer,
  config: RotaColumnConfig = {},
  fileType?: 'xlsx' | 'csv',
): ParsedEntry[] {
  let workbook: XLSX.WorkBook

  if (fileType === 'csv') {
    const text = new TextDecoder().decode(buffer)
    workbook = XLSX.read(text, { type: 'string' })
  } else {
    workbook = XLSX.read(buffer, { type: 'array' })
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1, defval: '' })

  const nameHeader = config.nameHeader ?? 'Name'
  const roleHeader = config.roleHeader
  const shiftHeader = config.shiftHeader ?? 'Shift'

  // First try header-row detection
  let headerRow = -1
  let nameCol = -1
  let shiftCol = -1
  let roleCol = -1
  // ponytail: scan first 10 rows for header row with column names
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i]
    if (!Array.isArray(row)) continue
    const texts = row.map(getText)
    const nameIdx = texts.findIndex((t) => t.toLowerCase() === nameHeader.toLowerCase())
    const shiftIdx = texts.findIndex((t) => t.toLowerCase() === shiftHeader.toLowerCase())

    if (nameIdx !== -1) {
      headerRow = i
      nameCol = nameIdx
      shiftCol = shiftIdx
      // Auto-detect role column: use configured header, or fallback to "Role"/"Notes"
      roleCol = roleHeader
        ? texts.findIndex((t) => t.toLowerCase() === roleHeader.toLowerCase())
        : texts.findIndex((t) => /^(role|notes)$/i.test(t))
      break
    }
  }

  const entries: ParsedEntry[] = []
  let currentRole: string | null = null

  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!Array.isArray(row) || row.length === 0) continue

    const cells = row.map(getText)
    const first = cells[0] ?? ''

    // Skip blank rows
    if (cells.every((c) => !c)) continue

    // Section header (Consultants, Nurses, etc.)
    if (looksLikeTier(first)) {
      currentRole = first
      continue
    }

    // Skip tier grouping labels (Tier A, Tier B)
    if (isTierGroup(first)) continue

    // Skip rows that look like headers repeated
    if (cells.some(looksLikeHeader)) continue

    let name: string
    let rawShift: string
    let explicitRole: string | null = null

    if (nameCol !== -1 && cells.length > nameCol) {
      name = cells[nameCol]
      rawShift = shiftCol !== -1 && cells.length > shiftCol ? cells[shiftCol] : ''
      explicitRole = roleCol !== -1 && cells.length > roleCol ? cells[roleCol] : null
    } else {
      // Fallback: assume first column is name, second is shift
      name = cells[0]
      rawShift = cells[1] ?? ''
    }

    if (!name || !looksLikeName(name)) continue

    const { start, end } = parseShift(rawShift)
    entries.push({
      name,
      role: explicitRole || currentRole,
      shiftStart: start,
      shiftEnd: end,
      rawShift,
    })
  }

  return entries
}
