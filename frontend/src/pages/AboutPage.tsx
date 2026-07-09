import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { BookOpen, Users, Zap, Heart, Sparkles, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/store/theme-store'

export function AboutPage() {
  const { theme } = useAppStore()
  const team = [
    { name: 'ทีมพัฒนา', role: 'Web Developers', icon: Users },
    { name: 'ทีมออกแบบ', role: 'UI/UX Designers', icon: Heart },
    { name: 'ทีมเนื้อหา', role: 'Content Creators', icon: BookOpen },
  ]

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-emerald-800 via-green-700 to-amber-700 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              ทำให้การเรียนรู้เข้าถึงได้ง่ายขึ้น
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">เกี่ยวกับเรา</h1>
            <p className="mx-auto max-w-3xl text-xl text-emerald-50">เราคือแพลตฟอร์มเรียนออนไลน์ที่เชื่อมโยงผู้เรียนและครูผู้เชี่ยวชาญให้เข้าถึงเนื้อหาและประสบการณ์การเรียนรู้ที่มีคุณภาพ</p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold">พันธกิจของเรา</h2>
                <p className={`mb-4 text-lg leading-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  เรามุ่งมั่นสร้างแพลตฟอร์มที่ช่วยให้ทุกคนเข้าถึงความรู้ได้อย่างง่ายและมีประสิทธิภาพ โดยให้ความสำคัญกับคุณภาพของเนื้อหาและความสะดวกในการเรียนรู้
                </p>
                <p className={`text-lg leading-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  เราเชื่อว่าทุกคนมีศักยภาพและมีสิทธิ์ในการพัฒนาอย่างต่อเนื่อง เราจึงสร้างสภาพแวดล้อมที่เอื้อต่อการเรียนรู้และการเติบโตอย่างยั่งยืน
                </p>
              </div>
              <div className="flex justify-center">
                <div className={`rounded-3xl p-12 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                  <Zap className="mx-auto h-24 w-24 text-emerald-700" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`py-20 ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-white'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">ค่านิยมของเรา</h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>สิ่งที่ขับเคลื่อนให้เราเติบโตและพัฒนาอย่างต่อเนื่อง</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {team.map((member, index) => {
                const Icon = member.icon
                return (
                  <div key={index} className={`rounded-3xl p-8 text-center shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50'}`}>
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-emerald-500/10">
                      <Icon className="h-8 w-8 text-emerald-700" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{member.name}</h3>
                    <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{member.role}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-gradient-to-r from-indigo-600 to-green-600 p-8 text-white shadow-xl sm:px-10 lg:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold">พร้อมเริ่มต้นการเรียนรู้แบบใหม่แล้วหรือยัง?</h2>
                <p className="mt-3 text-emerald-50">เข้าร่วมกับเราเพื่อพัฒนาทักษะและสร้างอนาคตที่ดีกว่า</p>
              </div>
              <a href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-emerald-800">
                เริ่มเลย <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
