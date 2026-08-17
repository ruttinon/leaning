import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageIntro({
  kicker,
  title,
  description,
  actions,
  className,
}: {
  kicker?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[var(--text-muted)]">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
