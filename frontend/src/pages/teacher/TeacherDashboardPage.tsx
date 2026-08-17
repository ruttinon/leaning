import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Inbox } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { isApiError } from '@/lib/api-error'
import { useTranslation } from '@/lib/i18n'
import { photos } from '@/lib/media'

interface DashboardData {
  totalCourses: number
  publishedCourses: number
  totalEnrollments: number
  pendingSubmissions: number
  averageScorePercent: number | null
  teacherProfile?: {
    courses?: Array<any>
  }
}

export function TeacherDashboardPage() {
  const { t } = useTranslation()
  const { data: dashboard, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => api.get<DashboardData>('/teacher/dashboard'),
  })

  if (isLoading) return <LoadingState />

  if (isError) {
    const message = isApiError(error) ? error.message : undefined
    return (
      <ErrorState
        title={t('teacherDashboard.loadError')}
        message={message}
        onRetry={() => refetch()}
      />
    )
  }

  const stats = [
    [t('teacherDashboard.totalCourses'), dashboard?.totalCourses || 0],
    [t('teacherDashboard.publishedCourses'), dashboard?.publishedCourses || 0],
    [t('teacherDashboard.totalStudents'), dashboard?.totalEnrollments || 0],
    [
      t('teacherDashboard.averageScore'),
      dashboard?.averageScorePercent != null ? `${dashboard.averageScorePercent}%` : '-',
    ],
  ] as const

  const quickActions = [
    {
      title: t('teacherDashboard.quickCreateTitle'),
      description: t('teacherDashboard.quickCreateDesc'),
      href: '/teacher/courses/create',
    },
    {
      title: t('teacherDashboard.quickSubmissionsTitle'),
      description: t('teacherDashboard.quickSubmissionsDesc'),
      href: '/teacher/submissions',
    },
    {
      title: t('teacherDashboard.quickGradebookTitle'),
      description: t('teacherDashboard.quickGradebookDesc'),
      href: '/teacher/gradebook',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-sm">
        <img src={photos.teacherDesk} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[var(--primary-dark)]/62" />
        <div className="relative flex flex-col gap-4 px-6 py-10 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <p className="kicker text-white/75">{t('teacherDashboard.platformBadge')}</p>
            <h1 className="mt-2 text-4xl">{t('teacherDashboard.pageTitle')}</h1>
            <p className="mt-2 max-w-lg text-sm text-white/80">{t('teacherDashboard.pageSubtitle')}</p>
          </div>
          <Link
            to="/teacher/courses/create"
            className="inline-flex items-center gap-2 rounded-sm bg-white px-4 py-2 text-sm font-medium text-[var(--primary-dark)]"
          >
            {t('teacherDashboard.createNewCourse')}
          </Link>
        </div>
      </div>

      {(dashboard?.pendingSubmissions ?? 0) > 0 && (
        <Link
          to="/teacher/submissions"
          className="flex items-center justify-between border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-amber-800" />
            <div>
              <p className="font-medium">
                {t('teacherDashboard.pendingSubmissions', { count: String(dashboard?.pendingSubmissions ?? 0) })}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{t('teacherDashboard.pendingSubmissionsDesc')}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
        </Link>
      )}

      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-[var(--border)] py-6 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--primary)]"
          >
            <p className="kicker">ทางลัด</p>
            <h3 className="mt-2 text-xl">{action.title}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{action.description}</p>
          </Link>
        ))}
      </div>

      <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl">{t('teacherDashboard.yourCourses')}</h2>
            <p className="text-sm text-[var(--text-muted)]">{t('teacherDashboard.yourCoursesDesc')}</p>
          </div>
          <Link to="/teacher/courses" className="text-sm font-medium text-primary">
            {t('studentDashboard.viewAll')}
          </Link>
        </div>

        {dashboard?.teacherProfile?.courses && dashboard.teacherProfile.courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {dashboard.teacherProfile.courses.slice(0, 4).map((course: any) => (
              <div key={course.id} className="border border-[var(--border)] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {course.status === 'PUBLISHED' ? t('teacherDashboard.published') : course.status}
                  </span>
                </div>
                <p className="mb-4 text-sm text-[var(--text-muted)]">{t('teacherDashboard.courseReady')}</p>
                <Link
                  to={`/teacher/courses/${course.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  {t('teacherDashboard.manageCourse')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--text-muted)]">
            {t('teacherDashboard.noCoursesYet')}
          </p>
        )}
      </div>
    </div>
  )
}
