import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PublicShell } from '@/components/PublicShell'
import { CourseCard } from '@/components/CourseCard'
import { Photo } from '@/components/media/Photo'
import { api } from '@/lib/api'
import { coverFor } from '@/lib/media'

interface Subject {
  id: string
  name: string
  description?: string
  courses?: any[]
}

export function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: subject, isLoading, error } = useQuery<Subject>({
    queryKey: ['subject', id],
    queryFn: async () => {
      if (!id) throw new Error('Subject ID not found')
      return await api.get(`/public/subjects/${id}`)
    },
    enabled: !!id,
  })

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {isLoading && <p className="py-20 text-center text-[var(--text-muted)]">กำลังโหลด...</p>}
        {error && <p className="py-20 text-center text-[var(--danger)]">เกิดข้อผิดพลาด: {String(error)}</p>}
        {!isLoading && !error && subject && (
          <>
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="kicker">วิชา</p>
                <h1 className="mt-3 text-5xl">{subject.name}</h1>
                {subject.description && (
                  <p className="mt-4 max-w-xl text-lg text-[var(--text-secondary)]">{subject.description}</p>
                )}
              </div>
              <Photo src={coverFor(subject.id)} alt="" className="aspect-[4/3] rounded-sm" />
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {subject.courses?.map((course) => (
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
          </>
        )}
      </div>
    </PublicShell>
  )
}
