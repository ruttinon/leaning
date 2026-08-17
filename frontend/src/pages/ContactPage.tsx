import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'
import { photos } from '@/lib/media'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function ContactPage() {
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
    <PublicShell>
      <section className="relative">
        <Photo src={photos.writing} alt="" className="h-[36vh] min-h-[240px] w-full" zoom={false} />
        <div className="absolute inset-0 bg-[var(--primary-dark)]/50" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-10 sm:px-6">
          <p className="kicker text-white/80">จดหมาย</p>
          <h1 className="mt-2 text-4xl text-white md:text-5xl">ติดต่อเรา</h1>
          <p className="mt-2 max-w-lg text-white/85">มีคำถามเกี่ยวกับคอร์สหรือการใช้งาน — เขียนมาได้เลย</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl">ข้อมูลติดต่อ</h2>
          <dl className="mt-8 space-y-6 text-[var(--text-secondary)]">
            <div>
              <dt className="kicker">อีเมล</dt>
              <dd className="mt-1 text-lg">contact@edupro.local</dd>
            </div>
            <div>
              <dt className="kicker">โทร</dt>
              <dd className="mt-1 text-lg">02-123-4567</dd>
            </div>
            <div>
              <dt className="kicker">ที่อยู่</dt>
              <dd className="mt-1 text-lg leading-8">123 ถนนสุขุมวิท แขวงคลองเตย<br />เขตคลองเตย กรุงเทพฯ 10110</dd>
            </div>
          </dl>
          <Photo src={photos.emptyDesk} alt="" className="mt-10 aspect-[16/9] rounded-sm" />
        </div>

        <div className="border border-[var(--border)] bg-[var(--bg-card)] p-8">
          <h2 className="text-3xl">ส่งข้อความ</h2>
                {submitted ? (
                  <div className="flex flex-col items-start gap-3 py-8">
                    <img src={photos.emptyDesk} alt="" className="h-32 w-full rounded-sm object-cover" />
                    <p className="text-lg font-medium">ข้อความของคุณถูกส่งเรียบร้อยแล้ว</p>
                    <p className="text-sm text-[var(--text-muted)]">ทีมงานจะติดต่อกลับโดยเร็วที่สุด</p>
                    <Button variant="outline" className="rounded-sm" onClick={() => setSubmitted(false)}>ส่งข้อความอีกครั้ง</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="contact-name" className="mb-2 block text-sm">ชื่อ</label>
                      <Input id="contact-name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-2 block text-sm">อีเมล</label>
                      <Input id="contact-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="mb-2 block text-sm">หัวข้อ</label>
                      <Input id="contact-subject" type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="mb-2 block text-sm">ข้อความ</label>
                      <textarea id="contact-message" className="min-h-[150px] w-full rounded-sm border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                    </div>
                    {contactMutation.isError && (
                      <p className="text-sm text-[var(--danger)]">ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>
                    )}
                    <Button type="submit" className="w-full rounded-sm" disabled={contactMutation.isPending}>
                      {contactMutation.isPending ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                    </Button>
                  </form>
                )}
              </div>
      </section>
    </PublicShell>
  )
}
