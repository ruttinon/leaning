import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { BookOpen, Users, Zap, Heart } from 'lucide-react'

export function AboutPage() {
  const team = [
    { name: 'ทีมพัฒนา', role: 'Web Developers', icon: Users },
    { name: 'ทีมออกแบบ', role: 'UI/UX Designers', icon: Heart },
    { name: 'ทีมเนื้อหา', role: 'Content Creators', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              เกี่ยวกับเรา
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              เราคือแพลตฟอร์มเรียนออนไลน์ที่มุ่งเน้นที่จะทำให้การเรียนรู้เข้าถึงได้ง่ายทุกคน
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  พันธกิจของเรา
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  เรามุ่งมั่นที่จะสร้างแพลตฟอร์มที่เชื่อมโยงครูผู้เชี่ยวชาญกับผู้เรียนทุกคน
                  โดยมุ่งเน้นที่คุณภาพของเนื้อหาและประสบการณ์การเรียนรู้ที่ดีที่สุด
                </p>
                <p className="text-lg text-gray-600">
                  เราเชื่อว่าทุกคนมีสิทธิ์ที่จะได้รับการศึกษาที่ดี และเราจะช่วยทำให้สิ่งนั้นเป็นจริง
                </p>
              </div>
              <div className="flex justify-center">
                <div className="bg-blue-100 rounded-2xl p-12">
                  <Zap className="h-24 w-24 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ค่านิยมของเรา
              </h2>
              <p className="text-lg text-gray-600">
                สิ่งที่ขับเคลื่อนให้เราทุกวัน
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => {
                const Icon = member.icon
                return (
                  <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-gray-600">{member.role}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
