import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/components/CourseCard'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { PageIntro } from '@/components/PageIntro'
import { api } from '@/lib/api'

export function TeacherCoursesPage() {
  const navigate = useNavigate()
  const { data: courses, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: async () => api.get<Array<any>>('/teacher/courses'),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-8">
      <PageIntro
        kicker="สตูดิโอ"
        title="คอร์สของฉัน"
        description="จัดการคอร์สของคุณ"
        actions={
          <Link to="/teacher/courses/quick-create">
            <Button className="rounded-sm">สร้างคอร์ส</Button>
          </Link>
        }
      />

      {!courses?.length ? (
        <EmptyState
          title="ยังไม่มีคอร์ส"
          description="เริ่มจากคอร์สแรก แล้วค่อยเติมบทเรียนทีละชั้น"
          actionLabel="สร้างคอร์ส"
          onAction={() => navigate('/teacher/courses/quick-create')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <div key={course.id} className="space-y-3">
              <CourseCard
                id={course.id}
                title={course.title}
                description={course.subject?.name}
                thumbnailUrl={course.thumbnailUrl}
                price={course.price}
                level={
                  course.status === 'PUBLISHED'
                    ? 'เผยแพร่แล้ว'
                    : course.status === 'PENDING_REVIEW'
                      ? 'รออนุมัติ'
                      : course.status === 'DRAFT'
                        ? 'ฉบับร่าง'
                        : course.status
                }
                href={`/teacher/courses/${course.id}`}
              />
              <Link to={`/teacher/courses/${course.id}`}>
                <Button variant="outline" size="sm" className="rounded-sm">จัดการ</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
