import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { AuthFrame } from '@/components/AuthFrame'
import { photos } from '@/lib/media'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [reset, setReset] = useState(false)

  const mutation = useMutation({
    mutationFn: () => api.post('/auth/reset-password', { token: token || '', newPassword: password }),
    onSuccess: () => setReset(true),
  })

  return (
    <AuthFrame image={photos.emptyDesk} kicker="บัญชี" title="ตั้งรหัสผ่านใหม่">
      {!token ? (
        <div>
          <p className="text-[var(--danger)]">โทเค็นไม่ถูกต้องหรือหมดอายุ</p>
          <Link to="/login"><Button variant="outline" className="mt-6 rounded-sm">กลับไปเข้าสู่ระบบ</Button></Link>
        </div>
      ) : reset ? (
        <div>
          <p className="text-[var(--text-secondary)]">รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว</p>
          <Link to="/login"><Button className="mt-6 rounded-sm">เข้าสู่ระบบตอนนี้</Button></Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (password !== confirmPassword) return
            mutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่านใหม่</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-[var(--danger)]">รหัสผ่านไม่ตรงกัน</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full rounded-sm"
            disabled={mutation.isPending || !password || password !== confirmPassword || password.length < 6}
          >
            {mutation.isPending ? 'กำลังตั้งรหัสผ่านใหม่...' : 'ตั้งรหัสผ่านใหม่'}
          </Button>
          {mutation.isError && <p className="text-sm text-[var(--danger)]">โทเค็นไม่ถูกต้องหรือหมดอายุ</p>}
        </form>
      )}
    </AuthFrame>
  )
}
