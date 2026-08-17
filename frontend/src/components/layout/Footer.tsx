import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { photos } from '@/lib/media'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
            สตูดิโอเรียนออนไลน์ที่ออกแบบให้รู้สึกเหมือนห้องเรียนจริง — เนื้อหาคม บรรยากาศอุ่น และจังหวะที่เป็นของคุณ
          </p>
        </div>
        <div>
          <p className="kicker mb-4">สำรวจ</p>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link to="/courses" className="hover:text-[var(--primary)]">คอร์สทั้งหมด</Link></li>
            <li><Link to="/teachers" className="hover:text-[var(--primary)]">ครูผู้สอน</Link></li>
            <li><Link to="/about" className="hover:text-[var(--primary)]">เรื่องราวของเรา</Link></li>
            <li><Link to="/contact" className="hover:text-[var(--primary)]">เขียนถึงเรา</Link></li>
          </ul>
        </div>
        <div>
          <p className="kicker mb-4">เริ่มต้น</p>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link to="/register/student" className="hover:text-[var(--primary)]">สมัครเป็นนักเรียน</Link></li>
            <li><Link to="/register/teacher" className="hover:text-[var(--primary)]">สมัครเป็นครู</Link></li>
            <li><Link to="/login" className="hover:text-[var(--primary)]">เข้าสู่ระบบ</Link></li>
          </ul>
          <img src={photos.emptyDesk} alt="" className="mt-8 h-24 w-full rounded-sm object-cover" />
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-6 text-center text-xs tracking-wide text-[var(--text-muted)]">
        © {new Date().getFullYear()} EduPro · กรุงเทพฯ
      </div>
    </footer>
  )
}
