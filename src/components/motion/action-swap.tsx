import * as React from 'react'
import { motion, AnimatePresence, MotionConfig } from 'motion/react'
import { EASE_OUT, SPRING_PRESS } from '#/lib/ease'

export type SwapAnimation = 'blur' | 'roll' | 'cascade'

export interface ActionSwapItem {
  value: string
  content: React.ReactNode
}

interface ActionSwapButtonProps {
  items: ActionSwapItem[]
  value: string
  onValueChange?: (value: string) => void
  cycle?: boolean
  animation?: SwapAnimation
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const blurVariant = {
  initial: { opacity: 0, filter: 'blur(4px)', scale: 0.95 },
  animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
  exit: { opacity: 0, filter: 'blur(4px)', scale: 0.95 },
}

const rollVariant = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const cascadeVariant = {
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.97 },
}

const animVariants = { blur: blurVariant, roll: rollVariant, cascade: cascadeVariant }

export function ActionSwapButton({
  items,
  value,
  onValueChange,
  cycle = true,
  animation = 'blur',
  className,
  disabled,
  type = 'button',
  onClick,
}: ActionSwapButtonProps) {
  const anim = animVariants[animation]
  const current = items.find((i) => i.value === value)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (cycle && onValueChange) {
      const idx = items.findIndex((i) => i.value === value)
      const next = items[(idx + 1) % items.length]
      onValueChange(next.value)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        type={type}
        disabled={disabled}
        onClick={handleClick}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={SPRING_PRESS}
        className={`relative overflow-hidden ${className ?? ''}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={value}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="flex items-center justify-center gap-2"
          >
            {current?.content}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </MotionConfig>
  )
}
