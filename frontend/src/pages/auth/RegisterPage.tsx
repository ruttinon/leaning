import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { GraduationCap, Users, ArrowRight, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/theme-store'

export function RegisterPage() {
  const { theme } = useAppStore()

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              เริ่มต้นใช้งานได้ทันที
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">สมัครสมาชิก</h1>
            <p className={`mt-3 text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>เลือกประเภทบัญชีที่เหมาะกับคุณและเริ่มเรียนรู้ในแบบที่คุณต้องการ</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Link to="/register/student" className="block">
              <Card className={`h-full rounded-3xl border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <GraduationCap className="h-8 w-8 text-emerald-700" />
                  </div>
                  <CardTitle>สมัครเป็นนักเรียน</CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                    เข้าถึงคอร์สเรียนทุกหลักสูตร เรียนได้ทุกที่ทุกเวลา
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">
                    สมัครสมาชิกนักเรียน
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/register/teacher" className="block">
              <Card className={`h-full rounded-3xl border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>สมัครเป็นครู</CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                    สร้างคอร์สเรียนของคุณเอง สอนและรับรายได้
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="default" className="w-full bg-green-600 hover:bg-green-700">
                    สมัครสมาชิกครู
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
