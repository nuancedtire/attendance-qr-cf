import type { FC } from 'react'
import { useRef, useState, useCallback, useEffect } from 'react'
import { ChevronRight, Check, Loader2 } from 'lucide-react'

type SlideButtonVariant = 'success' | 'danger'
type SlideButtonStatus =
  | 'idle'
  | 'dragging'
  | 'completing'
  | 'loading'
  | 'completed'

type SlideButtonProps = {
  /** Text displayed in the track center, e.g. "slide to check in" */
  label: string
  /** Green/success for check-in, red/danger for check-out */
  variant: SlideButtonVariant
  /** External loading state — thumb shows a spinner */
  loading?: boolean
  /** Dimmed, no interaction */
  disabled?: boolean
  /** Called after the slide completes successfully */
  onComplete: () => Promise<void> | void
  className?: string
}

// ── Layout constants ──────────────────────────────────────────────
const THUMB_SIZE = 44 // w-11 h-11 (44px)
const TRACK_PADDING = 4 // p-1 on the track

/** Spring-like overshoot easing — mimics iOS slide-to-action feel */
const SPRING_EASING = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
const COMPLETE_DURATION_MS = 500
const SNAP_BACK_DURATION_MS = 400

const SlideButton: FC<SlideButtonProps> = ({
  label,
  variant,
  loading = false,
  disabled = false,
  onComplete,
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null)

  // Mutable mirror of dragOffset used inside pointer callbacks so we
  // always read the latest value regardless of React batching.
  const dragOffsetRef = useRef(0)

  const [status, setStatus] = useState<SlideButtonStatus>(
    disabled ? 'idle' : loading ? 'loading' : 'idle',
  )
  const [dragOffset, setDragOffset] = useState(0)
  const [trackWidth, setTrackWidth] = useState(0)

  // When true the thumb / fill get a spring transition.
  const [animating, setAnimating] = useState(false)

  // ── Derived values ─────────────────────────────────────────────
  const maxDrag = Math.max(0, trackWidth - THUMB_SIZE - 2 * TRACK_PADDING)
  const threshold = maxDrag * 0.75
  const progress = maxDrag > 0 ? dragOffset / maxDrag : 0
  const textOpacity = Math.max(0, 1 - progress / 0.5)

  const fillColor =
    variant === 'success' ? 'bg-success-500' : 'bg-danger-500'

  // How far the fill extends from the left edge (reaches the right
  // edge of the thumb).  Clipped by the track's overflow-hidden.
  const fillWidth = TRACK_PADDING + dragOffset + THUMB_SIZE

  // Thumb left offset (inside the track's padding).
  const thumbLeft = TRACK_PADDING + dragOffset

  // ── Measure track on mount / resize ────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.offsetWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // ── Sync external loading / disabled props ─────────────────────
  useEffect(() => {
    if (disabled) {
      setStatus('idle')
      setDragOffset(0)
      setAnimating(false)
      dragOffsetRef.current = 0
    } else if (loading) {
      setStatus('loading')
      setDragOffset(0)
      setAnimating(false)
      dragOffsetRef.current = 0
    }
  }, [disabled, loading])

  // ── Pointer handlers ───────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (
        disabled ||
        loading ||
        status === 'completed' ||
        status === 'completing'
      )
        return

      const track = trackRef.current
      if (!track) return

      e.preventDefault()
      track.setPointerCapture(e.pointerId)

      const rect = track.getBoundingClientRect()
      const x = e.clientX - rect.left - TRACK_PADDING - THUMB_SIZE / 2
      const clamped = Math.max(0, Math.min(x, maxDrag))

      dragOffsetRef.current = clamped
      setDragOffset(clamped)
      setAnimating(false)
      setStatus('dragging')
    },
    [disabled, loading, status, maxDrag],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (status !== 'dragging') return
      const track = trackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const x = e.clientX - rect.left - TRACK_PADDING - THUMB_SIZE / 2
      const clamped = Math.max(0, Math.min(x, maxDrag))

      dragOffsetRef.current = clamped
      setDragOffset(clamped)
    },
    [status, maxDrag],
  )

  const handlePointerUp = useCallback(
    async (e: React.PointerEvent) => {
      if (status !== 'dragging') return
      const track = trackRef.current
      if (!track) return

      track.releasePointerCapture(e.pointerId)
      const currentOffset = dragOffsetRef.current

      if (currentOffset >= threshold) {
        // ── Auto-complete ─────────────────────────────────────────
        setStatus('completing')
        setAnimating(true)
        setDragOffset(maxDrag)
        dragOffsetRef.current = maxDrag

        // Wait for the spring-forward animation to finish.
        await new Promise((r) => setTimeout(r, COMPLETE_DURATION_MS))

        // Remove the spring transition while we call onComplete.
        setAnimating(false)
        setStatus('loading')

        try {
          await onComplete()
          setStatus('completed')
        } catch {
          // onComplete failed → snap back to start.
          setStatus('idle')
          setAnimating(true)
          setDragOffset(0)
          dragOffsetRef.current = 0

          await new Promise((r) => setTimeout(r, SNAP_BACK_DURATION_MS))
          setAnimating(false)
        }
      } else {
        // ── Below threshold → spring back ────────────────────────
        setStatus('idle')
        setAnimating(true)
        setDragOffset(0)
        dragOffsetRef.current = 0

        await new Promise((r) => setTimeout(r, SNAP_BACK_DURATION_MS))
        setAnimating(false)
      }
    },
    [status, threshold, maxDrag, onComplete],
  )

  // ── Thumb icon ─────────────────────────────────────────────────
  const thumbIcon = (() => {
    if (status === 'completed') {
      return (
        <Check className="w-5 h-5 text-success-600 animate-pulse" />
      )
    }
    if (status === 'loading') {
      return (
        <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
      )
    }
    return (
      <ChevronRight className="w-5 h-5 text-neutral-500 transition-opacity" />
    )
  })()

  const isInteractive =
    !disabled && !loading && status !== 'completing'

  return (
    <div
      className={[
        'relative select-none touch-none',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      {/* ── Track ───────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={[
          'relative h-14 rounded-full overflow-hidden',
          'bg-neutral-200 border border-neutral-300',
          'shadow-sm',
          isInteractive ? 'cursor-pointer' : 'cursor-not-allowed',
        ].join(' ')}
      >
        {/* ── Fill (colored sweep behind the thumb) ─────────────── */}
        <div
          className={[
            'absolute inset-y-0 left-0 rounded-full',
            fillColor,
          ].join(' ')}
          style={{
            width: `${fillWidth}px`,
            transition: animating
              ? `width ${COMPLETE_DURATION_MS}ms ${SPRING_EASING}`
              : 'none',
          }}
        />

        {/* ── Center label that fades as the thumb passes ───────── */}
        <div
          className="absolute inset-0 flex items-center justify-center
                     text-sm font-medium text-neutral-500
                     pointer-events-none transition-opacity duration-300"
          style={{ opacity: textOpacity }}
        >
          {label}
        </div>

        {/* ── Draggable thumb ───────────────────────────────────── */}
        <div
          className={[
            'absolute top-1/2 -translate-y-1/2',
            'w-11 h-11 rounded-full',
            'bg-white shadow-md',
            'flex items-center justify-center',
            'pointer-events-none',
          ].join(' ')}
          style={{
            left: `${thumbLeft}px`,
            transition: animating
              ? `left ${COMPLETE_DURATION_MS}ms ${SPRING_EASING}`
              : 'none',
          }}
        >
          {thumbIcon}
        </div>
      </div>
    </div>
  )
}

export default SlideButton
