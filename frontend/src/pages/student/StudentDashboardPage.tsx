import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Award, TrendingUp, Clock3, ArrowRight, Sparkles, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'

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
    {
      title: t('studentDashboard.enrolledCourses'),
      value: dashboard?.totalEnrollments || 0,
      icon: BookOpen,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
    },
    {
      title: t('studentDashboard.completedLessons'),
      value: dashboard?.completedLessons || 0,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('studentDashboard.progress'),
      value: `${dashboard?.averageProgress ?? 0}%`,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: t('studentDashboard.averageScore'),
      value:
        dashboard?.averageScorePercent != null ? `${dashboard.averageScorePercent}%` : '-',
      icon: Award,
      color: 'text-amber-800',
      bgColor: 'bg-amber-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-800 via-green-700 to-amber-700 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {t('studentDashboard.welcomeBack')}
            </div>
            <h1 className="text-2xl font-bold">{t('studentDashboard.title')}</h1>
            <p className="mt-2 text-sm text-emerald-50">{t('studentDashboard.subtitle')}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
            <div className="flex items-center gap-3 text-sm">
              <Clock3 className="h-5 w-5" />
              <span>{t('studentDashboard.learnAnytime')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} rounded-xl p-2`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t('studentDashboard.activeCourses')}</h2>
              <p className="text-sm text-slate-500">{t('studentDashboard.continueLearning')}</p>
            </div>
            <Link to="/student/my-courses" className="text-sm font-medium text-emerald-700">
              {t('studentDashboard.viewAll')}
            </Link>
          </div>

          {dashboard?.studentProfile?.enrollments && dashboard.studentProfile.enrollments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dashboard.studentProfile.enrollments.slice(0, 4).map((enrollment) => (
                <div key={enrollment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{enrollment.course.title}</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {t('studentDashboard.inProgress')}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-slate-500">
                    {t('studentDashboard.teacher')}{' '}
                    {enrollment.course.teacher?.user?.firstName}{' '}
                    {enrollment.course.teacher?.user?.lastName}
                  </p>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                    <span>{t('studentDashboard.progress')}</span>
                    <span>{enrollment.progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-emerald-700"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    />
                  </div>
                  <Link
                    to={`/student/courses/${enrollment.course.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    {t('studentDashboard.continue')} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              {t('studentDashboard.noCourses')}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold text-slate-900">{t('studentDashboard.todos')}</h3>
              {!dashboard?.todos?.length ? (
                <p className="text-sm text-slate-500">{t('studentDashboard.noTodos')}</p>
              ) : (
                <ul className="space-y-3 text-sm text-slate-600">
                  {dashboard.todos.map((todo, index) => (
                    <li key={`${todo.type}-${todo.courseId}-${index}`} className="rounded-xl bg-slate-50 p-3">
                      <Link to={getTodoHref(todo)} className="block hover:text-emerald-700">
                        <div className="flex items-start gap-2">
                          {todo.type === 'ASSIGNMENT' ? (
                            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          ) : (
                            <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{todo.title}</p>
                            <p className="text-xs text-slate-500">{todo.courseTitle}</p>
                            {todo.type === 'CONTINUE_COURSE' && todo.progress != null && (
                              <p className="text-xs text-emerald-700">
                                {t('studentDashboard.progress')}: {todo.progress}%
                              </p>
                            )}
                            {todo.type === 'ASSIGNMENT' && (
                              <p className="text-xs text-amber-700">{t('studentDashboard.pendingAssignment')}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold text-slate-900">{t('studentDashboard.help')}</h3>
              <p className="text-sm text-slate-600">{t('studentDashboard.helpDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
