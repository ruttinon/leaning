import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { photos } from '@/lib/media'

interface DashboardData {
  totalUsers: number
  totalTeachers: number
  approvedTeachers: number
  totalCourses: number
}

export function AdminDashboardPage() {
  const { data: dashboard, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => api.get<DashboardData>('/admin/dashboard'),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const stats = [
    ['ผู้ใช้ทั้งหมด', dashboard?.totalUsers || 0],
    ['ครูทั้งหมด', dashboard?.totalTeachers || 0],
    ['ครูที่อนุมัติแล้ว', dashboard?.approvedTeachers || 0],
    ['คอร์สทั้งหมด', dashboard?.totalCourses || 0],
  ] as const

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-sm">
        <img src={photos.library} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[var(--primary-dark)]/65" />
        <div className="relative px-6 py-10 text-white">
          <p className="kicker text-white/75">ผู้ดูแลระบบ</p>
          <h1 className="mt-2 text-4xl">แดชบอร์ดผู้ดูแล</h1>
          <p className="mt-2 max-w-lg text-sm text-white/80">จัดการผู้ใช้ คอร์ส และการอนุมัติจากจุดเดียว</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-[var(--border)] py-6 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h3 className="mb-4 text-2xl">งานที่ต้องดำเนินการ</h3>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="border border-[var(--border)] p-3">ตรวจคำขออนุมัติครูใหม่</li>
            <li className="border border-[var(--border)] p-3">ตรวจคอร์สที่รอการอนุมัติ</li>
          </ul>
        </div>
        <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h3 className="mb-2 text-2xl">การจัดการระบบ</h3>
          <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            ดูรายการทั้งหมด <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
