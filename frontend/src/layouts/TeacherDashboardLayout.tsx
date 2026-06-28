import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
import { TeacherDashboardPage } from '@/pages/teacher/TeacherDashboardPage'
import { TeacherCoursesPage } from '@/pages/teacher/TeacherCoursesPage'
import { TeacherSubmissionsPage } from '@/pages/teacher/TeacherSubmissionsPage'
import { CreateCoursePage } from '@/pages/teacher/CreateCoursePage'
import { TeacherCourseDetailPage } from '@/pages/teacher/TeacherCourseDetailPage'
import { TeacherLessonDetailPage } from '@/pages/teacher/TeacherLessonDetailPage'
import { TeacherGradebookPage } from '@/pages/teacher/TeacherGradebookPage'
import { ProfilePage } from '@/pages/common/ProfilePage'
import { NotificationsPage } from '@/pages/common/NotificationsPage'
import { TeacherMaterialsPage } from '@/pages/teacher/TeacherMaterialsPage'
import { TeacherQuizzesPage } from '@/pages/teacher/TeacherQuizzesPage'
import { TeacherExamsPage } from '@/pages/teacher/TeacherExamsPage'
import { TeacherAssignmentsPage } from '@/pages/teacher/TeacherAssignmentsPage'
import { TeacherStudentsPage } from '@/pages/teacher/TeacherStudentsPage'
import { TeacherLiveClassesPage } from '@/pages/teacher/TeacherLiveClassesPage'

export function TeacherDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'แดชบอร์ด', path: '/teacher/dashboard' },
    { icon: BookOpen, label: 'คอร์สของฉัน', path: '/teacher/courses' },
    { icon: File, label: 'วัสดุการสอน', path: '/teacher/materials' },
    { icon: HelpCircle, label: 'Quiz', path: '/teacher/quizzes' },
    { icon: CheckSquare, label: 'Exam', path: '/teacher/exams' },
    { icon: FileText, label: 'Assignment', path: '/teacher/assignments' },
    { icon: Users, label: 'นักเรียน', path: '/teacher/students' },
    { icon: Video, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: Award, label: 'เกรด', path: '/teacher/gradebook' },
    { icon: Bell, label: 'การแจ้งเตือน', path: '/teacher/notifications' },
    { icon: User, label: 'โปรไฟล์', path: '/teacher/profile' },
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
            {user?.teacherProfile?.avatarUrl ? (
              <img
                src={API_BASE_URL + user.teacherProfile.avatarUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.charAt(0) || 'T'}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">ครูผู้สอน</p>
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
            <Route path="dashboard" element={<TeacherDashboardPage />} />
            <Route path="courses" element={<TeacherCoursesPage />} />
            <Route path="courses/create" element={<CreateCoursePage />} />
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
        </div>
      </main>
    </div>
  )
}
