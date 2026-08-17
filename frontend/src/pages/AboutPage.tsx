import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'
import { photos } from '@/lib/media'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AboutPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="kicker">เรื่องราว</p>
          <h1 className="mt-4 text-5xl leading-tight md:text-6xl">ทำให้การเรียนรู้รู้สึกเหมือนบ้าน</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
            เราคือแพลตฟอร์มเรียนออนไลน์ที่เชื่อมผู้เรียนกับครูผู้เชี่ยวชาญ — ไม่ใช่แค่คลังวิดีโอ แต่เป็นห้องเรียนที่ออกแบบจังหวะ ความเงียบ และความก้าวหน้าให้ชัดเจน
          </p>
        </div>
        <div className="img-frame overflow-hidden rounded-sm">
          <Photo src={photos.heroStudy} alt="" className="aspect-[4/5]" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Photo src={photos.writing} alt="" className="aspect-[5/4] rounded-sm" />
          <div>
            <p className="kicker">พันธกิจ</p>
            <h2 className="mt-3 text-4xl">ความรู้ควรเข้าถึงได้ โดยไม่ต้องดูเร่งรีบ</h2>
            <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
              เรามุ่งมั่นสร้างพื้นที่ที่ช่วยให้ทุกคนเข้าถึงความรู้ได้ง่าย มีประสิทธิภาพ และยังเหลือที่ให้คิด เราเชื่อว่าทุกคนมีสิทธิ์พัฒนาอย่างต่อเนื่อง — ถ้าสภาพแวดล้อมเอื้อให้ตั้งใจ
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="kicker">ทีมหลังบ้าน</p>
        <h2 className="mt-3 mb-10 text-4xl">คนที่ดูแลจังหวะของห้องเรียนนี้</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: 'ทีมพัฒนา', role: 'สร้างระบบให้นิ่งและเร็ว', img: photos.laptop },
            { name: 'ทีมออกแบบ', role: 'จัดวางบรรยากาศการเรียน', img: photos.emptyDesk },
            { name: 'ทีมเนื้อหา', role: 'คัดสรรบทเรียนให้คม', img: photos.notebooks },
          ].map((member) => (
            <article key={member.name}>
              <Photo src={member.img} alt="" className="aspect-[4/3] rounded-sm" />
              <h3 className="mt-4 text-2xl">{member.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{member.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden rounded-sm">
          <Photo src={photos.library} alt="" className="h-72 w-full" zoom={false} />
          <div className="absolute inset-0 bg-[var(--primary-dark)]/60" />
          <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
            <h2 className="text-3xl">พร้อมเริ่มต้นการเรียนรู้แบบใหม่แล้วหรือยัง?</h2>
            <Link to="/register" className="mt-5">
              <Button className="rounded-sm bg-white text-[var(--primary-dark)] hover:bg-[var(--bg-secondary)]">เริ่มเลย</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
