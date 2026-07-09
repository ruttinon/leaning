import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

interface PaginationMeta {
  page: number
  totalPages: number
}

interface PaginationControlsProps {
  meta?: PaginationMeta | null
  page: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ meta, page, onPageChange }: PaginationControlsProps) {
  const { t } = useTranslation()

  if (!meta || meta.totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {t('common.previous')}
      </Button>
      <span className="text-sm text-gray-600">
        หน้า {meta.page} / {meta.totalPages}
      </span>
      <Button
        variant="outline"
        disabled={page >= meta.totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {t('common.next')}
      </Button>
    </div>
  )
}
