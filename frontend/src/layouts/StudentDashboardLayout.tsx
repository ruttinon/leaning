import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage'
import { StudentMyCoursesPage } from '@/pages/student/StudentMyCoursesPage'
import { StudentBrowseCoursesPage } from '@/pages/student/StudentBrowseCoursesPage'
import { StudentCourseDetailPage } from '@/pages/student/StudentCourseDetailPage'
import { StudentScoresPage } from '@/pages/student/StudentScoresPage'
import { StudentProgressPage } from '@/pages/student/StudentProgressPage'
import { StudentQuizPage } from '@/pages/student/StudentQuizPage'
import { StudentMaterialPage } from '@/pages/student/StudentMaterialPage'
import { StudentPaymentsPage } from '@/pages/student/StudentPaymentsPage'
import { ProfilePage } from '@/pages/common/ProfilePage'
import { NotificationsPage } from '@/pages/common/NotificationsPage'

export function StudentDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">EduPlatform</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          
          <div className="pt-4 mt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              ออกจากระบบ
            </Button>
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center space-x-3">
            {user?.studentProfile?.avatarUrl ? (
              <img
                src={API_BASE_URL + user.studentProfile.avatarUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.charAt(0) || 'S'}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">นักเรียน</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b h-16 sticky top-0 z-30 flex items-center justify-end px-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              สวัสดี, {user?.firstName}
            </span>
          </div>
        </header>

        <div className="p-6">
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
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<StudentDashboardPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
