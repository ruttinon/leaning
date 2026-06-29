import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminTeacherApprovalsPage } from '@/pages/admin/AdminTeacherApprovalsPage'
import { AdminCourseApprovalsPage } from '@/pages/admin/AdminCourseApprovalsPage'
import { AdminSubjectsPage } from '@/pages/admin/AdminSubjectsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage'
import { AdminAnnouncementsPage } from '@/pages/admin/AdminAnnouncementsPage'
import { ProfilePage } from '@/pages/common/ProfilePage'
import { NotificationsPage } from '@/pages/common/NotificationsPage'

export function AdminDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <header className="bg-white border-b h-16 sticky top-0 z-30 flex items-center justify-end px-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              สวัสดี, {user?.firstName}
            </span>
          </div>
        </header>

        <div className="p-6">
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
        </div>
      </main>
    </div>
  )
}
