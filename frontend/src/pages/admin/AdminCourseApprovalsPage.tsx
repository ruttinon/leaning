import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, CheckCircle, XCircle, Clock3, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { confirm } from '@/store/confirm-store'
import { toast } from '@/store/toast-store'
import { isApiError } from '@/lib/api-error'

export function AdminCourseApprovalsPage() {
  const queryClient = useQueryClient()

  const { data: courses, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-pending-courses'],
    queryFn: () => api.get<Array<any>>('/admin/courses/pending'),
  })

  const approveMutation = useMutation({
    mutationFn: (courseId: string) => api.put(`/admin/courses/${courseId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] })
      toast.success('อนุมัติคอร์สเรียบร้อยแล้ว')
    },
    onError: (err: unknown) => {
      toast.error(isApiError(err) ? err.message : 'อนุมัติไม่สำเร็จ')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ courseId, rejectionReason }: { courseId: string; rejectionReason: string }) =>
      api.put(`/admin/courses/${courseId}/reject`, { rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] })
      toast.success('ปฏิเสธคอร์สแล้ว')
    },
    onError: (err: unknown) => {
      toast.error(isApiError(err) ? err.message : 'ปฏิเสธไม่สำเร็จ')
    },
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-2">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">อนุมัติคอร์ส</h1>
            <p className="text-sm text-slate-300">ตรวจสอบและอนุมัติคอร์สใหม่ให้กับผู้เรียน</p>
          </div>
        </div>
      </div>

      {!courses?.length ? (
        <Card>
          <CardContent className="py-12 pt-6 text-center">
            <p className="text-gray-500">ไม่มีคอร์สที่รออนุมัติ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course: any) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-emerald-100 p-3">
                      <BookOpen className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-500">
                        โดย: {course.teacher?.user?.firstName} {course.teacher?.user?.lastName}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">{course.description}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        วิชา: {course.subject?.name}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        <Clock3 className="h-3.5 w-3.5" />
                        รอการตรวจสอบ
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        confirm({
                          title: 'ปฏิเสธคอร์ส',
                          description: `ปฏิเสธคอร์ส "${course.title}"?`,
                          variant: 'danger',
                          confirmLabel: 'ปฏิเสธ',
                          requireInput: true,
                          inputLabel: 'เหตุผล',
                          inputPlaceholder: 'ระบุเหตุผลที่ปฏิเสธ',
                          onConfirm: (reason) =>
                            rejectMutation.mutate({
                              courseId: course.id,
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
                          title: 'อนุมัติคอร์ส',
                          description: `เผยแพร่คอร์ส "${course.title}"?`,
                          confirmLabel: 'อนุมัติ',
                          onConfirm: () => approveMutation.mutate(course.id),
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
