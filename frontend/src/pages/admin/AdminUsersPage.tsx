import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, User, GraduationCap, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { PaginationControls } from '@/components/PaginationControls'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { PageIntro } from '@/components/PageIntro'

interface User {
  id: string
  email: string
  username?: string | null
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  createdAt: string
  studentProfile?: any
  teacherProfile?: any
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: async () => api.get<{ data: User[]; meta: any }>(`/admin/users?page=${page}&limit=20`),
  })

  const users = data?.data ?? []

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Users className="h-5 w-5 text-amber-800" />
      case 'TEACHER':
        return <BookOpen className="h-5 w-5 text-green-600" />
      case 'STUDENT':
        return <GraduationCap className="h-5 w-5 text-emerald-700" />
      default:
        return <User className="h-5 w-5 text-gray-600" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'ผู้ดูแลระบบ'
      case 'TEACHER':
        return 'ครูผู้สอน'
      case 'STUDENT':
        return 'นักเรียน'
      default:
        return 'ผู้ใช้'
    }
  }

  const getAvatarUrl = (user: User) => {
    if (user.studentProfile?.avatarUrl) {
      return user.studentProfile.avatarUrl
    }
    if (user.teacherProfile?.avatarUrl) {
      return user.teacherProfile.avatarUrl
    }
    return null
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro kicker="ผู้ใช้" title="จัดการผู้ใช้" description="จัดการผู้ใช้ทั้งหมดในระบบ" />

      {!users || users.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">ยังไม่มีผู้ใช้ในระบบ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={getAvatarUrl(user) || ''} />
                      <AvatarFallback className="bg-[var(--primary)] text-white">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getRoleIcon(user.role)}
                    {getRoleText(user.role)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {user.username && (
                  <p className="text-sm text-gray-600">@{user.username}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.isActive ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                  </span>
                  <span className="text-xs text-gray-400">
                    สร้างเมื่อ: {new Date(user.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
                {user.teacherProfile && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-1">สถานะครู:</p>
                    <Badge
                      className={
                        user.teacherProfile.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : user.teacherProfile.status === 'PENDING_REVIEW'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {user.teacherProfile.status === 'APPROVED'
                        ? 'อนุมัติแล้ว'
                        : user.teacherProfile.status === 'PENDING_REVIEW'
                        ? 'รอตรวจสอบ'
                        : 'ปฏิเสธ'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaginationControls meta={data?.meta} page={page} onPageChange={setPage} />
    </div>
  )
}
