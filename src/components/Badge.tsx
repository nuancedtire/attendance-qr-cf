type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-100 text-success-800',
  warning: 'bg-warning-100 text-warning-800',
  danger: 'bg-danger-100 text-danger-800',
  info: 'bg-primary-100 text-primary-800',
  neutral: 'bg-neutral-100 text-neutral-700',
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
