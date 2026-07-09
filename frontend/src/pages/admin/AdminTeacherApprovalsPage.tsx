import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { confirm } from '@/store/confirm-store'
import { toast } from '@/store/toast-store'
import { isApiError } from '@/lib/api-error'

export function AdminTeacherApprovalsPage() {
  const queryClient = useQueryClient()

  const { data: teachers, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-pending-teachers'],
    queryFn: () => api.get<Array<any>>('/admin/teachers/pending'),
  })

  const approveMutation = useMutation({
    mutationFn: (teacherId: string) => api.put(`/admin/teachers/${teacherId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-teachers'] })
      toast.success('อนุมัติครูเรียบร้อยแล้ว')
    },
    onError: (err: unknown) => {
      toast.error(isApiError(err) ? err.message : 'อนุมัติไม่สำเร็จ')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ teacherId, rejectionReason }: { teacherId: string; rejectionReason: string }) =>
      api.put(`/admin/teachers/${teacherId}/reject`, { rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-teachers'] })
      toast.success('ปฏิเสธครูแล้ว')
    },
    onError: (err: unknown) => {
      toast.error(isApiError(err) ? err.message : 'ปฏิเสธไม่สำเร็จ')
    },
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">อนุมัติครู</h1>
        <p className="text-gray-600">ตรวจสอบและอนุมัติครูใหม่</p>
      </div>

      {!teachers?.length ? (
        <Card>
          <CardContent className="py-12 pt-6 text-center">
            <p className="text-gray-500">ไม่มีครูที่รออนุมัติ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher: any) => (
            <Card key={teacher.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-amber-100 p-3">
                      <Users className="h-6 w-6 text-amber-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {teacher.user?.firstName} {teacher.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{teacher.user?.email}</p>
                      <p className="mt-2 text-xs text-gray-400">{teacher.bio}</p>
                      {teacher.qualifications && (
                        <p className="mt-1 text-xs text-gray-500">
                          วุฒิการศึกษา: {teacher.qualifications}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        confirm({
                          title: 'ปฏิเสธครู',
                          description: `ปฏิเสธ ${teacher.user?.firstName} ${teacher.user?.lastName}?`,
                          variant: 'danger',
                          confirmLabel: 'ปฏิเสธ',
                          requireInput: true,
                          inputLabel: 'เหตุผล',
                          inputPlaceholder: 'ระบุเหตุผลที่ปฏิเสธ',
                          onConfirm: (reason) =>
                            rejectMutation.mutate({
                              teacherId: teacher.id,
                              rejectionReason: reason || 'ไม่ระบุเหตุผล',
                            }),
                        })
                      }
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      ปฏิเสธ
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        confirm({
                          title: 'อนุมัติครู',
                          description: `อนุมัติ ${teacher.user?.firstName} ${teacher.user?.lastName} เป็นครูผู้สอน?`,
                          confirmLabel: 'อนุมัติ',
                          onConfirm: () => approveMutation.mutate(teacher.id),
                        })
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
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
