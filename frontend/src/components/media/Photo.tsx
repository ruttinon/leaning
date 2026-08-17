import { cn } from '@/lib/utils'

interface PhotoProps {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  zoom?: boolean
}

export function Photo({ src, alt, className, imgClassName, zoom = true }: PhotoProps) {
  return (
    <div className={cn('overflow-hidden bg-[var(--bg-tertiary)]', className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          'h-full w-full object-cover',
          zoom && 'photo-zoom',
          imgClassName,
        )}
      />
    </div>
  )
}
