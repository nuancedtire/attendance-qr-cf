import { createContext, useContext } from 'react'

export interface AdminContextValue {
  authToken: string
  logout: () => void
  viewDate: string
  setViewDate: (date: string) => void
  today: string
}

export const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdminContext() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdminContext must be used within AdminContext.Provider')
  return ctx
}
