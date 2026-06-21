import { X } from 'lucide-react'

export function MessageBanner({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null
  return (
    <div className="p-3 bg-warning-100 text-warning-900 rounded-lg border border-warning-200 flex justify-between items-center gap-3">
      <span>{message}</span>
      <button className="text-warning-800 hover:text-warning-900 font-bold" onClick={onClose} aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
