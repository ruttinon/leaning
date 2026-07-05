import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Mail, Phone, MapPin, SendHorizonal, MessageCircleQuestion } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store/theme-store'

export function ContactPage() {
  const { theme } = useAppStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('ข้อความของคุณถูกส่งแล้ว!')
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <MessageCircleQuestion className="h-4 w-4" />
              พร้อมช่วยเหลือคุณทุกคำถาม
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">ติดต่อเรา</h1>
            <p className="mx-auto max-w-3xl text-xl text-slate-300">มีคำถามเกี่ยวกับคอร์สหรือการใช้งาน ให้เราเป็นตัวช่วยให้คุณตอบได้เร็วขึ้น</p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-8 text-2xl font-bold">ข้อมูลติดต่อ</h2>
                <div className="space-y-6">
                  <div className={`flex items-start gap-4 rounded-3xl p-6 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                    <Mail className="mt-1 h-6 w-6 flex-shrink-0 text-indigo-600" />
                    <div>
                      <h3 className="text-lg font-semibold">อีเมล</h3>
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>contact@example.com</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-4 rounded-3xl p-6 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                    <Phone className="mt-1 h-6 w-6 flex-shrink-0 text-indigo-600" />
                    <div>
                      <h3 className="text-lg font-semibold">เบอร์โทรศัพท์</h3>
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>02-123-4567</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-4 rounded-3xl p-6 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                    <MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-indigo-600" />
                    <div>
                      <h3 className="text-lg font-semibold">ที่อยู่</h3>
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>123 ถนนสุขุมวิท แขวงคลองเตย<br />เขตคลองเตย กรุงเทพฯ 10110</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl p-8 shadow-xl ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                <h2 className="mb-8 text-2xl font-bold">ส่งข้อความถึงเรา</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>ชื่อ</label>
                    <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>อีเมล</label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>หัวข้อ</label>
                    <Input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>ข้อความ</label>
                    <textarea className={`min-h-[150px] w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-900'}`} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full">
                    ส่งข้อความ
                    <SendHorizonal className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
