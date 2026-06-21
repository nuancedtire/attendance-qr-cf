const SECTIONS = [
  ['#qr-code', 'QR'],
  ['#rota-staff', 'Rota & Staff'],
  ['#who-is-in', "Who's In"],
  ['#roster', 'Roster'],
  ['#sessions', 'Sessions'],
  ['#weekly-rollup', 'Hours'],
  ['#audit-log', 'Audit'],
] as const

export function SectionNav() {
  return (
    <nav className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur border-b border-neutral-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-2 overflow-x-auto">
      <ul className="flex gap-1 text-sm whitespace-nowrap min-w-max">
        {SECTIONS.map(([href, label]) => (
          <li key={href}>
            <a
              href={href}
              className="block px-3 py-1.5 rounded-lg text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
