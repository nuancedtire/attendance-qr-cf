import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getTodayRoster } from '#/utils/rotas.functions'
import { getStaffHistory } from '#/utils/sessions.functions'
import { formatDateTime } from '#/utils/dateTime'
import { ErrorFallback } from '#/components/ErrorFallback'
import { EmptyState } from '#/components/EmptyState'
import { Card } from '#/components/Card'
import { Badge } from '#/components/Badge'
import { IdentityBar } from '#/components/IdentityBar'
import { Button } from '#/components/Button'
import { useStaffIdentity } from '#/routes/-hooks'
import { Clock, X, Lock, User, ArrowLeft } from 'lucide-react'
type SessionRow = {
  date: string
  shift_start: string | null
  shift_end: string | null
  check_in_at: string
  check_out_at: string
  hours: number | null
}

export const Route = createFileRoute('/history')({
  component: HistoryPage,
  errorComponent: ErrorFallback,
  validateSearch: (s: Record<string, unknown>) => ({ token: (s.token as string) || '' }),
  loader: async () => {
    return getTodayRoster()
  },
})

function HistoryPage() {
  const { entries } = Route.useLoaderData()
  const { token } = Route.useSearch()

  const {
    staffId, isLocked, showPinEntry, showIdentityPicker,
    selectIdentity, clearIdentity, lockIdentity, unlockIdentity,
    setShowPinEntry, setShowIdentityPicker,
  } = useStaffIdentity(entries as { id: number; name: string; role: string | null }[])

  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinMode, setPinMode] = useState<'lock' | 'unlock'>('unlock')
  const [pinError, setPinError] = useState('')

  const currentStaff = entries.find((e) => e.id === staffId) ?? null

  useEffect(() => {
    if (staffId && token) {
      setLoading(true)
      setLoadError(null)
      getStaffHistory({ data: { rosterEntryId: staffId, token } })
        .then((r) => setSessions(r.rows))
        .catch((e) => {
          setLoadError(e instanceof Error ? e.message : 'Failed to load history')
          setSessions([])
        })
        .finally(() => setLoading(false))
    }
  }, [staffId, token])

  // ── PIN modal handlers ────────────────────────────────────────

  const openPinForLock = () => { setPinMode('lock'); setPinInput(''); setPinError(''); setShowPinEntry(true) }
  const openPinForUnlock = () => { setPinMode('unlock'); setPinInput(''); setPinError(''); setShowPinEntry(true) }

  const handlePinSubmit = () => {
    if (pinMode === 'lock') {
      if (lockIdentity(pinInput)) {
        setShowPinEntry(false)
      } else {
        setPinError('Enter a 4-digit PIN')
      }
    } else {
      if (unlockIdentity(pinInput)) {
        setShowPinEntry(false)
      } else {
        setPinError('Wrong PIN')
      }
    }
  }

  // ── No token state ────────────────────────────────────────────

  if (!token) {
    return (
      <main className="max-w-md mx-auto p-6">
        <EmptyState
          title="Scan the QR code"
          description="Scan the daily QR code on the notice board to view your check-in history."
          icon="scan"
        />
        <div className="mt-4 text-center">
          <Link
            to="/"
            search={{ token: '' }}
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            &larr; Back to check-in
          </Link>
        </div>
      </main>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────

  return (
    <main className="max-w-md mx-auto p-4 sm:p-6 flex flex-col gap-5 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 pt-4">
        <Link
          to="/"
          search={{ token }}
          className="p-1 -ml-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Clock className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-neutral-900">Your History</h1>
      </div>

      {/* Identity bar */}
      <IdentityBar
        staffId={staffId}
        staffName={currentStaff?.name ?? null}
        staffRole={currentStaff?.role ?? null}
        isLocked={isLocked}
        onSelectClick={() => setShowIdentityPicker(true)}
        onClear={isLocked ? openPinForUnlock : () => clearIdentity()}
      />

      {/* Lock identity prompt */}
      {staffId && !isLocked && (
        <button
          type="button"
          onClick={openPinForLock}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm
            text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          Lock your identity with a PIN
        </button>
      )}

      {/* No staff selected prompt */}
      {!staffId && (
        <EmptyState
          title="Select your name"
          description="Tap your name above to view your check-in history."
          icon={<User className="w-6 h-6" />}
        />
      )}

      {/* Session history */}
      {staffId && (
        <>
          {loadError && (
            <div className="p-3 rounded-lg text-sm bg-danger-100 text-danger-800 border border-danger-200">
              {loadError}
            </div>
          )}
          {loading ? (
            <div className="text-center py-8 text-neutral-500 text-sm">Loading...</div>
          ) : sessions.length === 0 ? (
            <EmptyState
              title="No sessions found"
              description="Your check-in history will appear here once you've checked in and out."
              icon="calendar"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((s, i) => {
                const dateLabel = (() => {
                  try {
                    return new Intl.DateTimeFormat('en-GB', {
                      timeZone: 'Europe/London',
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    }).format(new Date(s.date + 'T00:00:00'))
                  } catch {
                    return s.date
                  }
                })()

                const shiftLabel = s.shift_start && s.shift_end
                  ? `${s.shift_start.slice(0, 5)}–${s.shift_end.slice(0, 5)}`
                  : s.shift_start
                    ? s.shift_start.slice(0, 5)
                    : '–'

                const hoursLabel = s.hours != null
                  ? `${Number(s.hours).toFixed(2)}h`
                  : '–'

                return (
                  <Card key={i}>
                    <div className="flex flex-col gap-2">
                      {/* Date + hours */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-800">
                          {dateLabel}
                        </span>
                        <Badge variant="info">{hoursLabel}</Badge>
                      </div>

                      {/* Shift */}
                      <div className="text-xs text-neutral-500">
                        Shift: {shiftLabel}
                      </div>

                      {/* Times */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                        <div>
                          <span className="text-neutral-400">In: </span>
                          {formatDateTime(s.check_in_at)}
                        </div>
                        <div>
                          <span className="text-neutral-400">Out: </span>
                          {formatDateTime(s.check_out_at)}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Identity picker modal ─────────────────────────────── */}
      {showIdentityPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="identity-picker-title"
          onClick={() => setShowIdentityPicker(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm
              max-h-[70vh] overflow-hidden shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-300" />
            </div>
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <h2 id="identity-picker-title" className="text-lg font-semibold text-neutral-900">Who are you?</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowIdentityPicker(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => { selectIdentity(entry.id); setShowIdentityPicker(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-neutral-50 transition-colors border-b border-neutral-50
                    ${entry.id === staffId ? 'bg-primary-50' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600
                    flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{entry.name}</p>
                    {entry.role && <p className="text-xs text-neutral-500">{entry.role}</p>}
                  </div>
                  {entry.id === staffId && <Badge variant="info">You</Badge>}
                </button>
              ))}
            </div>
            {staffId && (
              <div className="px-4 py-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowIdentityPicker(false)
                    if (isLocked) openPinForUnlock()
                    else clearIdentity()
                  }}
                  className="w-full text-sm text-neutral-500 hover:text-danger-600 py-1.5 transition-colors"
                >
                  Clear my identity
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PIN entry modal ────────────────────────────────────── */}
      {showPinEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-modal-title"
          onClick={() => setShowPinEntry(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl w-full max-w-xs mx-4 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary-600" />
              <h2 id="pin-modal-title" className="text-lg font-semibold text-neutral-900">
                {pinMode === 'lock' ? 'Lock identity' : 'Unlock identity'}
              </h2>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              {pinMode === 'lock'
                ? 'Set a 4-digit PIN to prevent others from checking in as you.'
                : 'Enter your PIN to change your identity.'}
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePinSubmit() }}
              className="w-full p-3 border border-neutral-300 rounded-lg text-center text-2xl tracking-widest
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200 mb-3
                placeholder:text-neutral-300"
              autoFocus
            />
            {pinError && (
              <p className="text-sm text-danger-600 mb-3">{pinError}</p>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowPinEntry(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={pinInput.length !== 4}
                onClick={handlePinSubmit}
              >
                {pinMode === 'lock' ? 'Lock' : 'Unlock'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
