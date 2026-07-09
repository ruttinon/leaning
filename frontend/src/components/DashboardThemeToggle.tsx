import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/store/theme-store'
import { Button } from '@/components/ui/button'

export function DashboardThemeToggle() {
  const { theme, toggleTheme } = useAppStore()

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
