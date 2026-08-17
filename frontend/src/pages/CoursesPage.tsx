import { PublicShell } from '@/components/PublicShell'
import { CourseCard } from '@/components/CourseCard'
import { Photo } from '@/components/media/Photo'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { photos } from '@/lib/media'

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  teacher: any
  price: number
  level?: string
}

export function CoursesPage() {
  const { t } = useTranslation()
  const { data: courses, isLoading, isError, error, refetch } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => await api.get('/public/courses'),
  })

  return (
    <PublicShell>
      <section className="relative">
        <Photo src={photos.library} alt="" className="h-[42vh] min-h-[280px] w-full" zoom={false} />
        <div className="absolute inset-0 bg-[var(--primary-dark)]/50" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-10 sm:px-6">
          <p className="kicker text-white/80">{t('coursesPage.badge')}</p>
          <h1 className="mt-3 max-w-2xl text-4xl text-white md:text-6xl">{t('coursesPage.title')}</h1>
          <p className="mt-3 max-w-xl text-white/85">{t('coursesPage.subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-10 flex items-end justify-between border-b border-[var(--border)] pb-5">
          <div>
            <h2 className="text-3xl">{t('coursesPage.allCourses')}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('coursesPage.allCoursesDesc')}</p>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{courses?.length ?? 0}</p>
        </div>
        {isLoading && <LoadingState />}
        {isError && <ErrorState message={String(error)} onRetry={() => refetch()} />}
        {!isLoading && !isError && (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {courses?.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnailUrl={course.thumbnailUrl}
                price={course.price}
                level={course.level}
                teacherName={`${t('coursesPage.teacherPrefix')} ${course.teacher?.user?.firstName || '-'}`}
              />
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  )
}
