import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RouteFallback } from '@/components/RouteFallback'
import { DashboardShell } from '@/components/DashboardShell'
import { TeacherApprovalBanner } from '@/components/TeacherApprovalBanner'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  User,
  Bell,
  File,
  HelpCircle,
  CheckSquare,
  Users,
  Video,
  Inbox,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { lazyNamed } from '@/lib/lazy'
import { useTranslation } from '@/lib/i18n'

const TeacherDashboardPage = lazyNamed(
  () => import('@/pages/teacher/TeacherDashboardPage'),
  'TeacherDashboardPage',
)
const TeacherCoursesPage = lazyNamed(
  () => import('@/pages/teacher/TeacherCoursesPage'),
  'TeacherCoursesPage',
)
const TeacherSubmissionsPage = lazyNamed(
  () => import('@/pages/teacher/TeacherSubmissionsPage'),
  'TeacherSubmissionsPage',
)
const QuickCreateCoursePage = lazyNamed(
  () => import('@/pages/teacher/QuickCreateCoursePage'),
  'QuickCreateCoursePage',
)
const TeacherCourseDetailPage = lazyNamed(
  () => import('@/pages/teacher/TeacherCourseDetailPage'),
  'TeacherCourseDetailPage',
)
const TeacherLessonDetailPage = lazyNamed(
  () => import('@/pages/teacher/TeacherLessonDetailPage'),
  'TeacherLessonDetailPage',
)
const TeacherGradebookPage = lazyNamed(
  () => import('@/pages/teacher/TeacherGradebookPage'),
  'TeacherGradebookPage',
)
const TeacherGradebookIndexPage = lazyNamed(
  () => import('@/pages/teacher/TeacherGradebookIndexPage'),
  'TeacherGradebookIndexPage',
)
const ProfilePage = lazyNamed(() => import('@/pages/common/ProfilePage'), 'ProfilePage')
const NotificationsPage = lazyNamed(
  () => import('@/pages/common/NotificationsPage'),
  'NotificationsPage',
)
const TeacherMaterialsPage = lazyNamed(
  () => import('@/pages/teacher/TeacherMaterialsPage'),
  'TeacherMaterialsPage',
)
const TeacherQuizzesPage = lazyNamed(
  () => import('@/pages/teacher/TeacherQuizzesPage'),
  'TeacherQuizzesPage',
)
const TeacherExamsPage = lazyNamed(
  () => import('@/pages/teacher/TeacherExamsPage'),
  'TeacherExamsPage',
)
const TeacherAssignmentsPage = lazyNamed(
  () => import('@/pages/teacher/TeacherAssignmentsPage'),
  'TeacherAssignmentsPage',
)
const TeacherStudentsPage = lazyNamed(
  () => import('@/pages/teacher/TeacherStudentsPage'),
  'TeacherStudentsPage',
)
const TeacherLiveClassesPage = lazyNamed(
  () => import('@/pages/teacher/TeacherLiveClassesPage'),
  'TeacherLiveClassesPage',
)

export function TeacherDashboardLayout() {
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const navItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/teacher/dashboard' },
    { icon: BookOpen, label: t('teacherDashboard.myCourses'), path: '/teacher/courses' },
    { icon: File, label: t('teacherDashboard.materialsShort'), path: '/teacher/materials' },
    { icon: HelpCircle, label: t('teacherDashboard.quizzes'), path: '/teacher/quizzes' },
    { icon: CheckSquare, label: t('teacherDashboard.exams'), path: '/teacher/exams' },
    { icon: FileText, label: t('teacherDashboard.assignments'), path: '/teacher/assignments' },
    { icon: Inbox, label: t('teacherDashboard.submissions'), path: '/teacher/submissions' },
    { icon: Users, label: t('teacherDashboard.students'), path: '/teacher/students' },
    { icon: Video, label: t('teacherDashboard.liveClasses'), path: '/teacher/live-classes' },
    { icon: Award, label: t('teacherDashboard.gradebook'), path: '/teacher/gradebook' },
    { icon: Bell, label: t('common.notifications'), path: '/teacher/notifications' },
    { icon: User, label: t('common.profile'), path: '/teacher/profile' },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      brandTo="/teacher/dashboard"
      homePath="/teacher/dashboard"
      roleLabel="ครูผู้สอน"
      avatarUrl={user?.teacherProfile?.avatarUrl}
    >
      <TeacherApprovalBanner />
      <Suspense fallback={<RouteFallback label="Loading teacher area..." />}>
        <Routes>
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="courses" element={<TeacherCoursesPage />} />
          <Route path="courses/quick-create" element={<QuickCreateCoursePage />} />
          <Route path="courses/create" element={<QuickCreateCoursePage />} />
          <Route path="courses/:courseId" element={<TeacherCourseDetailPage />} />
          <Route path="lessons/:lessonId" element={<TeacherLessonDetailPage />} />
          <Route path="submissions" element={<TeacherSubmissionsPage />} />
          <Route path="materials" element={<TeacherMaterialsPage />} />
          <Route path="quizzes" element={<TeacherQuizzesPage />} />
          <Route path="exams" element={<TeacherExamsPage />} />
          <Route path="assignments" element={<TeacherAssignmentsPage />} />
          <Route path="students" element={<TeacherStudentsPage />} />
          <Route path="live-classes" element={<TeacherLiveClassesPage />} />
          <Route path="gradebook/:courseId" element={<TeacherGradebookPage />} />
          <Route path="gradebook" element={<TeacherGradebookIndexPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<TeacherDashboardPage />} />
        </Routes>
      </Suspense>
    </DashboardShell>
  )
}
