import { Languages } from 'lucide-react'
import { useAppStore } from '@/store/theme-store'

export function DashboardLanguageToggle() {
  const { language, toggleLanguage } = useAppStore()

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="px-2 py-1 text-[13px] tracking-wide text-[var(--text-secondary)] hover:text-[var(--primary)]"
    >
      <span className="inline-flex items-center gap-1.5">
        <Languages className="h-4 w-4" />
        {language.toUpperCase()}
      </span>
    </button>
  )
}
