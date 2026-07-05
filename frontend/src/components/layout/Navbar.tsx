import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Sun, Moon, Globe, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store/theme-store'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme, language, toggleLanguage } = useAppStore()

  return (
    <nav className={`border-b sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 shadow-lg transition-all duration-300 group-hover:shadow-indigo-500/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className={`text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${theme === 'dark' ? 'from-indigo-400 to-purple-400' : ''}`}>
                  EduPro
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Learn. Grow. Succeed</div>
              </div>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`px-4 py-2 rounded-lg font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {language === 'th' ? 'หน้าแรก' : 'Home'}
            </Link>
            <Link to="/courses" className={`px-4 py-2 rounded-lg font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {language === 'th' ? 'คอร์ส' : 'Courses'}
            </Link>
            <Link to="/teachers" className={`px-4 py-2 rounded-lg font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {language === 'th' ? 'ครู' : 'Teachers'}
            </Link>
            <Link to="/about" className={`px-4 py-2 rounded-lg font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {language === 'th' ? 'เกี่ยวกับเรา' : 'About'}
            </Link>
            <Link to="/contact" className={`px-4 py-2 rounded-lg font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {language === 'th' ? 'ติดต่อเรา' : 'Contact'}
            </Link>

            <div className="h-8 w-px mx-4 bg-slate-200 dark:bg-slate-700"></div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-slate-600'
                }`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleLanguage}
                className={`p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm uppercase">{language}</span>
              </button>
            </div>

            <div className="h-8 w-px mx-4 bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className={theme === 'dark' ? 'text-slate-200' : ''}>
                  {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="premium-btn text-white border-0 shadow-lg hover:shadow-indigo-500/40">
                  {language === 'th' ? 'สมัครสมาชิก' : 'Register'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl ${
                theme === 'dark' ? 'text-yellow-400' : 'text-slate-600'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className={`md:hidden border-t ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-3">
            <Link
              to="/"
              className={`block px-3 py-3 rounded-xl font-medium ${
                theme === 'dark' ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {language === 'th' ? 'หน้าแรก' : 'Home'}
            </Link>
            <Link
              to="/courses"
              className={`block px-3 py-3 rounded-xl font-medium ${
                theme === 'dark' ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {language === 'th' ? 'คอร์ส' : 'Courses'}
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-3 rounded-xl font-medium ${
                theme === 'dark' ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {language === 'th' ? 'เกี่ยวกับเรา' : 'About'}
            </Link>
            <Link
              to="/contact"
              className={`block px-3 py-3 rounded-xl font-medium ${
                theme === 'dark' ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {language === 'th' ? 'ติดต่อเรา' : 'Contact'}
            </Link>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-center">
                  {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                </Button>
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full premium-btn text-white border-0">
                  {language === 'th' ? 'สมัครสมาชิก' : 'Register'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
