import { useState, useCallback } from 'react'

/**
 * Simple loading-state tracker for async operations.
 * Returns a `loading` record keyed by operation name and a
 * `withLoading(key, fn)` wrapper that sets the key while fn runs.
 */
export function useLoading() {
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const withLoading = useCallback(
    async <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
      setLoading((prev) => ({ ...prev, [key]: true }))
      try {
        return await fn()
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }))
      }
    },
    [],
  )

  return { loading, withLoading }
}
