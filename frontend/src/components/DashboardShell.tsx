import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { BrandMark } from '@/components/BrandMark'
import { BackButton } from '@/components/BackButton'
import { DashboardLanguageToggle } from '@/components/DashboardLanguageToggle'
import { DashboardThemeToggle } from '@/components/DashboardThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { API_BASE_URL } from '@/lib/api'
import { cn } from '@/lib/utils'

export type DashboardNavItem = {
  icon: LucideIcon
  label: string
  path: string
}

export function DashboardShell({
  navItems,
  brandTo,
  homePath,
  roleLabel,
  avatarUrl,
  children,
}: {
  navItems: DashboardNavItem[]
  brandTo: string
  homePath: string
  roleLabel: string
  avatarUrl?: string | null
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const isHome = location.pathname === homePath
  const current = navItems.find((item) =>
    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  )

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button variant="outline" size="icon" className="rounded-sm" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[var(--primary-dark)]/40 lg:hidden"
          aria-label="ปิดเมนู"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[15.5rem] flex-col bg-[var(--primary-dark)] text-white transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex-shrink-0 px-5 py-6">
          <BrandMark compact to={brandTo} tone="light" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const active =
              location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  'mb-0.5 flex items-center gap-3 border-l-2 px-3 py-2.5 text-[15px] tracking-wide transition-colors',
                  active
                    ? 'border-[var(--accent)] bg-white/10 text-white'
                    : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={API_BASE_URL + avatarUrl}
                alt=""
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-medium">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-white/55">{roleLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-1 py-1.5 text-sm text-white/60 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="lg:ml-[15.5rem]">
        <header className="sticky top-0 z-30 flex h-[4.25rem] items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)]/92 px-5 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            {!isHome && <BackButton fallback={homePath} className="rounded-sm border-0 bg-transparent px-0 shadow-none" />}
            {current && (
              <p className="hidden truncate text-[15px] text-[var(--text-secondary)] sm:block">
                {current.label}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <DashboardLanguageToggle />
            <DashboardThemeToggle />
            <span className="ml-2 hidden text-sm text-[var(--text-muted)] sm:inline">
              {user?.firstName}
            </span>
          </div>
        </header>
        <div className="px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  )
}
