import type { ReactNode } from 'react'
import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'

export function AuthFrame({
  image,
  kicker,
  title,
  children,
}: {
  image: string
  kicker?: string
  title: string
  children: ReactNode
}) {
  return (
    <PublicShell>
      <div className="mx-auto grid max-w-6xl gap-0 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div className="relative hidden min-h-[480px] overflow-hidden rounded-sm lg:block">
          <Photo src={image} alt="" className="absolute inset-0 h-full w-full" zoom={false} />
          <div className="absolute inset-0 bg-[var(--primary-dark)]/45" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
            {kicker && <p className="kicker text-white/80">{kicker}</p>}
            <h1 className="mt-3 text-4xl">{title}</h1>
          </div>
        </div>
        <div className="border border-[var(--border)] bg-[var(--bg-card)] p-8 lg:border-l-0">
          <h2 className="mb-6 text-3xl lg:hidden">{title}</h2>
          {children}
        </div>
      </div>
    </PublicShell>
  )
}
