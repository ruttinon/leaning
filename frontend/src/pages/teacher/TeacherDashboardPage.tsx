import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, TrendingUp, Users, Plus, ArrowRight, Sparkles, Inbox, Award } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { isApiError } from '@/lib/api-error'
import { useTranslation } from '@/lib/i18n'

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

  if (isLoading) {
    return <LoadingState />
  }

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
    {
      title: t('teacherDashboard.totalCourses'),
      value: dashboard?.totalCourses || 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('teacherDashboard.publishedCourses'),
      value: dashboard?.publishedCourses || 0,
      icon: TrendingUp,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
    },
    {
      title: t('teacherDashboard.totalStudents'),
      value: dashboard?.totalEnrollments || 0,
      icon: Users,
      color: 'text-amber-800',
      bgColor: 'bg-amber-100',
    },
    {
      title: t('teacherDashboard.averageScore'),
      value:
        dashboard?.averageScorePercent != null
          ? `${dashboard.averageScorePercent}%`
          : '-',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  const quickActions = [
    {
      title: t('teacherDashboard.quickCreateTitle'),
      description: t('teacherDashboard.quickCreateDesc'),
      href: '/teacher/courses/create',
      icon: Plus,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      title: t('teacherDashboard.quickSubmissionsTitle'),
      description: t('teacherDashboard.quickSubmissionsDesc'),
      href: '/teacher/submissions',
      icon: Inbox,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      title: t('teacherDashboard.quickGradebookTitle'),
      description: t('teacherDashboard.quickGradebookDesc'),
      href: '/teacher/gradebook',
      icon: Award,
      accent: 'from-violet-500 to-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {t('teacherDashboard.platformBadge')}
            </div>
            <h1 className="text-2xl font-bold">{t('teacherDashboard.pageTitle')}</h1>
            <p className="mt-2 text-sm text-emerald-50">{t('teacherDashboard.pageSubtitle')}</p>
          </div>
          <Link to="/teacher/courses/create" className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur">
            <Plus className="h-4 w-4" />
            {t('teacherDashboard.createNewCourse')}
          </Link>
        </div>
      </div>

      {(dashboard?.pendingSubmissions ?? 0) > 0 && (
        <Link
          to="/teacher/submissions"
          className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 transition-colors hover:bg-amber-100"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-200 p-2">
              <Inbox className="h-5 w-5 text-amber-800" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">
                {t('teacherDashboard.pendingSubmissions', { count: String(dashboard?.pendingSubmissions ?? 0) })}
              </p>
              <p className="text-sm text-amber-700">{t('teacherDashboard.pendingSubmissionsDesc')}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-amber-700" />
        </Link>
      )}

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

      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} to={action.href} className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${action.accent} p-5 text-white shadow-sm`}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{action.title}</h3>
              <p className="mt-1 text-sm text-white/80">{action.description}</p>
            </Link>
          )
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t('teacherDashboard.yourCourses')}</h2>
            <p className="text-sm text-slate-500">{t('teacherDashboard.yourCoursesDesc')}</p>
          </div>
          <Link to="/teacher/courses" className="text-sm font-medium text-emerald-600">{t('studentDashboard.viewAll')}</Link>
        </div>

        {dashboard?.teacherProfile?.courses && dashboard.teacherProfile.courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {dashboard.teacherProfile.courses.slice(0, 4).map((course: any) => (
              <div key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{course.title}</h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {course.status === 'PUBLISHED' ? t('teacherDashboard.published') : course.status}
                  </span>
                </div>
                <p className="mb-4 text-sm text-slate-500">{t('teacherDashboard.courseReady')}</p>
                <Link to={`/teacher/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  {t('teacherDashboard.manageCourse')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            {t('teacherDashboard.noCoursesYet')}
          </div>
        )}
      </div>
    </div>
  )
}
