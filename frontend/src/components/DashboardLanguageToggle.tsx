import { Languages } from 'lucide-react'
import { useAppStore } from '@/store/theme-store'
import { Button } from '@/components/ui/button'

export function DashboardLanguageToggle() {
  const { language, toggleLanguage } = useAppStore()

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label="Toggle language">
      <Languages className="mr-1.5 h-4 w-4" />
      <span className="text-sm uppercase">{language}</span>
    </Button>
  )
}
