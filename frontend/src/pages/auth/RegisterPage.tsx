import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { GraduationCap, Users } from 'lucide-react'

export function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              สมัครสมาชิก
            </h1>
            <p className="text-lg text-gray-600">
              เลือกประเภทการสมัครที่เหมาะกับคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/register/student" className="block">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>สมัครเป็นนักเรียน</CardTitle>
                  <CardDescription>
                    เข้าถึงคอร์สเรียนทุกหลักสูตร เรียนได้ทุกที่ทุกเวลา
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">
                    สมัครสมาชิกนักเรียน
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/register/teacher" className="block">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>สมัครเป็นครู</CardTitle>
                  <CardDescription>
                    สร้างคอร์สเรียนของคุณเอง สอนและรับรายได้
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="default" className="w-full" style={{ backgroundColor: '#16a34a' }}>
                    สมัครสมาชิกครู
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
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
