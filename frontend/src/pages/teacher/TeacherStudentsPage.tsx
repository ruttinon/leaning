import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Users, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { PageIntro } from '@/components/PageIntro'

interface Student {
  id: string
  email: string
  username?: string | null
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  createdAt: string
  enrollments: number
}

export function TeacherStudentsPage() {
  const { data: students, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: () => api.get<Student[]>('/teacher/students'),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="ห้องเรียน"
        title="นักเรียนทั้งหมด"
        description="ดูรายชื่อนักเรียนที่ลงทะเบียนเรียนกับคุณ"
        actions={
          <Link to="/teacher/gradebook" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            <Users className="mr-2 h-4 w-4" />
            ดูสมุดคะแนน
          </Link>
        }
      />

      {!students?.length ? (
        <EmptyState
          icon={Users}
          title="ยังไม่มีนักเรียน"
          description="เมื่อนักเรียนลงทะเบียนคอร์สของคุณ รายชื่อจะแสดงที่นี่"
          actionLabel="ไปที่คอร์ส"
          onAction={() => { window.location.assign('/teacher/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 font-semibold text-white">
                    {student.firstName.charAt(0)}
                    {student.lastName.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {student.firstName} {student.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    {student.username && (
                      <p className="text-sm text-gray-400">@{student.username}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(student.createdAt).toLocaleDateString('th-TH')}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                    {student.enrollments} คอร์ส
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
