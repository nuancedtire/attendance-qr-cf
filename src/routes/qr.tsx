import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import QRCode from 'qrcode'
import { QrCode } from 'lucide-react'
import { getQrTokenOrSeed } from '#/utils/rotas.functions'
import { todayDate } from '#/utils/dateTime'
import { ErrorFallback } from '#/components/ErrorFallback'
import { EmptyState } from '#/components/EmptyState'

export const Route = createFileRoute('/qr')({
  component: QrPage,
  errorComponent: ErrorFallback,
  notFoundComponent: () => <NotFound />,
  validateSearch: (s: Record<string, unknown>) => ({ date: (s.date as string) || todayDate() }),
  loaderDeps: ({ search }) => ({ date: search.date }),
  loader: async ({ deps }) => {
    return getQrTokenOrSeed({ data: { date: deps.date } })
  },
})

function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white">
      <EmptyState title="Page not found" description="This QR page cannot be found." />
    </main>
  )
}

function QrPage() {
  const { token } = Route.useLoaderData()
  const { date } = Route.useSearch()
  const navigate = useNavigate({ from: '/qr' })
  const [qrUrl, setQrUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsGenerating(true)
    setQrError(null)

    if (!token) {
      setQrError('No rota exists for this date. Upload a rota first before generating a QR code.')
      setIsGenerating(false)
      return
    }

    const url = `${window.location.origin}/?token=${token}`
    QRCode.toDataURL(url, { width: 600 })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrUrl(dataUrl)
          setIsGenerating(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrError('Could not generate QR code. Try a different date.')
          setIsGenerating(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function changeDate(newDate: string) {
    navigate({ search: (prev) => ({ ...prev, date: newDate }) })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-3xl font-bold mb-2">Scan to check in / out</h1>
      <p className="text-neutral-600 mb-4">Place this QR code on the notice board</p>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="qr-date" className="text-sm font-medium text-neutral-700">
          Date:
        </label>
        <input
          id="qr-date"
          type="date"
          className="border border-neutral-300 rounded-lg p-2 text-neutral-900 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          value={date}
          onChange={(e) => changeDate(e.target.value)}
        />
      </div>
      {qrError ? (
        <EmptyState title="QR generation failed" description={qrError} icon="alert" />
      ) : qrUrl && !isGenerating ? (
        <img src={qrUrl} alt="QR code" className="w-full max-w-md rounded-lg shadow-md" />
      ) : (
        <div className="w-96 h-96 max-w-full bg-neutral-100 rounded-lg flex flex-col items-center justify-center text-neutral-400 animate-pulse">
          <QrCode className="w-16 h-16 mb-3" />
          <span className="text-sm font-medium">Generating QR…</span>
        </div>
      )}
      <p className="mt-8 text-sm text-neutral-500">
        Valid for {date} only.
      </p>
    </main>
  )
}
