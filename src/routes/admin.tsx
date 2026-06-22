import { useState } from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'
import { AppSidebar } from '#/routes/admin/-components/AppSidebar'
import { AdminContext, type AdminContextValue } from '#/routes/admin/-context'
import { usePersistentAdminAuth, useAutoDismiss } from '#/routes/admin/-hooks'
import { useLoading } from '#/hooks/useLoading'
import { ErrorFallback } from '#/components/ErrorFallback'
import { EmptyState } from '#/components/EmptyState'
import { Button } from '#/components/Button'
import { Badge } from '#/components/Badge'
import { CalendarDays, ChevronLeft, ChevronRight, Lock, Inbox } from 'lucide-react'
import { formatDate, addDays } from '#/utils/dateTime'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
  errorComponent: ErrorFallback,
  notFoundComponent: () => <NotFound />,
  loader: async () => {
    return { date: new Date().toISOString().slice(0, 10) }
  },
})

function NotFound() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <EmptyState title="Page not found" description="This admin page cannot be found." />
    </main>
  )
}

function AdminLayout() {
  const { date: today } = Route.useLoaderData()
  const { authToken, authenticated, pin, setPin, login, logout } = usePersistentAdminAuth()
  const { message, show } = useAutoDismiss()
  const { loading, withLoading } = useLoading()
  const [viewDate, setViewDate] = useState(today)

  const isToday = viewDate === today

  // ─── PIN login gate ──────────────────────────────────────────────
  if (!authenticated) {
    const handleUnlock = async () => {
      await withLoading('unlock', async () => login(pin)).catch((err) =>
        show(err instanceof Error ? err.message : 'Invalid PIN'),
      )
    }

    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-4 shadow-md">
              <Inbox className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">InOut Admin</h1>
            <p className="text-sm text-neutral-500 mt-1">Enter your PIN to continue</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2" htmlFor="pin-input">
              Admin PIN
            </label>
            <input
              id="pin-input"
              type="password"
              inputMode="numeric"
              placeholder="••••"
              aria-label="Admin PIN"
              className="w-full px-4 py-3 text-lg tracking-widest border border-neutral-300 rounded-xl mb-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-center"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') await handleUnlock()
              }}
            />
            <Button fullWidth loading={loading['unlock']} onClick={handleUnlock}>
              Unlock
            </Button>
            {message && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-danger-50 rounded-lg border border-danger-100">
                <Lock className="w-4 h-4 text-danger-600 shrink-0" />
                <p className="text-sm text-danger-700">{message}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  if (!authToken) return null

  // ─── Context value for child routes ───────────────────────────────
  const contextValue: AdminContextValue = {
    authToken,
    logout,
    viewDate,
    setViewDate,
    today,
  }

  return (
    <AdminContext.Provider value={contextValue}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full min-h-svh bg-neutral-50">
          {/* Top bar: sidebar trigger, date picker, logout */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-20">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-600 shrink-0" />
              <button
                aria-label="Previous day"
                className="p-1 rounded hover:bg-neutral-100 text-neutral-500"
                onClick={() => setViewDate(addDays(viewDate, -1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                aria-label="Select date"
                className="p-2 border border-neutral-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                value={viewDate}
                onChange={(e) => setViewDate(e.target.value)}
              />
              <button
                aria-label="Next day"
                className="p-1 rounded hover:bg-neutral-100 text-neutral-500"
                onClick={() => setViewDate(addDays(viewDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {!isToday && (
                <Button variant="ghost" size="sm" onClick={() => setViewDate(today)}>
                  Today
                </Button>
              )}
            </div>
            <Badge variant={isToday ? 'success' : 'neutral'}>
              {isToday ? 'Today' : formatDate(viewDate)}
            </Badge>
            <div className="flex-1" />
            <button
              className="text-sm text-neutral-600 hover:text-neutral-900 underline flex items-center gap-1 shrink-0"
              onClick={logout}
            >
              <Lock className="w-3.5 h-3.5" />
              Lock
            </button>
          </div>
          {/* Page content */}
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </AdminContext.Provider>
  )
}
