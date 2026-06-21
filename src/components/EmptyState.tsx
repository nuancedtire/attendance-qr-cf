import { CalendarDays, ScanLine, AlertCircle, type LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: 'calendar' | 'scan' | 'alert' | React.ReactNode
  children?: React.ReactNode
}

const iconMap: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  scan: ScanLine,
  alert: AlertCircle,
}

export function EmptyState({ title, description, icon = 'alert', children }: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon] ?? AlertCircle : null

  return (
    <div className="text-center py-8 px-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-3">
        {IconComponent ? <IconComponent className="w-6 h-6" /> : icon}
      </div>
      <p className="text-neutral-800 font-medium">{title}</p>
      {description ? <p className="text-sm text-neutral-500 mt-1">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
