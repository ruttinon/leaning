import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store/theme-store'
import { useAuthStore } from '@/store/auth-store'
import { BrandMark } from '@/components/BrandMark'

function getDashboardPath(role?: string) {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'TEACHER':
      return '/teacher/dashboard'
    case 'STUDENT':
      return '/student/dashboard'
    default:
      return '/'
  }
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme, language, toggleLanguage } = useAppStore()
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/')
  }

  const links = [
    { to: '/', label: language === 'th' ? 'หน้าแรก' : 'Home' },
    { to: '/courses', label: language === 'th' ? 'คอร์ส' : 'Courses' },
    { to: '/subjects', label: language === 'th' ? 'วิชา' : 'Subjects' },
    { to: '/teachers', label: language === 'th' ? 'ครู' : 'Teachers' },
    { to: '/about', label: language === 'th' ? 'เรื่องราว' : 'About' },
    { to: '/contact', label: language === 'th' ? 'ติดต่อ' : 'Contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandMark compact />

        <div className="hidden items-center gap-7 md:flex">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[13px] tracking-wide text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="px-2 py-1 text-[12px] uppercase tracking-widest text-[var(--text-muted)]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="px-2 py-1 text-[12px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]"
          >
            {language}
          </button>
          {isAuthenticated && user ? (
            <>
              <Link to={getDashboardPath(user.role)}>
                <Button variant="ghost" size="sm">
                  {language === 'th' ? 'แดชบอร์ด' : 'Studio'}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[var(--danger)]">
                {language === 'th' ? 'ออก' : 'Out'}
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-sm">
                  {language === 'th' ? 'สมัคร' : 'Join'}
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            className="p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-primary)] px-4 py-5 md:hidden">
          <div className="space-y-1">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block py-2 text-[var(--text-secondary)]"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
            {isAuthenticated && user ? (
              <>
                <Link to={getDashboardPath(user.role)} onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {language === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full text-[var(--danger)]" onClick={handleLogout}>
                  {language === 'th' ? 'ออกจากระบบ' : 'Logout'}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full rounded-sm">{language === 'th' ? 'สมัครสมาชิก' : 'Register'}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
