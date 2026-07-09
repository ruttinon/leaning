import { Suspense, useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/BackButton'
import { RouteFallback } from '@/components/RouteFallback'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  FileText,
  LogOut,
  Menu,
  X,
  Ticket,
  User,
  Bell,
  Megaphone,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { lazyNamed } from '@/lib/lazy'

const AdminDashboardPage = lazyNamed(
  () => import('@/pages/admin/AdminDashboardPage'),
  'AdminDashboardPage',
)
const AdminTeacherApprovalsPage = lazyNamed(
  () => import('@/pages/admin/AdminTeacherApprovalsPage'),
  'AdminTeacherApprovalsPage',
)
const AdminCourseApprovalsPage = lazyNamed(
  () => import('@/pages/admin/AdminCourseApprovalsPage'),
  'AdminCourseApprovalsPage',
)
const AdminSubjectsPage = lazyNamed(
  () => import('@/pages/admin/AdminSubjectsPage'),
  'AdminSubjectsPage',
)
const AdminUsersPage = lazyNamed(
  () => import('@/pages/admin/AdminUsersPage'),
  'AdminUsersPage',
)
const AdminCouponsPage = lazyNamed(
  () => import('@/pages/admin/AdminCouponsPage'),
  'AdminCouponsPage',
)
const AdminAnnouncementsPage = lazyNamed(
  () => import('@/pages/admin/AdminAnnouncementsPage'),
  'AdminAnnouncementsPage',
)
const ProfilePage = lazyNamed(() => import('@/pages/common/ProfilePage'), 'ProfilePage')
const NotificationsPage = lazyNamed(
  () => import('@/pages/common/NotificationsPage'),
  'NotificationsPage',
)

export function AdminDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const isDashboardHome = location.pathname === '/admin/dashboard'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'แดชบอร์ด', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'อนุมัติครู', path: '/admin/teacher-approvals' },
    { icon: BookOpen, label: 'อนุมัติคอร์ส', path: '/admin/course-approvals' },
    { icon: FileText, label: 'จัดการวิชา', path: '/admin/subjects' },
    { icon: Ticket, label: 'จัดการคูปอง', path: '/admin/coupons' },
    { icon: Users, label: 'จัดการผู้ใช้', path: '/admin/users' },
    { icon: Megaphone, label: 'จัดการประกาศ', path: '/admin/announcements' },
    { icon: Bell, label: 'การแจ้งเตือน', path: '/admin/notifications' },
    { icon: User, label: 'โปรไฟล์', path: '/admin/profile' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-semibold text-white">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
          <div>
            {!isDashboardHome && <BackButton fallback="/admin/dashboard" />}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              สวัสดี, {user?.firstName}
            </span>
          </div>
        </header>

        <div className="p-6">
          <Suspense fallback={<RouteFallback label="Loading admin area..." />}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="teacher-approvals" element={<AdminTeacherApprovalsPage />} />
              <Route path="course-approvals" element={<AdminCourseApprovalsPage />} />
              <Route path="subjects" element={<AdminSubjectsPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<AdminDashboardPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
