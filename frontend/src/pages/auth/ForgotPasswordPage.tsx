import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { AuthFrame } from '@/components/AuthFrame'
import { photos } from '@/lib/media'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const mutation = useMutation({
    mutationFn: () => api.post('/auth/forgot-password', { email }),
    onSuccess: () => setSent(true),
  })

  return (
    <AuthFrame image={photos.emptyDesk} kicker="บัญชี" title="ลืมรหัสผ่าน">
      {sent ? (
        <div>
          <p className="text-[var(--text-secondary)]">หากอีเมลมีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ</p>
          <Link to="/login">
            <Button variant="outline" className="mt-6 rounded-sm">กลับไปเข้าสู่ระบบ</Button>
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full rounded-sm" disabled={mutation.isPending}>
            {mutation.isPending ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
          </Button>
          {mutation.isError && <p className="text-sm text-[var(--danger)]">เกิดข้อผิดพลาด กรุณาลองอีกครั้ง</p>}
          <p className="text-center text-sm text-[var(--text-muted)]">
            ระลึกได้แล้ว? <Link to="/login" className="text-primary hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </form>
      )}
    </AuthFrame>
  )
}
