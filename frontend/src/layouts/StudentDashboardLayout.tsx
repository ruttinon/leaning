import { Suspense, useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/BackButton'
import { RouteFallback } from '@/components/RouteFallback'
import { 
  LayoutDashboard, 
  BookOpen, 
  Search,
  TrendingUp,
  Award, 
  User, 
  LogOut,
  Menu,
  X,
  CreditCard,
  Bell,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { API_BASE_URL } from '@/lib/api'
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

export function StudentDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const isDashboardHome = location.pathname === '/student/dashboard'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'แดชบอร์ด', path: '/student/dashboard' },
    { icon: BookOpen, label: 'คอร์สของฉัน', path: '/student/my-courses' },
    { icon: Search, label: 'ค้นหาคอร์ส', path: '/student/browse-courses' },
    { icon: TrendingUp, label: 'ความก้าวหน้า', path: '/student/progress' },
    { icon: Award, label: 'คะแนน', path: '/student/scores' },
    { icon: CreditCard, label: 'การชำระเงิน', path: '/student/payments' },
    { icon: Bell, label: 'การแจ้งเตือน', path: '/student/notifications' },
    { icon: User, label: 'โปรไฟล์', path: '/student/profile' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-shrink-0 border-b p-6">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">EduPlatform</span>
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
                className="flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100"
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
              ออกจากระบบ
            </Button>
          </div>
        </nav>

        <div className="flex-shrink-0 border-t p-4">
          <div className="flex items-center gap-3">
            {user?.studentProfile?.avatarUrl ? (
              <img
                src={API_BASE_URL + user.studentProfile.avatarUrl}
                alt="Profile"
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white">
                {user?.firstName?.charAt(0) || 'S'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">นักเรียน</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
          <div>
            {!isDashboardHome && <BackButton fallback="/student/dashboard" />}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              สวัสดี, {user?.firstName}
            </span>
          </div>
        </header>

        <div className="p-6">
          <Suspense fallback={<RouteFallback label="Loading student area..." />}>
            <Routes>
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="my-courses" element={<StudentMyCoursesPage />} />
              <Route path="browse-courses" element={<StudentBrowseCoursesPage />} />
              <Route path="courses/:courseId" element={<StudentCourseDetailPage />} />
              <Route path="quizzes/:quizId" element={<StudentQuizPage />} />
              <Route path="materials/:materialId" element={<StudentMaterialPage />} />
              <Route path="progress" element={<StudentProgressPage />} />
              <Route path="scores" element={<StudentScoresPage />} />
              <Route path="payments" element={<StudentPaymentsPage />} />
              <Route
                path="payments/:paymentId/checkout"
                element={<StudentPaymentCheckoutPage />}
              />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<StudentDashboardPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
