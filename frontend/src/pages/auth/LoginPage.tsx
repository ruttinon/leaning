import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'
import { Separator } from '@/components/ui/separator'

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
              <CardDescription>
                เข้าสู่ระบบเพื่อเข้าใช้งานแพลตฟอร์ม
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demo Accounts Section */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">🎮 สมัครทดสอบ (Demo Accounts)</Label>
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          account.role === 'ADMIN' ? 'bg-red-600' :
                          account.role === 'TEACHER' ? 'bg-green-600' : 'bg-blue-600'
                        }`}>
                          {account.role[0]}
                        </div>
                        <div>
                          <p className="font-medium">{account.label}</p>
                          <p className="text-xs text-gray-500">{account.email}</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Manual Login Form */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">🔑 เข้าสู่ระบบด้วยตัวเอง</Label>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
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
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">รหัสผ่าน</Label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
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
                  </Button>
                </form>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  ยังไม่มีบัญชี?{' '}
                  <Link to="/register" className="text-primary hover:underline font-medium">
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
