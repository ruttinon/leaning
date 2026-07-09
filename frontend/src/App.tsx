import { Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { RouteFallback } from './components/RouteFallback'
import { useAuthStore } from './store/auth-store'
import { api } from './lib/api'
import { lazyNamed } from './lib/lazy'
import { useAppStore } from './store/theme-store'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Toaster } from './components/Toaster'
import { ConfirmDialog } from './components/ConfirmDialog'

const HomePage = lazyNamed(() => import('./pages/HomePage'), 'HomePage')
const CoursesPage = lazyNamed(() => import('./pages/CoursesPage'), 'CoursesPage')
const CourseDetailPage = lazyNamed(() => import('./pages/CourseDetailPage'), 'CourseDetailPage')
const SubjectsPage = lazyNamed(() => import('./pages/SubjectsPage'), 'SubjectsPage')
const SubjectDetailPage = lazyNamed(() => import('./pages/SubjectDetailPage'), 'SubjectDetailPage')
const TeachersPage = lazyNamed(() => import('./pages/TeachersPage'), 'TeachersPage')
const TeacherDetailPage = lazyNamed(() => import('./pages/TeacherDetailPage'), 'TeacherDetailPage')
const AboutPage = lazyNamed(() => import('./pages/AboutPage'), 'AboutPage')
const BecomeTeacherPage = lazyNamed(() => import('./pages/BecomeTeacherPage'), 'BecomeTeacherPage')
const ContactPage = lazyNamed(() => import('./pages/ContactPage'), 'ContactPage')
const LoginPage = lazyNamed(() => import('./pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('./pages/auth/RegisterPage'), 'RegisterPage')
const RegisterStudentPage = lazyNamed(
  () => import('./pages/auth/RegisterStudentPage'),
  'RegisterStudentPage',
)
const RegisterTeacherPage = lazyNamed(
  () => import('./pages/auth/RegisterTeacherPage'),
  'RegisterTeacherPage',
)
const ForgotPasswordPage = lazyNamed(
  () => import('./pages/auth/ForgotPasswordPage'),
  'ForgotPasswordPage',
)
const ResetPasswordPage = lazyNamed(
  () => import('./pages/auth/ResetPasswordPage'),
  'ResetPasswordPage',
)
const NotFoundPage = lazyNamed(() => import('./pages/NotFoundPage'), 'NotFoundPage')
const StudentDashboardLayout = lazyNamed(
  () => import('./layouts/StudentDashboardLayout'),
  'StudentDashboardLayout',
)
const TeacherDashboardLayout = lazyNamed(
  () => import('./layouts/TeacherDashboardLayout'),
  'TeacherDashboardLayout',
)
const AdminDashboardLayout = lazyNamed(
  () => import('./layouts/AdminDashboardLayout'),
  'AdminDashboardLayout',
)

function App() {
  const { token, isAuthenticated, setUser } = useAuthStore()
  const { theme } = useAppStore()

  useEffect(() => {
    api.setToken(token)
  }, [token])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return
    }

    api.get<any>('/auth/me')
      .then((user) => setUser(user))
      .catch(() => {
        // handled by api layer on 401
      })
  }, [isAuthenticated, token, setUser])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <AppErrorBoundary>
        <Suspense fallback={<RouteFallback label="Loading page..." />}>
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
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboardLayout />
                </ProtectedRoute>
              }
            />

            {/* Teacher Dashboard Routes */}
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeacherDashboardLayout />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardLayout />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Toaster />
        <ConfirmDialog />
      </AppErrorBoundary>
    </div>
  )
}

export default App
