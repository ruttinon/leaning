import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckSquare, Calendar, Clock, Plus } from 'lucide-react'
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

interface Exam {
  id: string
  lessonId: string
  title: string
  description?: string | null
  timeLimit?: number | null
  maxAttempts?: number | null
  startDate?: string | null
  endDate?: string | null
  lesson?: any
  _count?: { questions: number }
  createdAt: string
}

export function TeacherExamsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Exam | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimit: '',
    maxAttempts: '',
    startDate: '',
    endDate: '',
  })

  const { data: exams, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-exams'],
    queryFn: () => api.get<Exam[]>('/teacher/exams'),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/teacher/quizzes/${editing!.id}`, {
        title: form.title,
        description: form.description || null,
        type: 'EXAM',
        timeLimit: form.timeLimit ? Number(form.timeLimit) : null,
        maxAttempts: form.maxAttempts ? Number(form.maxAttempts) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] })
      setOpen(false)
      setEditing(null)
      toast.success(t('teacherDashboard.saved'))
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : t('teacherDashboard.saveFailed'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/teacher/quizzes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] })
      toast.success(t('teacherDashboard.deleted'))
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : t('teacherDashboard.deleteFailed'))
    },
  })

  const openEdit = (exam: Exam) => {
    setEditing(exam)
    setForm({
      title: exam.title,
      description: exam.description || '',
      timeLimit: exam.timeLimit ? String(exam.timeLimit) : '',
      maxAttempts: exam.maxAttempts ? String(exam.maxAttempts) : '',
      startDate: exam.startDate ? exam.startDate.slice(0, 16) : '',
      endDate: exam.endDate ? exam.endDate.slice(0, 16) : '',
    })
    setOpen(true)
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('teacherDashboard.allExams')}</h1>
          <p className="text-gray-600">{t('teacherDashboard.allExamsDesc')}</p>
        </div>
        <Link to="/teacher/courses">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            สร้างในคอร์ส
          </Button>
        </Link>
      </div>

      {!exams?.length ? (
        <EmptyState
          icon={CheckSquare}
          title="ยังไม่มี Exam"
          description="สร้าง Exam ได้จากหน้าจัดการบทเรียน โดยเลือกประเภท EXAM"
          actionLabel="ไปที่คอร์ส"
          onAction={() => { window.location.assign('/teacher/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <TeacherLessonContext item={exam} />
                <CardTitle className="text-lg">{exam.title}</CardTitle>
                {exam.description && (
                  <p className="line-clamp-2 text-sm text-gray-500">{exam.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>โจทย์ {exam._count?.questions ?? 0} ข้อ</p>
                  {exam.timeLimit && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      ระยะเวลา: {exam.timeLimit} นาที
                    </p>
                  )}
                  {exam.maxAttempts && <p>ทำได้: {exam.maxAttempts} ครั้ง</p>}
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    สร้างเมื่อ: {new Date(exam.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <TeacherResourceActions
                  lessonId={getLessonId(exam)}
                  onEdit={() => openEdit(exam)}
                  onDelete={() => {
                    confirm({
                      title: 'ลบ Exam',
                      description: `ลบ "${exam.title}" ถาวร?`,
                      variant: 'danger',
                      confirmLabel: 'ลบ',
                      onConfirm: () => deleteMutation.mutate(exam.id),
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
            <DialogTitle>แก้ไข Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อข้อสอบ</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>เวลา (นาที)</Label>
                <Input type="number" value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: e.target.value })} />
              </div>
              <div>
                <Label>จำนวนครั้ง</Label>
                <Input type="number" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>เริ่ม</Label>
                <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <Label>สิ้นสุด</Label>
                <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
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
