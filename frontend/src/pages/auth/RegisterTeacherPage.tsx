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

export function RegisterTeacherPage() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuthStore()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    qualifications: '',
    experience: '',
    specialization: '',
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
      const response = await api.post<{ access_token: string; refresh_token?: string; user: any }>('/auth/register/teacher', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        qualifications: formData.qualifications,
        experience: formData.experience,
        specialization: formData.specialization,
      })
      
      authLogin(response.user, response.access_token, response.refresh_token)
      navigate('/teacher/dashboard')
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFrame image={photos.teacherDesk} kicker="ครูผู้สอน" title="สมัครเป็นครู">
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
                <Label htmlFor="bio">แนะนำตัวเอง</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="qualifications">วุฒิการศึกษา</Label>
                <Input
                  id="qualifications"
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="experience">ประสบการณ์การสอน</Label>
                <Input
                  id="experience"
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="specialization">ความเชี่ยวชาญ</Label>
                <Input
                  id="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
              
              <Button type="submit" className="w-full rounded-sm" disabled={isLoading}>
                {isLoading ? 'กำลังสมัคร...' : 'สมัครเป็นครู'}
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
