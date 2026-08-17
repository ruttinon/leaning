import { Link } from 'react-router-dom'
import { photos } from '@/lib/media'
import { cn } from '@/lib/utils'

export function BrandMark({
  compact = false,
  to = '/',
  tone = 'default',
}: {
  compact?: boolean
  to?: string
  tone?: 'default' | 'light'
}) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <img
        src={photos.brandStamp}
        alt=""
        className={cn(
          'rounded-full object-cover',
          compact ? 'h-9 w-9' : 'h-11 w-11',
          tone === 'light' ? 'ring-1 ring-white/20' : 'ring-1 ring-[var(--border)]',
        )}
      />
      <div className="leading-tight">
        <div
          className={cn(
            'text-[17px] font-semibold tracking-wide',
            tone === 'light' ? 'text-white' : 'text-[var(--primary-dark)] dark:text-[var(--primary-light)]',
          )}
        >
          EduPro
        </div>
        {!compact && (
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Studio of learning
          </div>
        )}
      </div>
    </Link>
  )
}
