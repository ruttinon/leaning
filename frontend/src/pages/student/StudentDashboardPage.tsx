import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Award, TrendingUp } from 'lucide-react'
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
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
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

      {dashboard?.studentProfile?.enrollments && dashboard.studentProfile.enrollments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">คอร์สที่กำลังเรียน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboard.studentProfile.enrollments.slice(0, 4).map((enrollment: any) => (
              <Card key={enrollment.id}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{enrollment.course.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    อาจารย์ {enrollment.course.teacher?.user?.firstName} {enrollment.course.teacher?.user?.lastName}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">ความก้าวหน้า: {enrollment.progress}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
