import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useConfirmStore } from '@/store/confirm-store'

export function ConfirmDialog() {
  const { open, loading, options, close, setLoading } = useConfirmStore()
  const [inputValue, setInputValue] = useState('')

  const handleOpenChange = (next: boolean) => {
    if (!next && !loading) {
      setInputValue('')
      close()
    }
  }

  const handleConfirm = async () => {
    if (!options) return
    if (options.requireInput && !inputValue.trim()) return

    setLoading(true)
    try {
      await options.onConfirm(inputValue.trim() || undefined)
      setInputValue('')
      close()
    } finally {
      setLoading(false)
    }
  }

  if (!options) return null

  const isDanger = options.variant === 'danger'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          {options.description && (
            <DialogDescription>{options.description}</DialogDescription>
          )}
        </DialogHeader>

        {options.requireInput && (
          <div className="px-6 pb-2">
            <Label>{options.inputLabel || 'รายละเอียด'}</Label>
            {options.inputPlaceholder && options.inputPlaceholder.length > 40 ? (
              <Textarea
                className="mt-1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={options.inputPlaceholder}
                rows={3}
              />
            ) : (
              <Input
                className="mt-1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={options.inputPlaceholder}
              />
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => handleOpenChange(false)}
          >
            {options.cancelLabel || 'ยกเลิก'}
          </Button>
          <Button
            type="button"
            disabled={loading || (options.requireInput && !inputValue.trim())}
            className={isDanger ? 'bg-red-600 hover:bg-red-700' : undefined}
            onClick={handleConfirm}
          >
            {loading ? 'กำลังดำเนินการ...' : options.confirmLabel || 'ยืนยัน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
