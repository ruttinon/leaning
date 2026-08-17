import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { photos } from '@/lib/media'

export function BecomeTeacherPage() {
  const benefits = [
    'สร้างรายได้จากความเชี่ยวชาญของคุณ',
    'สอนได้ทุกที่ทุกเวลา',
    'เข้าถึงผู้เรียนทั่วประเทศ',
    'เครื่องมือสร้างคอร์สที่ทันสมัย',
    'รองรับจากทีมงานมืออาชีพ',
  ]
  const steps = [
    { n: '01', title: 'สมัครสมาชิก', description: 'กรอกข้อมูลและสมัครเป็นครู' },
    { n: '02', title: 'รอการอนุมัติ', description: 'ทีมงานจะตรวจสอบข้อมูลของคุณ' },
    { n: '03', title: 'สร้างคอร์ส', description: 'เริ่มสร้างคอร์สและเนื้อหาการสอน' },
    { n: '04', title: 'เริ่มสอน', description: 'เผยแพร่คอร์สและเริ่มรับนักเรียน' },
  ]

  return (
    <PublicShell>
      <section className="relative">
        <Photo src={photos.teacherDesk} alt="" className="h-[46vh] min-h-[300px] w-full" zoom={false} />
        <div className="absolute inset-0 bg-[var(--primary-dark)]/55" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-10 sm:px-6">
          <p className="kicker text-white/80">แบ่งปันความรู้</p>
          <h1 className="mt-2 max-w-xl text-4xl text-white md:text-6xl">มาเป็นครูกับเรา</h1>
          <p className="mt-3 max-w-lg text-white/85">สร้างคอร์สของคุณเองและเติบโตไปกับชุมชนผู้เรียน</p>
          <Link to="/register/teacher" className="mt-6">
            <Button size="lg" className="rounded-sm bg-white text-[var(--primary-dark)] hover:bg-[var(--bg-secondary)]">
              สมัครเป็นครูตอนนี้
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="kicker">สิทธิประโยชน์</p>
        <h2 className="mt-3 mb-10 text-4xl">สิ่งที่คุณจะได้รับ</h2>
        <ol className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <li key={benefit} className="border-t border-[var(--border)] pt-4">
              <span className="text-xs tracking-[0.18em] text-[var(--text-muted)]">0{index + 1}</span>
              <p className="mt-2 text-lg">{benefit}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <p className="kicker">ขั้นตอน</p>
        <h2 className="mt-3 mb-10 text-4xl">ง่าย ๆ เพียงสี่จังหวะ</h2>
        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step) => (
            <article key={step.n}>
              <p className="text-4xl font-semibold text-[var(--primary)]">{step.n}</p>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
