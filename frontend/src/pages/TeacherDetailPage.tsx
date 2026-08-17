import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PublicShell } from '@/components/PublicShell'
import { CourseCard } from '@/components/CourseCard'
import { Photo } from '@/components/media/Photo'
import { api } from '@/lib/api'
import { portraitFor } from '@/lib/media'

interface Teacher {
  id: string
  user: any
  bio: string
  qualifications?: string
  experience?: string
  specialization?: string
  courses?: any[]
}

export function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: teacher, isLoading, error } = useQuery<Teacher>({
    queryKey: ['teacher', id],
    queryFn: async () => {
      if (!id) throw new Error('Teacher ID not found')
      return await api.get(`/public/teachers/${id}`)
    },
    enabled: !!id,
  })

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {isLoading && <p className="py-20 text-center text-[var(--text-muted)]">กำลังโหลด...</p>}
        {error && <p className="py-20 text-center text-[var(--danger)]">เกิดข้อผิดพลาด: {String(error)}</p>}
        {!isLoading && !error && teacher && (
          <>
            <section className="grid items-end gap-8 lg:grid-cols-[280px_1fr]">
              <Photo
                src={teacher.user?.avatarUrl || portraitFor(teacher.id)}
                alt={`${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`}
                className="aspect-[3/4] rounded-sm"
              />
              <div>
                <p className="kicker">{teacher.specialization || 'ครูผู้สอน'}</p>
                <h1 className="mt-3 text-4xl md:text-5xl">
                  {teacher.user?.firstName} {teacher.user?.lastName}
                </h1>
                <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">{teacher.bio}</p>
                {teacher.qualifications && (
                  <p className="mt-4 text-sm text-[var(--text-muted)]">วุฒิ: {teacher.qualifications}</p>
                )}
                {teacher.experience && (
                  <p className="text-sm text-[var(--text-muted)]">ประสบการณ์: {teacher.experience}</p>
                )}
              </div>
            </section>
            <h2 className="mb-8 mt-16 text-3xl">คอร์สของอาจารย์ {teacher.user?.firstName}</h2>
            {teacher.courses && teacher.courses.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {teacher.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnailUrl={course.thumbnailUrl}
                    price={course.price}
                    level={course.level}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-muted)]">ยังไม่มีคอร์สในขณะนี้</p>
            )}
          </>
        )}
      </div>
    </PublicShell>
  )
}
