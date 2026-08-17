import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { photos } from '@/lib/media'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center py-16 text-center', className)}>
      <img src={photos.emptyDesk} alt="" className="mb-6 h-40 w-full rounded-sm object-cover" />
      <h3 className="text-2xl">{title}</h3>
      {description && <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-5 rounded-sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
