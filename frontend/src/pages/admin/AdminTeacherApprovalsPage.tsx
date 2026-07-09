import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'

export function AdminTeacherApprovalsPage() {
  const queryClient = useQueryClient()

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['admin-pending-teachers'],
    queryFn: async () => api.get<Array<any>>('/admin/teachers/pending'),
  })

  const approveMutation = useMutation({
    mutationFn: (teacherId: string) => api.put(`/admin/teachers/${teacherId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-teachers'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (teacherId: string) => api.put(`/admin/teachers/${teacherId}/reject`, { rejectionReason: 'Rejected by admin' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-teachers'] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">อนุมัติครู</h1>
        <p className="text-gray-600">ตรวจสอบและอนุมัติครูใหม่</p>
      </div>

      {!teachers || teachers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">ไม่มีครูที่รออนุมัติ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher: any) => (
            <Card key={teacher.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-amber-100 rounded-full">
                      <Users className="h-6 w-6 text-amber-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {teacher.user?.firstName} {teacher.user?.lastName}
                      </h3>
                      <p className="text-gray-500 text-sm">{teacher.user?.email}</p>
                      <p className="text-gray-400 text-xs mt-2">{teacher.bio}</p>
                      {teacher.qualifications && (
                        <p className="text-gray-500 text-xs mt-1">
                          วุฒิการศึกษา: {teacher.qualifications}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectMutation.mutate(teacher.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      ปฏิเสธ
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(teacher.id)}
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
