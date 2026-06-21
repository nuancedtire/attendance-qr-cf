import { User, Lock, ChevronRight } from 'lucide-react'

type IdentityBarProps = {
  staffId: number | null
  staffName: string | null
  staffRole: string | null
  isLocked: boolean
  onSelectClick: () => void
  onClear: () => void
}

/**
 * A clean, minimal bar showing the current staff identity.
 * When no identity is selected, it prompts the user to tap.
 * When an identity is selected, it shows name + role and a "Not you?" action.
 */
export function IdentityBar({
  staffId,
  staffName,
  staffRole,
  isLocked,
  onSelectClick,
  onClear,
}: IdentityBarProps) {
  // No identity selected — show prompt to identify
  if (staffId === null || !staffName) {
    return (
      <button
        type="button"
        onClick={onSelectClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
          bg-neutral-100 border border-neutral-200
          text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200
          transition-colors cursor-pointer"
      >
        <User className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium flex-1 text-left">Tap to identify yourself</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </button>
    )
  }

  return (
    <div
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
        bg-primary-50 border border-primary-200
        text-primary-800"
    >
      <User className="w-5 h-5 shrink-0 text-primary-600" />

      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold truncate block">
          {staffName}
          {staffRole ? (
            <span className="font-normal text-primary-600 ml-1">
              ({staffRole})
            </span>
          ) : null}
        </span>
      </div>

      {isLocked && (
        <span title="Identity locked with PIN">
          <Lock className="w-4 h-4 shrink-0 text-primary-500" />
        </span>
      )}

      <button
        type="button"
        onClick={onClear}
        className="shrink-0 text-xs font-medium text-primary-600
          hover:text-primary-800 underline underline-offset-2
          transition-colors cursor-pointer"
      >
        Not you?
      </button>
    </div>
  )
}
