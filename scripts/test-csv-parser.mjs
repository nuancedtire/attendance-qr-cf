import { parseRota } from '../src/utils/rotaParser.ts'
import fs from 'fs'

const buf = fs.readFileSync('./sample-rota.csv')
console.table(parseRota(buf.buffer))
