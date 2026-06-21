import { Link } from '@tanstack/react-router'
import { Printer } from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/Button'

export function QrSection({
  today,
  onGenerate,
}: {
  today: string
  onGenerate: (date: string) => Promise<string>
}) {
  const [qrDate, setQrDate] = useState(today)
  const [qrUrl, setQrUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const dataUrl = await onGenerate(qrDate)
      setQrUrl(dataUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="qr-code" className="bg-white p-4 rounded-xl shadow-md border border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-neutral-900">QR code</h2>
        <Link
          to="/print-qr"
          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="w-full sm:w-auto">
          <label className="text-xs block text-neutral-500 mb-1">Date</label>
          <input
            type="date"
            className="w-full p-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            value={qrDate}
            onChange={(e) => setQrDate(e.target.value)}
          />
        </div>
        <Button onClick={generate} loading={loading} variant="secondary">
          Generate / refresh QR
        </Button>
      </div>
      {qrUrl && (
        <div className="mt-4">
          <img src={qrUrl} alt="QR code" className="mx-auto max-w-full" />
          <p className="text-center text-sm text-neutral-600 mt-2">
            Print this and place it on the notice board.
          </p>
        </div>
      )}
    </section>
  )
}
