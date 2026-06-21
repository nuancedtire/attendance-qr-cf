/**
 * InAndOutLogo
 *
 * The ampersand (&) forms the torso of a running figure.
 * A circular head + flat-brim cap sit above it.
 * Stroke arms and legs extend from the body.
 * Three speed lines appear to the left of the figure.
 * "IN" sits left, "OUT" sits right, in heavy black type.
 *
 * The same artwork lives as a standalone SVG at /public/logo.svg
 * for use outside React (emails, print, etc.).
 *
 * Props:
 *   height   — rendered height in px; width scales proportionally (default 80)
 *   dark     — invert to white fill for dark backgrounds (default false)
 *   className — forwarded to the <svg> element
 */

const VW = 640
const VH = 180

interface InAndOutLogoProps {
  height?: number
  dark?: boolean
  className?: string
}

export function InAndOutLogo({ height = 80, dark = false, className }: InAndOutLogoProps) {
  const ink = dark ? '#ffffff' : '#111827'
  const font = "'Arial Black', 'Arial Bold', Arial, sans-serif"

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      height={height}
      width={Math.round((height * VW) / VH)}
      aria-label="In &amp; Out"
      role="img"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── "IN" ──────────────────────────────────────────────── */}
      <text
        x="4" y="152"
        fontFamily={font}
        fontWeight="900"
        fontSize="140"
        letterSpacing="-4"
        fill={ink}
      >
        IN
      </text>

      {/* ── "OUT" ─────────────────────────────────────────────── */}
      <text
        x="348" y="152"
        fontFamily={font}
        fontWeight="900"
        fontSize="140"
        letterSpacing="-4"
        fill={ink}
      >
        OUT
      </text>

      {/* ══════════════════════════════════════════════════════════
          RUNNING FIGURE — "&" glyph forms the torso / body
          ══════════════════════════════════════════════════════════ */}

      {/* Torso: bold ampersand */}
      <text
        x="196" y="152"
        fontFamily={font}
        fontWeight="900"
        fontSize="140"
        fill={ink}
      >
        &amp;
      </text>

      {/* Head */}
      <circle cx="270" cy="20" r="16" fill={ink} />

      {/* Cap crown */}
      <rect x="253" y="4"  width="34" height="13" rx="4" fill={ink} />
      {/* Cap brim */}
      <rect x="248" y="15" width="44" height="7"  rx="2" fill={ink} />

      {/* Right arm — drives forward to upper-right */}
      <line x1="286" y1="74" x2="318" y2="54" stroke={ink} strokeWidth="12" strokeLinecap="round" />

      {/* Back leg — kicks rearward */}
      <line x1="232" y1="132" x2="205" y2="160" stroke={ink} strokeWidth="12" strokeLinecap="round" />

      {/* Forward leg — stride ahead */}
      <line x1="268" y1="132" x2="294" y2="162" stroke={ink} strokeWidth="12" strokeLinecap="round" />

      {/* ══════════════════════════════════════════════════════════
          SPEED LINES — three horizontal dashes to the left
          ══════════════════════════════════════════════════════════ */}
      <line x1="168" y1="82"  x2="192" y2="82"  stroke={ink} strokeWidth="8" strokeLinecap="round" />
      <line x1="160" y1="98"  x2="192" y2="98"  stroke={ink} strokeWidth="8" strokeLinecap="round" />
      <line x1="168" y1="114" x2="192" y2="114" stroke={ink} strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}
