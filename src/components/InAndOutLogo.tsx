/**
 * IN & OUT Logo
 *
 * The ampersand (&) is the body of a running figure.
 * A circular head + flat cap sit above it.
 * Stroke arms and legs extend from the body.
 * Three speed lines appear to the left of the figure.
 * "IN" sits left, "OUT" sits right, all in heavy black type.
 */

interface InAndOutLogoProps {
  /** Rendered height in px — width scales proportionally */
  height?: number
  className?: string
}

// Canvas is 640 × 180. "IN" occupies x 0–140, figure ~175–335, "OUT" x 345–635.
const VW = 640
const VH = 180

export function InAndOutLogo({ height = 80, className }: InAndOutLogoProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      height={height}
      width={Math.round((height * VW) / VH)}
      aria-label="In &amp; Out"
      role="img"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── "IN" ──────────────────────────────────────── */}
      <text
        x="4"
        y="152"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize="140"
        letterSpacing="-4"
      >
        IN
      </text>

      {/* ── "OUT" ─────────────────────────────────────── */}
      <text
        x="348"
        y="152"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize="140"
        letterSpacing="-4"
      >
        OUT
      </text>

      {/* ══════════════════════════════════════════════════
          RUNNING FIGURE centred around x≈255
          The "&" glyph forms the torso/body.
          ══════════════════════════════════════════════════ */}

      {/* — Torso: bold ampersand ————————————————————————— */}
      <text
        x="196"
        y="152"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize="140"
        letterSpacing="0"
      >
        &amp;
      </text>

      {/* — Head (circle) ————————————————————————————————— 
          Sits above the open loop of the "&"               */}
      <circle cx="270" cy="20" r="16" />

      {/* — Flat-brim cap ————————————————————————————————— */}
      {/* crown */}
      <rect x="253" y="4"  width="34" height="13" rx="4" />
      {/* brim  */}
      <rect x="248" y="15" width="44" height="7"  rx="2" />

      {/* — Right arm (drives forward, upper-right) ————————
          From body shoulder to outstretched fist            */}
      <line
        x1="286" y1="74"
        x2="318" y2="54"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* — Back leg (kicks rearward) ————————————————————— */}
      <line
        x1="232" y1="132"
        x2="205" y2="160"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* — Forward leg (stride ahead) ———————————————————— */}
      <line
        x1="268" y1="132"
        x2="294" y2="162"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* ══════════════════════════════════════════════════
          SPEED LINES — three horizontal dashes to the left
          ══════════════════════════════════════════════════ */}
      <line x1="168" y1="82"  x2="192" y2="82"  stroke="currentColor" strokeWidth="8"  strokeLinecap="round" />
      <line x1="160" y1="98"  x2="192" y2="98"  stroke="currentColor" strokeWidth="8"  strokeLinecap="round" />
      <line x1="168" y1="114" x2="192" y2="114" stroke="currentColor" strokeWidth="8"  strokeLinecap="round" />
    </svg>
  )
}
