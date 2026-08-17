import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PublicShell } from '@/components/PublicShell'
import { photos } from '@/lib/media'

export function NotFoundPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <img src={photos.library} alt="" className="mb-8 h-56 w-full rounded-sm object-cover" />
        <p className="kicker">404</p>
        <h1 className="mt-3 text-5xl">หาหน้านี้ไม่เจอ</h1>
        <p className="mt-4 text-[var(--text-secondary)]">ลิงก์อาจเก่า หรือหน้าถูกย้ายไปแล้ว</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/"><Button className="rounded-sm">กลับหน้าแรก</Button></Link>
          <Link to="/courses"><Button variant="outline" className="rounded-sm">ดูคอร์ส</Button></Link>
        </div>
      </div>
    </PublicShell>
  )
}
