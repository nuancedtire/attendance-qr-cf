import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

type ConfirmDialogState = {
  title: string
  message: string
  confirmLabel: string
  confirmVariant: 'danger' | 'warning'
  onConfirm: () => Promise<void> | void
} | null

type ConfirmDialogProps = {
  state: ConfirmDialogState
  onClose: () => void
}

export function ConfirmDialog({ state, onClose }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  if (!state) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await state.onConfirm()
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={() => !loading && onClose()} />
      {/* card */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg shrink-0 ${
            state.confirmVariant === 'danger'
              ? 'bg-danger-100 text-danger-600'
              : 'bg-warning-100 text-warning-600'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{state.title}</h3>
            <p className="text-sm text-neutral-600 mt-1">{state.message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={state.confirmVariant}
            loading={loading}
            onClick={handleConfirm}
          >
            {state.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
