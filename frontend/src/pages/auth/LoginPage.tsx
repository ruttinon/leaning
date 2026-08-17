import { useState } from 'react'
import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'
import { photos } from '@/lib/media'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { Separator } from '@/components/ui/separator'

interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  };
}

const demoAccounts = [
  { email: 'admin@example.com', password: 'admin1234', role: 'ADMIN', label: 'แอดมิน (Admin)' },
  { email: 'teacher@example.com', password: 'teacher1234', role: 'TEACHER', label: 'ครู (Teacher)' },
  { email: 'student@example.com', password: 'student1234', role: 'STUDENT', label: 'นักเรียน (Student)' },
]

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { t } = useTranslation()
  const sessionExpired = searchParams.get('session') === 'expired'

  const handleLogin = async (emailInput: string, passwordInput: string) => {
    setError('')
    setLoading(true)

    try {
      const response = await api.post<AuthResponse>('/auth/login', { email: emailInput, password: passwordInput })
      
      login(response.user, response.access_token, response.refresh_token)
      
      // Redirect based on role
      if (response.user.role === 'STUDENT') {
        navigate('/student/dashboard')
      } else if (response.user.role === 'TEACHER') {
        navigate('/teacher/dashboard')
      } else if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(t('login.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleLogin(email, password)
  }

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-6xl gap-0 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div className="relative hidden min-h-[520px] overflow-hidden rounded-sm lg:block">
          <Photo src={photos.heroStudy} alt="" className="absolute inset-0 h-full w-full" zoom={false} />
          <div className="absolute inset-0 bg-[var(--primary-dark)]/45" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
            <p className="kicker text-white/80">{t('login.secureBadge')}</p>
            <h1 className="mt-3 text-4xl">{t('login.welcomeBack')}</h1>
            <p className="mt-3 max-w-sm text-white/85">{t('login.welcomeDesc')}</p>
          </div>
        </div>

        <div className="space-y-6 border border-[var(--border)] bg-[var(--bg-card)] p-8 lg:border-l-0">
          <div>
            <h2 className="text-3xl">{t('login.title')}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('login.subtitle')}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('common.demoAccounts')}</Label>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  className="w-full justify-start rounded-sm text-left"
                  onClick={() => handleLogin(account.email, account.password)}
                  disabled={loading}
                >
                  <span className="font-medium">{account.label}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">{account.email}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('login.manualLogin')}</Label>
            <form onSubmit={handleSubmit} className="space-y-4">
              {sessionExpired && (
                <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                  {t('login.sessionExpired')}
                </div>
              )}
              {error && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('common.password')}</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    {t('common.forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full rounded-sm" disabled={loading}>
                {loading ? t('login.loggingIn') : t('login.title')}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-[var(--text-muted)]">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </PublicShell>
  )
}
