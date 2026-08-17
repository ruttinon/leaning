import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthFrame } from '@/components/AuthFrame'
import { photos } from '@/lib/media'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useAuthStore } from '../../store/auth-store'
import { api } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'

export function RegisterStudentPage() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuthStore()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    grade: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post<{ access_token: string; refresh_token?: string; user: any }>('/auth/register/student', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        school: formData.school,
        grade: formData.grade,
      })
      
      authLogin(response.user, response.access_token, response.refresh_token)
      navigate('/student/dashboard')
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFrame image={photos.heroStudy} kicker="นักเรียน" title="สมัครเป็นนักเรียน">
            {error && (
              <div className="mb-6 border border-red-200 bg-red-50 p-4 text-red-600">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">ชื่อ</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">{t('register.passwordHint')}</p>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="school">โรงเรียน (ไม่จำเป็น)</Label>
                <Input
                  id="school"
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="grade">ระดับชั้น (ไม่จำเป็น)</Label>
                <Input
                  id="grade"
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>
              
              <Button type="submit" className="w-full rounded-sm" disabled={isLoading}>
                {isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
              </Button>
            </form>
            
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                มีบัญชีอยู่แล้ว?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  เข้าสู่ระบบ
                </Link>
            </p>
    </AuthFrame>
  )
}
