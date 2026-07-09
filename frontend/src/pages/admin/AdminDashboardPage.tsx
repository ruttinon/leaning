import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, TrendingUp, Award, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'

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
    {
      title: 'ผู้ใช้ทั้งหมด',
      value: dashboard?.totalUsers || 0,
      icon: Users,
      color: 'text-amber-800',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'ครูทั้งหมด',
      value: dashboard?.totalTeachers || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'ครูที่อนุมัติแล้ว',
      value: dashboard?.approvedTeachers || 0,
      icon: Award,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'คอร์สทั้งหมด',
      value: dashboard?.totalCourses || 0,
      icon: BookOpen,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              แอดมินควบคุมระบบ
            </div>
            <h1 className="text-2xl font-bold">แดชบอร์ดผู้ดูแล</h1>
            <p className="mt-2 text-sm text-slate-300">จัดการผู้ใช้ คอร์ส และการอนุมัติจากจุดเดียว</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-5 w-5" />
              ระบบปลอดภัยและควบคุมได้
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <h3 className="mb-2 font-semibold text-slate-900">งานที่ต้องดำเนินการ</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="rounded-xl bg-slate-50 p-3">ตรวจคำขออนุมัติครูใหม่</li>
              <li className="rounded-xl bg-slate-50 p-3">ตรวจคอร์สที่รอการอนุมัติ</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <h3 className="mb-2 font-semibold text-slate-900">การจัดการระบบ</h3>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              ดูรายการทั้งหมด <ArrowRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
