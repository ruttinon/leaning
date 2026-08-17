import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  fallback?: string
  label?: string
  className?: string
}

export function BackButton({ fallback = '/', label = 'กลับ', className }: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(fallback)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'inline-flex items-center text-sm tracking-wide text-[var(--text-secondary)] hover:text-[var(--primary)]',
        className,
      )}
    >
      <ChevronLeft className="mr-0.5 h-4 w-4" />
      {label}
    </button>
  )
}
