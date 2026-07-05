import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/theme-store'
import { api } from '@/lib/api'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

interface AuthResponse {
  access_token: string;
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { theme } = useAppStore()

  const handleLogin = async (emailInput: string, passwordInput: string) => {
    setError('')
    setLoading(true)

    try {
      const response = await api.post<AuthResponse>('/auth/login', { email: emailInput, password: passwordInput })
      
      login(response.user, response.access_token)
      
      // Redirect based on role
      if (response.user.role === 'STUDENT') {
        navigate('/student/dashboard')
      } else if (response.user.role === 'TEACHER') {
        navigate('/teacher/dashboard')
      } else if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleLogin(email, password)
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              เข้าสู่ระบบอย่างปลอดภัย
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">ยินดีต้อนรับกลับสู่แพลตฟอร์มการเรียนรู้</h1>
            <p className="mt-4 text-lg text-indigo-50">เรียนต่อ สมัครคอร์สใหม่ และติดตามความก้าวหน้าตั้งแต่หน้าแรกเดียว</p>
            <div className="mt-8 flex items-center gap-2 rounded-2xl bg-white/15 p-4 text-sm backdrop-blur">
              <ShieldCheck className="h-5 w-5" />
              ระบบรองรับการเข้าสู่ระบบที่ปลอดภัยและใช้งานง่าย
            </div>
          </div>

          <Card className={`rounded-3xl border shadow-xl ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
              <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                เข้าสู่ระบบเพื่อเข้าใช้งานแพลตฟอร์ม
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>🎮 สมัครทดสอบ (Demo Accounts)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {demoAccounts.map((account) => (
                    <Button
                      key={account.email}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => handleLogin(account.email, account.password)}
                      disabled={loading}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                          account.role === 'ADMIN' ? 'bg-red-600' :
                          account.role === 'TEACHER' ? 'bg-green-600' : 'bg-blue-600'
                        }`}>
                          {account.role[0]}
                        </div>
                        <div>
                          <p className="font-medium">{account.label}</p>
                          <p className="text-xs text-slate-500">{account.email}</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>🔑 เข้าสู่ระบบด้วยตัวเอง</Label>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="example@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">รหัสผ่าน</Label>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        ลืมรหัสผ่าน?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>

              <div className="text-center">
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  ยังไม่มีบัญชี?{' '}
                  <Link to="/register" className="font-medium text-primary hover:underline">
                    สมัครสมาชิก
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
