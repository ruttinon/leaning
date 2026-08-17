import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RouteFallback } from '@/components/RouteFallback'
import { DashboardShell } from '@/components/DashboardShell'
import { useTranslation } from '@/lib/i18n'
import {
  LayoutDashboard,
  BookOpen,
  Search,
  TrendingUp,
  Award,
  User,
  CreditCard,
  Bell,
  Video,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { lazyNamed } from '@/lib/lazy'

const StudentDashboardPage = lazyNamed(
  () => import('@/pages/student/StudentDashboardPage'),
  'StudentDashboardPage',
)
const StudentMyCoursesPage = lazyNamed(
  () => import('@/pages/student/StudentMyCoursesPage'),
  'StudentMyCoursesPage',
)
const StudentBrowseCoursesPage = lazyNamed(
  () => import('@/pages/student/StudentBrowseCoursesPage'),
  'StudentBrowseCoursesPage',
)
const StudentCourseDetailPage = lazyNamed(
  () => import('@/pages/student/StudentCourseDetailPage'),
  'StudentCourseDetailPage',
)
const StudentScoresPage = lazyNamed(
  () => import('@/pages/student/StudentScoresPage'),
  'StudentScoresPage',
)
const StudentProgressPage = lazyNamed(
  () => import('@/pages/student/StudentProgressPage'),
  'StudentProgressPage',
)
const StudentQuizPage = lazyNamed(
  () => import('@/pages/student/StudentQuizPage'),
  'StudentQuizPage',
)
const StudentMaterialPage = lazyNamed(
  () => import('@/pages/student/StudentMaterialPage'),
  'StudentMaterialPage',
)
const StudentPaymentsPage = lazyNamed(
  () => import('@/pages/student/StudentPaymentsPage'),
  'StudentPaymentsPage',
)
const StudentPaymentCheckoutPage = lazyNamed(
  () => import('@/pages/student/StudentPaymentCheckoutPage'),
  'StudentPaymentCheckoutPage',
)
const ProfilePage = lazyNamed(() => import('@/pages/common/ProfilePage'), 'ProfilePage')
const NotificationsPage = lazyNamed(
  () => import('@/pages/common/NotificationsPage'),
  'NotificationsPage',
)
const StudentLiveClassesPage = lazyNamed(
  () => import('@/pages/student/StudentLiveClassesPage'),
  'StudentLiveClassesPage',
)

export function StudentDashboardLayout() {
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const navItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/student/dashboard' },
    { icon: BookOpen, label: t('common.myCourses'), path: '/student/my-courses' },
    { icon: Search, label: t('common.browseCourses'), path: '/student/browse-courses' },
    { icon: Video, label: t('liveClasses.title'), path: '/student/live-classes' },
    { icon: TrendingUp, label: t('studentDashboard.progress'), path: '/student/progress' },
    { icon: Award, label: t('studentDashboard.scores'), path: '/student/scores' },
    { icon: CreditCard, label: t('studentDashboard.payments'), path: '/student/payments' },
    { icon: Bell, label: t('common.notifications'), path: '/student/notifications' },
    { icon: User, label: t('common.profile'), path: '/student/profile' },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      brandTo="/student/dashboard"
      homePath="/student/dashboard"
      roleLabel="นักเรียน"
      avatarUrl={user?.studentProfile?.avatarUrl}
    >
      <Suspense fallback={<RouteFallback label="Loading student area..." />}>
        <Routes>
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="my-courses" element={<StudentMyCoursesPage />} />
          <Route path="browse-courses" element={<StudentBrowseCoursesPage />} />
          <Route path="live-classes" element={<StudentLiveClassesPage />} />
          <Route path="courses/:courseId" element={<StudentCourseDetailPage />} />
          <Route path="quizzes/:quizId" element={<StudentQuizPage />} />
          <Route path="materials/:materialId" element={<StudentMaterialPage />} />
          <Route path="progress" element={<StudentProgressPage />} />
          <Route path="scores" element={<StudentScoresPage />} />
          <Route path="payments" element={<StudentPaymentsPage />} />
          <Route path="payments/:paymentId/checkout" element={<StudentPaymentCheckoutPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<StudentDashboardPage />} />
        </Routes>
      </Suspense>
    </DashboardShell>
  )
}
