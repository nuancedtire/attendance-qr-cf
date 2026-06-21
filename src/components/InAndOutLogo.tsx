interface InAndOutLogoProps {
  /** Rendered height in px. Width scales automatically (aspect ratio 790:200). */
  height?: number
  /** Use the light fill for dark backgrounds. */
  dark?: boolean
  className?: string
}

/**
 * "IN & OUT" wordmark with the ampersand reimagined as a running figure.
 *
 * Letters are drawn as geometric strokes (no font dependency) so the mark
 * renders identically everywhere. The geometry is identical to the standalone
 * asset at /public/logo.svg — keep the two in sync.
 */
export function InAndOutLogo({ height = 80, dark = false, className }: InAndOutLogoProps) {
  const ink = dark ? '#f9fafb' : '#111827'
  const width = Math.round((height * 790) / 200)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 790 200"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="IN and OUT"
    >
      {/* Wordmark: geometric letterforms drawn as strokes */}
      <g fill="none" stroke={ink} strokeWidth={28} strokeLinecap="square" strokeLinejoin="miter">
        {/* I */}
        <path d="M34 64 V136" />
        {/* N */}
        <path d="M88 136 V64 L152 136 V64" />
        {/* O */}
        <ellipse cx="462" cy="100" rx="44" ry="36" />
        {/* U */}
        <path d="M560 64 V102 a34 34 0 0 0 68 0 V64" />
        {/* T */}
        <path d="M682 64 H750" />
        <path d="M716 64 V136" />
      </g>

      {/* Runner: chunky limbs with rounded joints */}
      <g fill="none" stroke={ink} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round">
        {/* torso */}
        <path d="M320 116 Q320 88 346 70" />
        {/* neck */}
        <path d="M346 70 L356 58" />
        {/* front arm */}
        <path d="M346 70 L376 84 L372 106" />
        {/* back arm */}
        <path d="M346 70 L318 82 L302 98" />
        {/* front leg (lifted, bent knee) */}
        <path d="M320 116 L354 138 L346 162" />
        {/* back leg (extended) */}
        <path d="M320 116 L292 140 L264 160" />
      </g>

      {/* Speed lines */}
      <g fill="none" stroke={ink} strokeWidth={11} strokeLinecap="round">
        <path d="M216 74 H244" />
        <path d="M204 98 H246" />
        <path d="M216 122 H242" />
      </g>

      {/* Head + cap */}
      <circle cx="358" cy="46" r="17" fill={ink} />
      <rect x="341" y="20" width="48" height="15" rx="6" fill={ink} transform="rotate(-16 365 27)" />
    </svg>
  )
}
