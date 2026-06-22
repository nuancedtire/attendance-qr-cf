type CardProps = {
  children: React.ReactNode
  className?: string
  title?: string
  action?: React.ReactNode
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <section
      className={`bg-white rounded-2xl border border-hairline ${className}`}
      style={{ boxShadow: 'rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.08) 0 4px 8px 0' }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline-soft">
          {title ? <h2 className="font-semibold text-ink">{title}</h2> : <div />}
          {action ? <div>{action}</div> : null}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
