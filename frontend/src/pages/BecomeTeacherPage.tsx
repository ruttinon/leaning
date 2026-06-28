import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Button } from '../components/ui/button'
import { CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BecomeTeacherPage() {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-teal-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              มาเป็นครูกับเรา!
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              แบ่งปันความรู้และสร้างรายได้ กับแพลตฟอร์มเรียนออนไลน์ชั้นนำ
            </p>
            <Link to="/register/teacher">
              <Button size="lg" className="text-lg px-8">
                สมัครเป็นครูตอนนี้
              </Button>
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                สิทธิประโยชน์สำหรับครู
              </h2>
              <p className="text-lg text-gray-600">
                สิ่งที่คุณจะได้รับเมื่อมาเป็นครูกับเรา
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ขั้นตอนการสมัคร
              </h2>
              <p className="text-lg text-gray-600">
                ง่ายๆ เพียง 4 ขั้นตอน
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              พร้อมที่จะเริ่มการเดินทางในการสอนหรือยัง?
            </h2>
            <p className="text-lg text-green-100 mb-8">
              สมัครเป็นครูวันนี้ แล้วแบ่งปันความรู้ของคุณกับผู้อื่น
            </p>
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
