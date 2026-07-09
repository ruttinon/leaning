import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, BookOpen, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'

interface Course {
  id: string
  title: string
  status: string
  _count?: { enrollments: number }
}

export function TeacherGradebookIndexPage() {
  const { data: courses, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => api.get<Course[]>('/teacher/courses'),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สมุดคะแนน</h1>
        <p className="text-gray-600">เลือกคอร์สเพื่อดูคะแนน Quiz, การบ้าน และคะแนนรวมของนักเรียน</p>
      </div>

      {!courses?.length ? (
        <EmptyState
          icon={Award}
          title="ยังไม่มีคอร์ส"
          description="สร้างคอร์สและมีนักเรียนลงทะเบียนก่อน จึงจะดูสมุดคะแนนได้"
          actionLabel="ไปที่คอร์ส"
          onAction={() => { window.location.assign('/teacher/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <BookOpen className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      นักเรียน {course._count?.enrollments ?? 0} คน
                    </p>
                  </div>
                </div>
                <Link to={`/teacher/gradebook/${course.id}`}>
                  <Button className="w-full" variant="outline">
                    <Award className="mr-2 h-4 w-4" />
                    ดูสมุดคะแนน
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
