import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Calendar, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { confirm } from '@/store/confirm-store'
import { toast } from '@/store/toast-store'
import { isApiError } from '@/lib/api-error'
import { useTranslation } from '@/lib/i18n'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { TeacherLessonContext, getLessonId } from '@/components/teacher/TeacherLessonContext'
import { TeacherResourceActions } from '@/components/teacher/TeacherResourceActions'
import { PageIntro } from '@/components/PageIntro'

interface Assignment {
  id: string
  lessonId: string
  title: string
  description?: string | null
  maxPoints: number
  dueDate?: string | null
  lesson?: any
  createdAt: string
}

export function TeacherAssignmentsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    maxPoints: '10',
    dueDate: '',
  })

  const { data: assignments, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: () => api.get<Assignment[]>('/teacher/assignments'),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/teacher/assignments/${editing!.id}`, {
        title: form.title,
        description: form.description || null,
        maxPoints: Number(form.maxPoints) || 10,
        dueDate: form.dueDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] })
      setOpen(false)
      setEditing(null)
      toast.success(t('teacherDashboard.saved'))
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : t('teacherDashboard.saveFailed'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/teacher/assignments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] })
      toast.success(t('teacherDashboard.deleted'))
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : t('teacherDashboard.deleteFailed'))
    },
  })

  const openEdit = (assignment: Assignment) => {
    setEditing(assignment)
    setForm({
      title: assignment.title,
      description: assignment.description || '',
      maxPoints: String(assignment.maxPoints),
      dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 16) : '',
    })
    setOpen(true)
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="สตูดิโอ"
        title={t('teacherDashboard.allAssignments')}
        description={t('teacherDashboard.allAssignmentsDesc')}
        actions={
          <div className="flex gap-2">
            <Link to="/teacher/submissions">
              <Button variant="outline" className="rounded-sm">ดูงานที่ส่ง</Button>
            </Link>
            <Link to="/teacher/courses">
              <Button className="rounded-sm">
                <Plus className="mr-2 h-4 w-4" />
                สร้างในคอร์ส
              </Button>
            </Link>
          </div>
        }
      />

      {!assignments?.length ? (
        <EmptyState
          icon={FileText}
          title="ยังไม่มี Assignment"
          description="สร้างการบ้านได้จากหน้าจัดการบทเรียนในคอร์ส"
          actionLabel="ไปที่คอร์ส"
          onAction={() => { window.location.assign('/teacher/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <TeacherLessonContext item={assignment} />
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                {assignment.description && (
                  <p className="line-clamp-2 text-sm text-gray-500">{assignment.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>คะแนนเต็ม: {assignment.maxPoints}</p>
                  {assignment.dueDate && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      กำหนดส่ง: {new Date(assignment.dueDate).toLocaleString('th-TH')}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    สร้างเมื่อ: {new Date(assignment.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <TeacherResourceActions
                  lessonId={getLessonId(assignment)}
                  onEdit={() => openEdit(assignment)}
                  onDelete={() => {
                    confirm({
                      title: 'ลบ Assignment',
                      description: `ลบ "${assignment.title}" ถาวร?`,
                      variant: 'danger',
                      confirmLabel: 'ลบ',
                      onConfirm: () => deleteMutation.mutate(assignment.id),
                    })
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไข Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่องาน</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>รายละเอียด</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>คะแนนเต็ม</Label>
                <Input type="number" value={form.maxPoints} onChange={(e) => setForm({ ...form, maxPoints: e.target.value })} />
              </div>
              <div>
                <Label>กำหนดส่ง</Label>
                <Input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
              <Button disabled={!form.title || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
