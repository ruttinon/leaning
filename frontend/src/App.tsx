import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { CoursesPage } from './pages/CoursesPage'
import { CourseDetailPage } from './pages/CourseDetailPage'
import { SubjectsPage } from './pages/SubjectsPage'
import { SubjectDetailPage } from './pages/SubjectDetailPage'
import { TeachersPage } from './pages/TeachersPage'
import { TeacherDetailPage } from './pages/TeacherDetailPage'
import { AboutPage } from './pages/AboutPage'
import { BecomeTeacherPage } from './pages/BecomeTeacherPage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { RegisterStudentPage } from './pages/auth/RegisterStudentPage'
import { RegisterTeacherPage } from './pages/auth/RegisterTeacherPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { StudentDashboardLayout } from './layouts/StudentDashboardLayout'
import { TeacherDashboardLayout } from './layouts/TeacherDashboardLayout'
import { AdminDashboardLayout } from './layouts/AdminDashboardLayout'
import { useAuthStore } from './store/auth-store'
import { api } from './lib/api'
import { useEffect } from 'react'
import { useAppStore } from './store/theme-store'

function App() {
  const { token } = useAuthStore()
  const { theme } = useAppStore()

  useEffect(() => {
    api.setToken(token)
  }, [token])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:id" element={<SubjectDetailPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/teachers/:id" element={<TeacherDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/become-teacher" element={<BecomeTeacherPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/student" element={<RegisterStudentPage />} />
        <Route path="/register/teacher" element={<RegisterTeacherPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Student Dashboard Routes */}
        <Route path="/student/*" element={<StudentDashboardLayout />} />

        {/* Teacher Dashboard Routes */}
        <Route path="/teacher/*" element={<TeacherDashboardLayout />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin/*" element={<AdminDashboardLayout />} />
      </Routes>
    </div>
  )
}

export default App
