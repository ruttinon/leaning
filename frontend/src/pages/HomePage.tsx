import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { PublicShell } from '@/components/PublicShell'
import { CourseCard } from '@/components/CourseCard'
import { Photo } from '@/components/media/Photo'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { useTranslation } from '@/lib/i18n'
import { api } from '@/lib/api'
import { photos } from '@/lib/media'
import { BookOpen } from 'lucide-react'

export function HomePage() {
  const { t } = useTranslation()
  const { data: featuredCourses, isLoading, isError } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const featured = await api.get<any[]>('/public/courses/featured?limit=3')
      if (Array.isArray(featured) && featured.length > 0) return featured
      const all = await api.get<any[]>('/public/courses')
      return Array.isArray(all) ? all.slice(0, 3) : []
    },
  })

  const moments = [
    { n: '01', title: t('home.features.highQuality.title'), desc: t('home.features.highQuality.desc'), img: photos.notebooks },
    { n: '02', title: t('home.features.anytimeAnywhere.title'), desc: t('home.features.anytimeAnywhere.desc'), img: photos.laptop },
    { n: '03', title: t('home.features.expertTeachers.title'), desc: t('home.features.expertTeachers.desc'), img: photos.teacherDesk },
    { n: '04', title: t('home.features.trackProgress.title'), desc: t('home.features.trackProgress.desc'), img: photos.writing },
  ]

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:py-20">
        <div className="rise max-w-xl">
          <p className="kicker">{t('home.badge')}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.2] sm:text-5xl lg:text-[3.5rem]">
            {t('home.heroLine1')}
            <span className="text-[var(--primary)]"> {t('home.heroLine2')}</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
            {t('home.heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg" className="rounded-sm px-7">{t('home.startLearning')}</Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="rounded-sm px-7">{t('home.viewAllCourses')}</Button>
            </Link>
          </div>
        </div>
        <div className="rise rise-delay-2 relative pb-8">
          <div className="img-frame overflow-hidden rounded-sm">
            <Photo src={photos.heroStudy} alt="" className="h-[22rem] w-full sm:h-[26rem] lg:h-[30rem]" />
          </div>
          <div className="absolute bottom-0 left-5 right-8 overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--bg-card)] shadow-lg">
            <div className="grid grid-cols-[72px_1fr]">
              <Photo src={photos.emptyDesk} alt="" className="h-full min-h-[72px]" zoom={false} />
              <div className="p-3 sm:p-4">
                <p className="kicker">{t('home.learnAnytimeTitle')}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('home.learnAnytimeDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="kicker">{t('home.whyChooseUs')}</p>
            <h2 className="mt-3 max-w-lg text-4xl">{t('home.whyChooseUsSubtitle')}</h2>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {moments.map((item) => (
            <article key={item.n} className="group grid grid-cols-[140px_1fr] gap-5 sm:grid-cols-[200px_1fr]">
              <Photo src={item.img} alt="" className="aspect-square rounded-sm" />
              <div className="self-center">
                <p className="text-xs tracking-[0.2em] text-[var(--text-muted)]">{item.n}</p>
                <h3 className="mt-2 text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="kicker">{t('home.popularCourses')}</p>
            <h2 className="mt-3 text-4xl">{t('home.popularCoursesDesc')}</h2>
          </div>
          <Link to="/courses" className="hidden text-sm text-[var(--primary)] sm:inline">
            {t('home.viewAllCourses')} →
          </Link>
        </div>
        {isLoading ? (
          <LoadingState />
        ) : isError || !featuredCourses?.length ? (
          <EmptyState
            icon={BookOpen}
            title={t('home.featuredEmpty')}
            description={t('home.featuredEmptyDesc')}
            actionLabel={t('home.browseCourses')}
            onAction={() => window.location.assign('/courses')}
          />
        ) : (
          <div className="grid gap-7 md:grid-cols-3">
            {featuredCourses.map((course: any) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnailUrl={course.thumbnailUrl}
                price={course.price}
                level={course.level}
                teacherName={
                  course.teacher?.user
                    ? `${t('home.by')} ${course.teacher.user.firstName} ${course.teacher.user.lastName}`
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="relative mx-auto mt-28 max-w-6xl overflow-hidden rounded-sm px-4 sm:px-6">
        <div className="relative min-h-[380px]">
          <Photo src={photos.library} alt="" className="absolute inset-0 h-full w-full" zoom={false} />
          <div className="absolute inset-0 bg-[var(--primary-dark)]/55" />
          <div className="relative flex min-h-[380px] flex-col items-start justify-end p-8 text-white sm:p-12">
            <h2 className="max-w-xl text-4xl sm:text-5xl">{t('home.ctaTitle')}</h2>
            <p className="mt-4 max-w-lg text-white/85">{t('home.ctaDesc')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register/student">
                <Button size="lg" className="rounded-sm bg-white text-[var(--primary-dark)] hover:bg-[var(--bg-secondary)]">
                  {t('home.signUpStudent')}
                </Button>
              </Link>
              <Link to="/register/teacher">
                <Button size="lg" variant="outline" className="rounded-sm border-white/40 bg-transparent text-white hover:bg-white/10">
                  {t('home.signUpTeacher')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
