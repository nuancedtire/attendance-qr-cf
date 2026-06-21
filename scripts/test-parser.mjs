import { parseRota } from '../src/utils/rotaParser.ts'
import fs from 'fs'

const buf = fs.readFileSync('./sample-rota.xlsx')
const result = parseRota(buf.buffer)
console.log('Parsed', result.length, 'entries:')
console.table(result)
