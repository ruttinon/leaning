import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { photos } from '@/lib/media'

interface DashboardTodo {
  type: 'CONTINUE_COURSE' | 'ASSIGNMENT'
  title: string
  courseId: string
  courseTitle: string
  lessonId?: string
  assignmentId?: string
  progress?: number
}

interface DashboardData {
  totalEnrollments: number
  completedLessons: number
  averageProgress: number
  averageScorePercent: number | null
  todos: DashboardTodo[]
  studentProfile?: {
    enrollments?: Array<{
      id: string
      progress: number
      course: {
        id: string
        title: string
        teacher?: { user?: { firstName?: string; lastName?: string } }
      }
    }>
  }
}

function getTodoHref(todo: DashboardTodo) {
  if (todo.type === 'ASSIGNMENT' && todo.lessonId) {
    return `/student/courses/${todo.courseId}`
  }
  return `/student/courses/${todo.courseId}`
}

export function StudentDashboardPage() {
  const { t } = useTranslation()
  const { data: dashboard, isLoading, isError, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => api.get<DashboardData>('/student/dashboard'),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const stats = [
    [t('studentDashboard.enrolledCourses'), dashboard?.totalEnrollments || 0],
    [t('studentDashboard.completedLessons'), dashboard?.completedLessons || 0],
    [t('studentDashboard.progress'), `${dashboard?.averageProgress ?? 0}%`],
    [
      t('studentDashboard.averageScore'),
      dashboard?.averageScorePercent != null ? `${dashboard.averageScorePercent}%` : '-',
    ],
  ] as const

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-sm">
        <img src={photos.heroStudy} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[var(--primary-dark)]/60" />
        <div className="relative px-6 py-10 text-white">
          <p className="kicker text-white/75">{t('studentDashboard.welcomeBack')}</p>
          <h1 className="mt-2 text-4xl">{t('studentDashboard.title')}</h1>
          <p className="mt-2 max-w-lg text-sm text-white/80">{t('studentDashboard.subtitle')}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-[var(--border)] py-6 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl">{t('studentDashboard.activeCourses')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('studentDashboard.continueLearning')}</p>
            </div>
            <Link to="/student/my-courses" className="text-sm font-medium text-primary">
              {t('studentDashboard.viewAll')}
            </Link>
          </div>

          {dashboard?.studentProfile?.enrollments && dashboard.studentProfile.enrollments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dashboard.studentProfile.enrollments.slice(0, 4).map((enrollment) => (
                <div key={enrollment.id} className="border border-[var(--border)] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold">{enrollment.course.title}</h3>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {t('studentDashboard.inProgress')}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-[var(--text-muted)]">
                    {t('studentDashboard.teacher')}{' '}
                    {enrollment.course.teacher?.user?.firstName}{' '}
                    {enrollment.course.teacher?.user?.lastName}
                  </p>
                  <div className="mb-2 flex items-center justify-between text-sm text-[var(--text-muted)]">
                    <span>{t('studentDashboard.progress')}</span>
                    <span>{enrollment.progress || 0}%</span>
                  </div>
                  <div className="h-1 bg-[var(--bg-tertiary)]">
                    <div
                      className="h-1 bg-[var(--primary)]"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    />
                  </div>
                  <Link
                    to={`/student/courses/${enrollment.course.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
                  >
                    {t('studentDashboard.continue')} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--text-muted)]">
              {t('studentDashboard.noCourses')}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h3 className="mb-3 text-xl">{t('studentDashboard.todos')}</h3>
            {!dashboard?.todos?.length ? (
              <p className="text-sm text-[var(--text-muted)]">{t('studentDashboard.noTodos')}</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {dashboard.todos.map((todo, index) => (
                  <li key={`${todo.type}-${todo.courseId}-${index}`} className="border border-[var(--border)] p-3">
                    <Link to={getTodoHref(todo)} className="block hover:text-primary">
                      <div className="flex items-start gap-2">
                        {todo.type === 'ASSIGNMENT' ? (
                          <FileText className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        ) : (
                          <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{todo.title}</p>
                          <p className="text-xs text-[var(--text-muted)]">{todo.courseTitle}</p>
                          {todo.type === 'CONTINUE_COURSE' && todo.progress != null && (
                            <p className="text-xs text-primary">
                              {t('studentDashboard.progress')}: {todo.progress}%
                            </p>
                          )}
                          {todo.type === 'ASSIGNMENT' && (
                            <p className="text-xs text-amber-800">{t('studentDashboard.pendingAssignment')}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h3 className="mb-2 text-xl">{t('studentDashboard.help')}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{t('studentDashboard.helpDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
