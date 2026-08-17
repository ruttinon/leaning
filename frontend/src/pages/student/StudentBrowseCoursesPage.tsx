import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/components/CourseCard'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { PageIntro } from '@/components/PageIntro'
import { api } from '@/lib/api'
import { toast } from '@/store/toast-store'
import { isApiError } from '@/lib/api-error'

export function StudentBrowseCoursesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: courses, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => api.get<any>('/public/courses'),
  })

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => api.post(`/student/courses/${courseId}/enroll`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['my-courses'] })
      toast.success('ลงทะเบียนคอร์สเรียบร้อยแล้ว')
    },
    onError: (err: unknown) => {
      toast.error(isApiError(err) ? err.message : 'ลงทะเบียนไม่สำเร็จ')
    },
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-8">
      <PageIntro kicker="สำรวจ" title="ค้นหาคอร์ส" description="ค้นหาและสมัครเรียนคอร์สที่คุณสนใจ" />

      {!courses?.length ? (
        <EmptyState
          title="ยังไม่มีคอร์สให้สมัคร"
          description="ลองกลับมาใหม่ภายหลัง หรือดูคอร์สสาธารณะ"
          actionLabel="ดูคอร์สสาธารณะ"
          onAction={() => navigate('/courses')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => {
            const isPaidCourse = Number(course.price) > 0
            return (
              <div key={course.id} className="space-y-3">
                <CourseCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnailUrl={course.thumbnailUrl}
                  price={course.price}
                  level={course.subject?.name || course.level}
                />
                {isPaidCourse ? (
                  <Button className="w-full rounded-sm" variant="outline" onClick={() => navigate(`/courses/${course.id}`)}>
                    ดูรายละเอียด
                  </Button>
                ) : (
                  <Button
                    className="w-full rounded-sm"
                    onClick={() => enrollMutation.mutate(course.id)}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'กำลังสมัคร...' : 'สมัครเรียนฟรี'}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
