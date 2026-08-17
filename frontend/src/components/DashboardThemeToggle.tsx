import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/store/theme-store'

export function DashboardThemeToggle() {
  const { theme, toggleTheme } = useAppStore()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
