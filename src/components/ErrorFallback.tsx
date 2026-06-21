import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

export function ErrorFallback({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : 'Something went wrong'

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Oops</h1>
        <p className="text-neutral-600 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reset ? (
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try again
            </button>
          ) : null}
          <a
            href="/"
            className="px-4 py-2 bg-neutral-100 text-neutral-800 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  )
}
