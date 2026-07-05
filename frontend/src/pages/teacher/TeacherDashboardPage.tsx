import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, TrendingUp, Award, Plus, ArrowRight, Sparkles, FileText, Users } from 'lucide-react'
import { api } from '@/lib/api'

interface DashboardData {
  totalCourses: number
  publishedCourses: number
  totalEnrollments: number
  teacherProfile?: {
    courses?: Array<any>
  }
}

export function TeacherDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => api.get<DashboardData>('/teacher/dashboard'),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-4 w-72 rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'คอร์สทั้งหมด',
      value: dashboard?.totalCourses || 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'คอร์สที่เผยแพร่',
      value: dashboard?.publishedCourses || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'นักเรียนทั้งหมด',
      value: dashboard?.totalEnrollments || 0,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'คะแนนเฉลี่ย',
      value: '-',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              แพลตฟอร์มสำหรับครู
            </div>
            <h1 className="text-2xl font-bold">แดชบอร์ดครูผู้สอน</h1>
            <p className="mt-2 text-sm text-emerald-50">จัดการคอร์ส ตรวจงาน และดูนักเรียนจากจุดเดียว</p>
          </div>
          <Link to="/teacher/courses/create" className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur">
            <Plus className="h-4 w-4" />
            สร้างคอร์สใหม่
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-xl`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'สร้างคอร์สใหม่', description: 'เริ่มคอร์สแรกของคุณ', href: '/teacher/courses/create', icon: Plus, accent: 'from-emerald-500 to-teal-500' },
          { title: 'จัดการเนื้อหา', description: 'เพิ่มเอกสารและแบบฝึกหัด', href: '/teacher/courses', icon: FileText, accent: 'from-sky-500 to-blue-500' },
          { title: 'ดูนักเรียน', description: 'ตรวจงานและติดตามนักเรียน', href: '/teacher/students', icon: Users, accent: 'from-violet-500 to-purple-500' },
        ].map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} to={action.href} className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${action.accent} p-5 text-white shadow-sm`}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{action.title}</h3>
              <p className="mt-1 text-sm text-white/80">{action.description}</p>
            </Link>
          )
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">คอร์สของคุณ</h2>
            <p className="text-sm text-slate-500">จัดการและติดตามผลการเรียนได้จากที่นี่</p>
          </div>
          <a href="/teacher/courses" className="text-sm font-medium text-emerald-600">ดูทั้งหมด</a>
        </div>

        {dashboard?.teacherProfile?.courses && dashboard.teacherProfile.courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {dashboard.teacherProfile.courses.slice(0, 4).map((course: any) => (
              <div key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{course.title}</h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {course.status === 'PUBLISHED' ? 'เผยแพร่แล้ว' : course.status}
                  </span>
                </div>
                <p className="mb-4 text-sm text-slate-500">พร้อมสำหรับการสอนและติดตามนักเรียน</p>
                <Link to={`/teacher/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  จัดการคอร์ส <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            ยังไม่มีคอร์สที่สร้างไว้ตอนนี้ เริ่มสร้างคอร์สแรกของคุณได้เลย
          </div>
        )}
      </div>
    </div>
  )
}
