import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'
import { LoadingState } from '@/components/LoadingState'
import { api } from '@/lib/api'
import { coverFor, photos } from '@/lib/media'

interface Subject {
  id: string
  name: string
  description?: string
  iconUrl?: string
}

export function SubjectsPage() {
  const { data: subjects, isLoading, error } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => await api.get('/public/subjects'),
  })

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl items-end gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="kicker">รายวิชา</p>
          <h1 className="mt-3 text-5xl">เลือกวิชา แล้วเดินเข้าห้องเรียน</h1>
          <p className="mt-4 text-[var(--text-secondary)]">เลือกวิชาที่สนใจและดูคอร์สที่เกี่ยวข้อง</p>
        </div>
        <Photo src={photos.subjectStill} alt="" className="aspect-[16/9] rounded-sm" />
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {isLoading && <LoadingState />}
        {error && <p className="text-[var(--danger)]">เกิดข้อผิดพลาด: {String(error)}</p>}
        {!isLoading && !error && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {subjects?.map((subject) => (
              <Link key={subject.id} to={`/subjects/${subject.id}`} className="group block">
                <Photo src={subject.iconUrl || coverFor(subject.id)} alt={subject.name} className="aspect-[16/10] rounded-sm" />
                <h3 className="mt-4 text-2xl group-hover:text-[var(--primary)]">{subject.name}</h3>
                {subject.description && (
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{subject.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  )
}
