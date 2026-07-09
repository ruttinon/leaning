import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Sun, Moon, Globe, GraduationCap, LogOut, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store/theme-store'
import { useAuthStore } from '@/store/auth-store'

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

  const navLinkClass = `px-4 py-2 rounded-lg font-medium transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${
    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
  }`

  return (
    <nav className={`border-b sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-green-600 p-2.5 shadow-lg transition-all duration-300 group-hover:shadow-emerald-700/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className={`text-xl font-bold bg-gradient-to-r from-emerald-800 to-green-600 bg-clip-text text-transparent ${theme === 'dark' ? 'from-emerald-400 to-green-300' : ''}`}>
                  EduPro
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Learn. Grow. Succeed</div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={navLinkClass}>
              {language === 'th' ? 'หน้าแรก' : 'Home'}
            </Link>
            <Link to="/courses" className={navLinkClass}>
              {language === 'th' ? 'คอร์ส' : 'Courses'}
            </Link>
            <Link to="/subjects" className={navLinkClass}>
              {language === 'th' ? 'วิชา' : 'Subjects'}
            </Link>
            <Link to="/teachers" className={navLinkClass}>
              {language === 'th' ? 'ครู' : 'Teachers'}
            </Link>
            <Link to="/about" className={navLinkClass}>
              {language === 'th' ? 'เกี่ยวกับเรา' : 'About'}
            </Link>
            <Link to="/contact" className={navLinkClass}>
              {language === 'th' ? 'ติดต่อเรา' : 'Contact'}
            </Link>

            <div className="h-8 w-px mx-4 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`p-2 rounded-xl transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-slate-600'
                }`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleLanguage}
                aria-label="Toggle language"
                className={`p-2 rounded-xl transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1 font-semibold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm uppercase">{language}</span>
              </button>
            </div>

            <div className="h-8 w-px mx-4 bg-slate-200 dark:bg-slate-700" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardPath(user.role)}>
                  <Button variant="outline" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {language === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
                  </Button>
                </Link>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {user.firstName}
                </span>
                <Button variant="ghost" onClick={handleLogout} className="gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  {language === 'th' ? 'ออก' : 'Logout'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className={theme === 'dark' ? 'text-slate-200' : ''}>
                    {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="premium-btn text-white border-0 shadow-lg hover:shadow-emerald-700/40">
                    {language === 'th' ? 'สมัครสมาชิก' : 'Register'}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2 rounded-xl ${theme === 'dark' ? 'text-yellow-400' : 'text-slate-600'}`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              className={`p-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className={`md:hidden border-t ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-3">
            {[
              { to: '/', label: language === 'th' ? 'หน้าแรก' : 'Home' },
              { to: '/courses', label: language === 'th' ? 'คอร์ส' : 'Courses' },
              { to: '/subjects', label: language === 'th' ? 'วิชา' : 'Subjects' },
              { to: '/teachers', label: language === 'th' ? 'ครู' : 'Teachers' },
              { to: '/about', label: language === 'th' ? 'เกี่ยวกับเรา' : 'About' },
              { to: '/contact', label: language === 'th' ? 'ติดต่อเรา' : 'Contact' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-3 py-3 rounded-xl font-medium ${
                  theme === 'dark' ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <Link to={getDashboardPath(user.role)} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {language === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-center text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {language === 'th' ? 'ออกจากระบบ' : 'Logout'}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full premium-btn text-white border-0">
                      {language === 'th' ? 'สมัครสมาชิก' : 'Register'}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
