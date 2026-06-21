import { RotateCcw } from 'lucide-react'

export function RefreshError({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (!error) return null
  return (
    <div className="p-4 bg-danger-50 text-danger-800 rounded-lg border border-danger-200 flex justify-between items-start gap-3">
      <div>
        <p className="font-medium">Failed to load dashboard data</p>
        <p className="text-sm">{error}</p>
      </div>
      <button
        className="text-sm font-bold text-danger-700 hover:text-danger-800 whitespace-nowrap flex items-center gap-1"
        onClick={onRetry}
      >
        <RotateCcw className="w-4 h-4" />
        Retry
      </button>
    </div>
  )
}
