import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Button } from '../components/ui/button'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/theme-store'

export function BecomeTeacherPage() {
  const { theme } = useAppStore()
  const benefits = [
    'สร้างรายได้จากความเชี่ยวชาญของคุณ',
    'สอนได้ทุกที่ทุกเวลา',
    'เข้าถึงผู้เรียนทั่วประเทศ',
    'เครื่องมือสร้างคอร์สที่ทันสมัย',
    'รองรับจากทีมงานมืออาชีพ',
  ]

  const steps = [
    { step: 1, title: 'สมัครสมาชิก', description: 'กรอกข้อมูลและสมัครเป็นครู' },
    { step: 2, title: 'รอการอนุมัติ', description: 'ทีมงานจะตรวจสอบข้อมูลของคุณ' },
    { step: 3, title: 'สร้างคอร์ส', description: 'เริ่มสร้างคอร์สและเนื้อหาการสอน' },
    { step: 4, title: 'เริ่มสอน', description: 'เผยแพร่คอร์สและเริ่มรับนักเรียน' },
  ]

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              แบ่งปันความรู้ สร้างรายได้
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">มาเป็นครูกับเรา!</h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-emerald-50">สร้างคอร์สของคุณเองและเติบโตไปกับชุมชนผู้เรียนที่กำลังมองหาความรู้คุณภาพ</p>
            <Link to="/register/teacher">
              <Button size="lg" className="px-8 text-lg">
                สมัครเป็นครูตอนนี้
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">สิทธิประโยชน์สำหรับครู</h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>สิ่งที่คุณจะได้รับเมื่อมาเป็นครูกับเรา</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div key={index} className={`flex items-start gap-4 rounded-3xl p-6 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                  <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-600" />
                  <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`py-20 ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-white'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">ขั้นตอนการสมัคร</h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>ง่าย ๆ เพียง 4 ขั้นตอน</p>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              {steps.map((step, index) => (
                <div key={index} className={`rounded-3xl p-6 text-center shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50'}`}>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl rounded-3xl bg-emerald-600 p-8 px-4 text-center text-white shadow-xl sm:px-6 lg:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">พร้อมที่จะเริ่มการเดินทางในการสอนหรือยัง?</h2>
            <p className="mb-8 text-lg text-emerald-100">สมัครเป็นครูวันนี้ แล้วแบ่งปันความรู้ของคุณกับผู้อื่น</p>
            <Link to="/register/teacher">
              <Button size="lg" variant="secondary" className="text-lg">
                สมัครเป็นครู
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
