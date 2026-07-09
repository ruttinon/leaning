import { Suspense, useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/BackButton'
import { RouteFallback } from '@/components/RouteFallback'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  File,
  HelpCircle,
  CheckSquare,
  Users,
  Video,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { API_BASE_URL } from '@/lib/api'
import { lazyNamed } from '@/lib/lazy'
import { useAppStore } from '@/store/theme-store'
import { DashboardThemeToggle } from '@/components/DashboardThemeToggle'
import { TeacherApprovalBanner } from '@/components/TeacherApprovalBanner'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme } = useAppStore()
  const { t } = useTranslation()
  const isDashboardHome = location.pathname === '/teacher/dashboard'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/teacher/dashboard' },
    { icon: BookOpen, label: t('teacherDashboard.myCourses'), path: '/teacher/courses' },
    { icon: File, label: t('teacherDashboard.materials'), path: '/teacher/materials' },
    { icon: HelpCircle, label: t('teacherDashboard.quizzes'), path: '/teacher/quizzes' },
    { icon: CheckSquare, label: t('teacherDashboard.exams'), path: '/teacher/exams' },
    { icon: FileText, label: t('teacherDashboard.assignments'), path: '/teacher/assignments' },
    { icon: Users, label: t('teacherDashboard.students'), path: '/teacher/students' },
    { icon: Video, label: t('teacherDashboard.liveClasses'), path: '/teacher/live-classes' },
    { icon: Award, label: t('teacherDashboard.gradebook'), path: '/teacher/gradebook' },
    { icon: Bell, label: t('common.notifications'), path: '/teacher/notifications' },
    { icon: User, label: t('common.profile'), path: '/teacher/profile' },
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-gray-50'}`}>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r transition-transform duration-300 ease-in-out ${
          theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex-shrink-0 border-b p-6">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">EduPro</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'bg-emerald-50 text-emerald-800 font-medium dark:bg-emerald-950/40 dark:text-emerald-300'
                    : theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}

          <div className="mt-4 border-t pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t('common.logout')}
            </Button>
          </div>
        </nav>

        <div className="flex-shrink-0 border-t p-4">
          <div className="flex items-center gap-3">
            {user?.teacherProfile?.avatarUrl ? (
              <img
                src={API_BASE_URL + user.teacherProfile.avatarUrl}
                alt="Profile"
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-semibold text-white">
                {user?.firstName?.charAt(0) || 'T'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">ครูผู้สอน</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <header className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 ${
          theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
        }`}>
          <div>
            {!isDashboardHome && <BackButton fallback="/teacher/dashboard" />}
          </div>
          <div className="flex items-center space-x-4">
            <DashboardThemeToggle />
            <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
              {t('teacherDashboard.welcome', { name: user?.firstName || '' })}
            </span>
          </div>
        </header>

        <div className="p-6">
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
              <Route
                path="gradebook"
                element={
                  <div className="space-y-6">
                    <h1 className="text-2xl font-bold">เกรด</h1>
                    <p className="text-gray-600">เลือกคอร์สเพื่อดูสมุดคะแนน</p>
                  </div>
                }
              />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<TeacherDashboardPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
