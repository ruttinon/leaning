import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, TrendingUp, Award } from 'lucide-react'
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
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
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
      <div>
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-gray-600">ยินดีต้อนรับกลับมา!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {dashboard?.teacherProfile?.courses && dashboard.teacherProfile.courses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">คอร์สของคุณ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboard.teacherProfile.courses.slice(0, 4).map((course: any) => (
              <Card key={course.id}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    สถานะ: {course.status === 'PUBLISHED' ? 'เผยแพร่แล้ว' : course.status}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
