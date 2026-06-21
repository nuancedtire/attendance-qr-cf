import { useState, useRef, useEffect } from 'react'
import { adminVerifyPin } from '#/utils/sessions.functions'

const AUTH_TOKEN_KEY = 'attendance-admin-token-v2'

export function usePersistentAdminAuth() {
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')

  // Try to resume existing session on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null
    if (saved) {
      setAuthToken(saved)
      // Don't verify — if token is expired, the next API call will fail
      // and the error handler will clear auth
      setAuthenticated(true)
    }
  }, [])

  const login = async (enteredPin: string) => {
    const { token } = await adminVerifyPin({ data: { pin: enteredPin } })
    setAuthToken(token)
    setAuthenticated(true)
    setPin('')
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    }
  }

  const logout = () => {
    setAuthenticated(false)
    setAuthToken(null)
    setPin('')
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  }

  return { authToken, authenticated, pin, setPin, login, logout }
}

export function useAutoDismiss(initial = '', durationMs = 5000) {
  const [message, setMessage] = useState(initial)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = (msg: string) => {
    setMessage(msg)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), durationMs)
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  return { message, show, clear: () => setMessage('') }
}
