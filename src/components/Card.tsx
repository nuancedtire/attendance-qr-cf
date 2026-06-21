type CardProps = {
  children: React.ReactNode
  className?: string
  title?: string
  action?: React.ReactNode
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <section className={`bg-white rounded-xl shadow-md border border-neutral-200 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          {title ? <h2 className="font-semibold text-neutral-900">{title}</h2> : <div />}
          {action ? <div>{action}</div> : null}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}
