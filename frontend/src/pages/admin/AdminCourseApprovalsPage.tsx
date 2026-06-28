import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'

export function AdminCourseApprovalsPage() {
  const queryClient = useQueryClient()

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-pending-courses'],
    queryFn: async () => api.get<Array<any>>('/admin/courses/pending'),
  })

  const approveMutation = useMutation({
    mutationFn: (courseId: string) => api.put(`/admin/courses/${courseId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (courseId: string) => api.put(`/admin/courses/${courseId}/reject`, { rejectionReason: 'Rejected by admin' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">อนุมัติคอร์ส</h1>
        <p className="text-gray-600">ตรวจสอบและอนุมัติคอร์สใหม่</p>
      </div>

      {!courses || courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">ไม่มีคอร์สที่รออนุมัติ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course: any) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-gray-500 text-sm">
                        โดย: {course.teacher?.user?.firstName} {course.teacher?.user?.lastName}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">{course.description}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        วิชา: {course.subject?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectMutation.mutate(course.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      ปฏิเสธ
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(course.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      อนุมัติ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
