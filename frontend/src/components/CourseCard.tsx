import { Link } from 'react-router-dom'
import { Photo } from '@/components/media/Photo'
import { resolveCover } from '@/lib/media'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  id: string
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  price?: number
  level?: string | null
  teacherName?: string
  href?: string
  className?: string
}

export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  price,
  level,
  teacherName,
  href,
  className,
}: CourseCardProps) {
  const to = href ?? `/courses/${id}`
  const free = Number(price ?? 0) === 0

  return (
    <Link to={to} className={cn('group block', className)}>
      <article className="h-full overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--bg-card)]">
        <Photo
          src={resolveCover(thumbnailUrl, id)}
          alt={title}
          className="aspect-[4/3]"
        />
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
            <span>{level || 'ทั่วไป'}</span>
            <span className="text-[var(--primary)]">{free ? 'ฟรี' : `฿${price}`}</span>
          </div>
          <h3 className="text-xl font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--primary)]">
            {title}
          </h3>
          {description && (
            <p className="line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          )}
          {teacherName && (
            <p className="pt-1 text-sm text-[var(--text-muted)]">{teacherName}</p>
          )}
        </div>
      </article>
    </Link>
  )
}
