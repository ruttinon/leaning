import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CourseCard } from '@/components/CourseCard'
import { EmptyState } from '@/components/EmptyState'
import { PageIntro } from '@/components/PageIntro'
import { api } from '@/lib/api'

export function StudentMyCoursesPage() {
  const navigate = useNavigate()
  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => api.get<Array<any>>('/student/courses'),
  })

  if (isLoading) {
    return <p className="py-12 text-center text-[var(--text-muted)]">กำลังโหลด...</p>
  }

  return (
    <div className="space-y-8">
      <PageIntro kicker="ห้องเรียน" title="คอร์สของฉัน" description="คอร์สที่คุณได้ลงทะเบียน" />

      {!courses?.length ? (
        <EmptyState
          title="ยังไม่ได้ลงทะเบียนคอร์ส"
          description="เลือกคอร์สที่อยากเรียน แล้วเริ่มจากบทแรก"
          actionLabel="ดูคอร์สทั้งหมด"
          onAction={() => navigate('/student/browse-courses')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((enrollment: any) => (
            <div key={enrollment.id}>
              <CourseCard
                id={enrollment.courseId || enrollment.course?.id}
                title={enrollment.course.title}
                description={`ความก้าวหน้า ${enrollment.progress || 0}%`}
                thumbnailUrl={enrollment.course.thumbnailUrl}
                teacherName={`อาจารย์ ${enrollment.course.teacher?.user?.firstName || ''} ${enrollment.course.teacher?.user?.lastName || ''}`}
                href={`/student/courses/${enrollment.courseId || enrollment.course?.id}`}
              />
              <div className="mt-2 h-1 bg-[var(--bg-tertiary)]">
                <div className="h-1 bg-[var(--primary)]" style={{ width: `${enrollment.progress || 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
