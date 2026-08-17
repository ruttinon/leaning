import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { photos } from '@/lib/media'

export function RegisterPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="kicker">เริ่มต้น</p>
        <h1 className="mt-3 max-w-xl text-5xl">เลือกบทบาท แล้วเดินเข้าห้องเรียน</h1>
        <p className="mt-4 max-w-lg text-[var(--text-secondary)]">
          สมัครเป็นนักเรียนเพื่อเรียน หรือเป็นครูเพื่อเปิดคอร์ส — ไม่ต้องเลือกไอคอน เลือกจากบรรยากาศที่คุณอยากอยู่
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Link to="/register/student" className="group block">
            <Photo src={photos.heroStudy} alt="" className="aspect-[4/3] rounded-sm" />
            <h2 className="mt-5 text-3xl group-hover:text-[var(--primary)]">นักเรียน</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">เข้าถึงคอร์ส เรียนตามจังหวะของตัวเอง</p>
            <Button className="mt-5 rounded-sm">สมัครเป็นนักเรียน</Button>
          </Link>
          <Link to="/register/teacher" className="group block">
            <Photo src={photos.teacherDesk} alt="" className="aspect-[4/3] rounded-sm" />
            <h2 className="mt-5 text-3xl group-hover:text-[var(--primary)]">ครูผู้สอน</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">สร้างคอร์ส สอน และดูแลนักเรียนจากที่เดียว</p>
            <Button className="mt-5 rounded-sm">สมัครเป็นครู</Button>
          </Link>
        </div>
        <p className="mt-10 text-sm text-[var(--text-muted)]">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-[var(--primary)] hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </section>
    </PublicShell>
  )
}
