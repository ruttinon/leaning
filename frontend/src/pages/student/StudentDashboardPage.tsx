import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Award, TrendingUp, Clock3, ArrowRight, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'

interface DashboardData {
  totalEnrollments: number
  completedLessons: number
  studentProfile?: {
    enrollments?: Array<any>
  }
}

export function StudentDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => api.get<DashboardData>('/student/dashboard'),
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
      title: 'คอร์สที่ลงทะเบียน',
      value: dashboard?.totalEnrollments || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'บทเรียนที่เสร็จ',
      value: dashboard?.completedLessons || 0,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'ความก้าวหน้า',
      value: `${Math.min((dashboard?.completedLessons || 0) * 10, 100)}%`,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'คะแนนเฉลี่ย',
      value: '-',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              ยินดีต้อนรับกลับมา
            </div>
            <h1 className="text-2xl font-bold">แดชบอร์ดนักเรียน</h1>
            <p className="mt-2 text-sm text-indigo-50">ติดตามความก้าวหน้า เรียนต่อ และดูงานที่ต้องทำได้จากที่นี่</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
            <div className="flex items-center gap-3 text-sm">
              <Clock3 className="h-5 w-5" />
              <span>เรียนต่อได้ทุกเมื่อ</span>
            </div>
          </div>
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

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">คอร์สที่กำลังเรียน</h2>
              <p className="text-sm text-slate-500">ดำเนินการเรียนต่อได้ทันที</p>
            </div>
            <a href="/student/my-courses" className="text-sm font-medium text-indigo-600">ดูทั้งหมด</a>
          </div>

          {dashboard?.studentProfile?.enrollments && dashboard.studentProfile.enrollments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dashboard.studentProfile.enrollments.slice(0, 4).map((enrollment: any) => (
                <div key={enrollment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{enrollment.course.title}</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">กำลังเรียน</span>
                  </div>
                  <p className="mb-4 text-sm text-slate-500">
                    อาจารย์ {enrollment.course.teacher?.user?.firstName} {enrollment.course.teacher?.user?.lastName}
                  </p>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                    <span>ความก้าวหน้า</span>
                    <span>{enrollment.progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${enrollment.progress || 0}%` }} />
                  </div>
                  <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
                    เรียนต่อ <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              ยังไม่มีคอร์สที่ลงทะเบียนตอนนี้ เริ่มต้นด้วยการเลือกคอร์สที่คุณชื่นชอบเลย
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold text-slate-900">สิ่งที่ต้องทำต่อ</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="rounded-xl bg-slate-50 p-3">เรียนบทเรียนถัดไปในคอร์สที่กำลังเรียน</li>
                <li className="rounded-xl bg-slate-50 p-3">ตรวจคะแนน quiz และ assignment</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold text-slate-900">ความช่วยเหลือ</h3>
              <p className="text-sm text-slate-600">หากมีคำถาม สามารถติดต่อทีมสนับสนุนได้ทันที</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
