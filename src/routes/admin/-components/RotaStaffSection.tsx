import { useState, useRef } from 'react'
import { Button } from '#/components/Button'
import { formatDate } from '#/utils/dateTime'
import { Upload, UserPlus } from 'lucide-react'

export function RotaStaffSection({
  onUpload,
  onAdd,
  uploadLoading,
  addLoading,
  date,
}: {
  onUpload: (file: File) => Promise<void> | void
  onAdd: (form: FormData) => Promise<void> | void
  uploadLoading: boolean
  addLoading: boolean
  date: string
}) {
  const [tab, setTab] = useState<'upload' | 'add'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return
    await onUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section id="rota-staff" className="bg-white p-4 rounded-xl shadow-md border border-neutral-200">
      <div className="flex gap-1 mb-3 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'upload'
              ? 'bg-primary-100 text-primary-700'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload rota
        </button>
        <button
          onClick={() => setTab('add')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'add'
              ? 'bg-primary-100 text-primary-700'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add staff
        </button>
      </div>

      {tab === 'upload' ? (
        <div>
          <p className="text-sm text-neutral-500 mb-1">for {formatDate(date)}</p>
          <p className="text-xs text-neutral-400 mb-3">
            Supports the allocation sheet format (.xlsx) or a simple CSV/Excel with Name, Role, Shift columns.{' '}
            <a href="/example-allocation-filled.xlsx" download className="text-primary-600 hover:underline">Download example</a>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="w-full mb-3 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
          />
          <Button onClick={handleUpload} loading={uploadLoading} fullWidth>
            Upload
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onAdd(new FormData(e.currentTarget))
            e.currentTarget.reset()
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          <input name="name" placeholder="Name" required aria-label="Name" className="p-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200" />
          <input name="role" placeholder="Role" aria-label="Role" className="p-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200" />
          <input name="shiftStart" placeholder="Shift start (HH:MM)" aria-label="Shift start" className="p-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200" />
          <input name="shiftEnd" placeholder="Shift end (HH:MM)" aria-label="Shift end" className="p-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200" />
          <div className="sm:col-span-2">
            <Button type="submit" fullWidth loading={addLoading}>
              Add
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
