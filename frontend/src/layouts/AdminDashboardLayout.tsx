import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RouteFallback } from '@/components/RouteFallback'
import { DashboardShell } from '@/components/DashboardShell'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  FileText,
  Ticket,
  User,
  Bell,
  Megaphone,
  MessageSquare,
} from 'lucide-react'
import { lazyNamed } from '@/lib/lazy'
import { useTranslation } from '@/lib/i18n'

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
const AdminContactsPage = lazyNamed(
  () => import('@/pages/admin/AdminContactsPage'),
  'AdminContactsPage',
)
const ProfilePage = lazyNamed(() => import('@/pages/common/ProfilePage'), 'ProfilePage')
const NotificationsPage = lazyNamed(
  () => import('@/pages/common/NotificationsPage'),
  'NotificationsPage',
)

export function AdminDashboardLayout() {
  const { t } = useTranslation()

  const navItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/admin/dashboard' },
    { icon: UserCheck, label: t('adminDashboard.teacherApprovals'), path: '/admin/teacher-approvals' },
    { icon: BookOpen, label: t('adminDashboard.courseApprovals'), path: '/admin/course-approvals' },
    { icon: FileText, label: t('adminDashboard.subjects'), path: '/admin/subjects' },
    { icon: Ticket, label: t('adminDashboard.coupons'), path: '/admin/coupons' },
    { icon: Users, label: t('adminDashboard.users'), path: '/admin/users' },
    { icon: Megaphone, label: t('adminDashboard.announcements'), path: '/admin/announcements' },
    { icon: MessageSquare, label: t('adminDashboard.contacts'), path: '/admin/contacts' },
    { icon: Bell, label: t('common.notifications'), path: '/admin/notifications' },
    { icon: User, label: t('common.profile'), path: '/admin/profile' },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      brandTo="/admin/dashboard"
      homePath="/admin/dashboard"
      roleLabel="ผู้ดูแลระบบ"
      avatarUrl={null}
    >
      <Suspense fallback={<RouteFallback label="Loading admin area..." />}>
        <Routes>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="teacher-approvals" element={<AdminTeacherApprovalsPage />} />
          <Route path="course-approvals" element={<AdminCourseApprovalsPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
          <Route path="contacts" element={<AdminContactsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<AdminDashboardPage />} />
        </Routes>
      </Suspense>
    </DashboardShell>
  )
}
