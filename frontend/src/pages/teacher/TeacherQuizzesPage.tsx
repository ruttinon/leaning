import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HelpCircle, Calendar, CheckCircle, XCircle, Plus } from 'lucide-react'
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

interface Quiz {
  id: string
  lessonId: string
  title: string
  description?: string | null
  showAnswers: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
  timeLimit?: number | null
  lesson?: any
  _count?: { questions: number }
  createdAt: string
}

export function TeacherQuizzesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Quiz | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    showAnswers: true,
    shuffleQuestions: true,
    shuffleOptions: true,
    timeLimit: '',
  })

  const { data: quizzes, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-quizzes'],
    queryFn: () => api.get<Quiz[]>('/teacher/quizzes'),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/teacher/quizzes/${editing!.id}`, {
        title: form.title,
        description: form.description || null,
        showAnswers: form.showAnswers,
        shuffleQuestions: form.shuffleQuestions,
        shuffleOptions: form.shuffleOptions,
        timeLimit: form.timeLimit ? Number(form.timeLimit) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-quizzes'] })
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
      queryClient.invalidateQueries({ queryKey: ['teacher-quizzes'] })
      toast.success(t('teacherDashboard.deleted'))
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : t('teacherDashboard.deleteFailed'))
    },
  })

  const openEdit = (quiz: Quiz) => {
    setEditing(quiz)
    setForm({
      title: quiz.title,
      description: quiz.description || '',
      showAnswers: quiz.showAnswers,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      timeLimit: quiz.timeLimit ? String(quiz.timeLimit) : '',
    })
    setOpen(true)
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="สตูดิโอ"
        title={t('teacherDashboard.allQuizzes')}
        description={t('teacherDashboard.allQuizzesDesc')}
        actions={
          <Link to="/teacher/courses">
            <Button className="rounded-sm">
              <Plus className="mr-2 h-4 w-4" />
              สร้างในคอร์ส
            </Button>
          </Link>
        }
      />

      {!quizzes?.length ? (
        <EmptyState
          icon={HelpCircle}
          title="ยังไม่มี Quiz"
          description="สร้าง Quiz ได้จากหน้าจัดการบทเรียนในคอร์สของคุณ"
          actionLabel="ไปที่คอร์ส"
          onAction={() => { window.location.assign('/teacher/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <TeacherLessonContext item={quiz} />
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="line-clamp-2 text-sm text-gray-500">{quiz.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(quiz.createdAt).toLocaleDateString('th-TH')}
                </div>
                <p className="text-sm text-gray-600">โจทย์ {quiz._count?.questions ?? 0} ข้อ</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quiz.showAnswers ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      <CheckCircle className="h-3 w-3" /> แสดงเฉลย
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                      <XCircle className="h-3 w-3" /> ไม่แสดงเฉลย
                    </span>
                  )}
                </div>
                <TeacherResourceActions
                  lessonId={getLessonId(quiz)}
                  onEdit={() => openEdit(quiz)}
                  onDelete={() => {
                    confirm({
                      title: 'ลบ Quiz',
                      description: `ลบ "${quiz.title}" ถาวร? การดำเนินการนี้ย้อนกลับไม่ได้`,
                      variant: 'danger',
                      confirmLabel: 'ลบ',
                      onConfirm: () => deleteMutation.mutate(quiz.id),
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
            <DialogTitle>แก้ไข Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อ Quiz</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>จำกัดเวลา (นาที)</Label>
              <Input type="number" value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.showAnswers} onChange={(e) => setForm({ ...form, showAnswers: e.target.checked })} />
              แสดงเฉลยหลังส่ง
            </label>
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
