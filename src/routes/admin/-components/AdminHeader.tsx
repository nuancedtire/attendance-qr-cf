import { Badge } from '#/components/Badge'
import { Lock, ShieldCheck } from 'lucide-react'

export function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-7 h-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-neutral-900">Admin</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="success">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success-600" />
            Unlocked
          </span>
        </Badge>
        <button
          className="text-sm text-neutral-600 hover:text-neutral-900 underline flex items-center gap-1"
          onClick={onLogout}
        >
          <Lock className="w-3.5 h-3.5" />
          Lock
        </button>
      </div>
    </div>
  )
}
