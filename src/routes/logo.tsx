import { createFileRoute } from '@tanstack/react-router'
import { InAndOutLogo } from '#/components/InAndOutLogo'

export const Route = createFileRoute('/logo')({
  component: LogoPreview,
})

const sizes = [32, 48, 64, 80, 120, 200] as const

function LogoPreview() {
  return (
    <main className="min-h-screen bg-neutral-50 p-8 space-y-12">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-neutral-800 tracking-tight">Logo preview</h1>
        <p className="text-sm text-neutral-500">
          The standalone SVG is served at{' '}
          <a href="/logo.svg" target="_blank" rel="noopener noreferrer" className="underline">
            /logo.svg
          </a>
          {' '}— use that anywhere outside React.
        </p>
      </header>

      {/* Light backgrounds */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Light</h2>

        <div className="flex flex-col gap-6">
          {sizes.map((h) => (
            <div key={h} className="flex items-center gap-6">
              <span className="w-12 text-right text-xs text-neutral-400 tabular-nums">{h}px</span>
              <div className="bg-white border border-neutral-200 rounded-xl px-6 py-4 shadow-sm inline-flex">
                <InAndOutLogo height={h} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dark backgrounds */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Dark</h2>

        <div className="flex flex-col gap-6">
          {sizes.map((h) => (
            <div key={h} className="flex items-center gap-6">
              <span className="w-12 text-right text-xs text-neutral-400 tabular-nums">{h}px</span>
              <div className="bg-neutral-900 rounded-xl px-6 py-4 inline-flex">
                <InAndOutLogo height={h} dark />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Raw SVG file embed */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
          {'<img> tag (from /logo.svg)'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl px-6 py-4 shadow-sm inline-flex">
          <img src="/logo.svg" height={80} alt="In &amp; Out logo" />
        </div>
      </section>
    </main>
  )
}
