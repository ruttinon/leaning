import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'
import { LoadingState } from '@/components/LoadingState'
import { api } from '@/lib/api'
import { photos, portraitFor } from '@/lib/media'

interface Teacher {
  id: string
  user: any
  bio: string
  specialization?: string
}

export function TeachersPage() {
  const { data: teachers, isLoading, error } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => await api.get('/public/teachers'),
  })

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="kicker">ครูผู้สอน</p>
        <h1 className="mt-3 max-w-xl text-5xl">คนที่อยู่หลังบทเรียน</h1>
        <p className="mt-4 max-w-lg text-[var(--text-secondary)]">พบครูที่มีความเชี่ยวชาญตามสาขา — เลือกจากใบหน้าและเรื่องราว ไม่ใช่ไอคอน</p>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {isLoading && <LoadingState />}
        {error && <p className="text-[var(--danger)]">เกิดข้อผิดพลาด: {String(error)}</p>}
        {!isLoading && !error && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {teachers?.map((teacher) => (
              <Link key={teacher.id} to={`/teachers/${teacher.id}`} className="group block">
                <Photo
                  src={teacher.user?.avatarUrl || portraitFor(teacher.id)}
                  alt={`${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`}
                  className="aspect-[3/4] rounded-sm"
                />
                <h3 className="mt-4 text-2xl group-hover:text-[var(--primary)]">
                  {teacher.user?.firstName} {teacher.user?.lastName}
                </h3>
                {teacher.specialization && (
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">{teacher.specialization}</p>
                )}
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">{teacher.bio}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  )
}
