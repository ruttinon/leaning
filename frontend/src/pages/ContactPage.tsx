import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Mail, Phone, MapPin, SendHorizonal, MessageCircleQuestion, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '@/store/theme-store'
import { api } from '@/lib/api'

export function ContactPage() {
  const { theme } = useAppStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const contactMutation = useMutation({
    mutationFn: () => api.post('/public/contact', formData),
    onSuccess: () => {
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    contactMutation.mutate()
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-emerald-900 via-green-800 to-stone-800 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <MessageCircleQuestion className="h-4 w-4" />
              พร้อมช่วยเหลือคุณทุกคำถาม
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">ติดต่อเรา</h1>
            <p className="mx-auto max-w-3xl text-xl text-emerald-100">มีคำถามเกี่ยวกับคอร์สหรือการใช้งาน ให้เราเป็นตัวช่วยให้คุณตอบได้เร็วขึ้น</p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-8 text-2xl font-bold">ข้อมูลติดต่อ</h2>
                <div className="space-y-6">
                  <div className={`flex items-start gap-4 rounded-3xl p-6 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                    <Mail className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-700" />
                    <div>
                      <h3 className="text-lg font-semibold">อีเมล</h3>
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>contact@edupro.local</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-4 rounded-3xl p-6 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                    <Phone className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-700" />
                    <div>
                      <h3 className="text-lg font-semibold">เบอร์โทรศัพท์</h3>
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>02-123-4567</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-4 rounded-3xl p-6 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                    <MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-700" />
                    <div>
                      <h3 className="text-lg font-semibold">ที่อยู่</h3>
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>123 ถนนสุขุมวิท แขวงคลองเตย<br />เขตคลองเตย กรุงเทพฯ 10110</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl p-8 shadow-xl ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                <h2 className="mb-8 text-2xl font-bold">ส่งข้อความถึงเรา</h2>
                {submitted ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-600" />
                    <p className="text-lg font-medium">ข้อความของคุณถูกส่งเรียบร้อยแล้ว</p>
                    <p className="text-sm text-slate-500">ทีมงานจะติดต่อกลับโดยเร็วที่สุด</p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>ส่งข้อความอีกครั้ง</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="contact-name" className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>ชื่อ</label>
                      <Input id="contact-name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>อีเมล</label>
                      <Input id="contact-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>หัวข้อ</label>
                      <Input id="contact-subject" type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                    </div>
                    <div>
                      <label htmlFor="contact-message" className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>ข้อความ</label>
                      <textarea id="contact-message" className={`min-h-[150px] w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${theme === 'dark' ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-900'}`} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                    </div>
                    {contactMutation.isError && (
                      <p className="text-sm text-red-600">ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>
                    )}
                    <Button type="submit" className="w-full" disabled={contactMutation.isPending}>
                      {contactMutation.isPending ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                      <SendHorizonal className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
