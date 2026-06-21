const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const data = [
  ['Name', 'Shift', 'Notes'],
  ['Tier A', '', ''],
  ['Dr Sharma', '0800-1800', 'Consultant'],
  ['Dr Fazeen', '13:00-23:45', 'Registrar'],
  ['Dr Ahmed', '08-1800', 'Registrar'],
  ['Tier B', '', ''],
  ['Nurse Jones', '08:00-20:00', ''],
  ['Nurse Patel', '20:00-08:00', 'Nights'],
  ['HCA Brown', '08:00-14:00', ''],
]

const ws = XLSX.utils.aoa_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Rota')

const out = path.join(__dirname, '..', 'sample-rota.xlsx')
XLSX.writeFile(wb, out)
console.log('Created', out)
