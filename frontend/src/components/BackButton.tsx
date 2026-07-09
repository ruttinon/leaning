import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

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
    <Button variant="outline" size="sm" className={className} onClick={handleBack}>
      <ChevronLeft className="mr-1 h-4 w-4" />
      {label}
    </Button>
  )
}
