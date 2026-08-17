import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { FileText, X, ExternalLink, Paperclip } from 'lucide-react'
import { api } from '@/lib/api'
import { resolveFileUrl } from '@/lib/storage'
import { toast } from '@/store/toast-store'
import { isApiError } from '@/lib/api-error'
import { useTranslation } from '@/lib/i18n'
import { PageIntro } from '@/components/PageIntro'

interface Submission {
  id: string
  textAnswer?: string | null
  fileUrl?: string | null
  submittedAt?: string | null
  createdAt: string
  grade?: number | string | null
  feedback?: string | null
  status: string
  assignment?: {
    id: string
    title: string
    maxPoints: number
    lesson?: {
      id: string
      title?: string
      chapter?: {
        course?: { id: string; title: string }
      }
    }
  }
  student?: {
    user?: { firstName: string; lastName: string }
  }
}

export function TeacherSubmissionsPage() {
  const { t } = useTranslation()
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null)
  const [grade, setGrade] = useState<number | ''>('')
  const [feedback, setFeedback] = useState('')
  const [gradeError, setGradeError] = useState('')
  const queryClient = useQueryClient()

  const { data: submissions, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-submissions'],
    queryFn: () => api.get<Submission[]>('/teacher/submissions'),
  })

  const gradeMutation = useMutation({
    mutationFn: async () => {
      if (!gradingSubmissionId) return
      return api.put(`/teacher/submissions/${gradingSubmissionId}/grade`, {
        grade: Number(grade),
        feedback: feedback || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-gradebook'] })
      toast.success('บันทึกคะแนนเรียบร้อยแล้ว')
      closeGrading()
    },
    onError: (err: unknown) => {
      toast.error(isApiError(err) ? err.message : 'บันทึกคะแนนไม่สำเร็จ')
    },
  })

  const openGrading = (submission: Submission) => {
    setGradingSubmissionId(submission.id)
    setGrade(submission.grade != null ? Number(submission.grade) : '')
    setFeedback(submission.feedback || '')
    setGradeError('')
  }

  const closeGrading = () => {
    setGradingSubmissionId(null)
    setGrade('')
    setFeedback('')
    setGradeError('')
  }

  const openFile = async (fileUrl: string) => {
    const url = await resolveFileUrl(fileUrl)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      toast.error('ไม่สามารถเปิดไฟล์ได้')
    }
  }

  const handleSave = (maxPoints: number) => {
    if (grade === '' || Number.isNaN(Number(grade))) {
      setGradeError('กรุณาใส่คะแนน')
      return
    }
    const value = Number(grade)
    if (value < 0 || value > maxPoints) {
      setGradeError(`คะแนนต้องอยู่ระหว่าง 0 ถึง ${maxPoints}`)
      return
    }
    setGradeError('')
    gradeMutation.mutate()
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro kicker="ตรวจงาน" title={t('submissions.title')} description={t('submissions.subtitle')} />

      {!submissions?.length ? (
        <EmptyState
          icon={FileText}
          title={t('submissions.empty')}
          description={t('submissions.subtitle')}
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const maxPoints = submission.assignment?.maxPoints ?? 100
            const courseTitle = submission.assignment?.lesson?.chapter?.course?.title
            const lessonId = submission.assignment?.lesson?.id
            const isGrading = gradingSubmissionId === submission.id

            return (
              <Card key={submission.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-gray-100 p-3">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{submission.assignment?.title}</h3>
                        {courseTitle && (
                          <p className="text-xs text-muted-foreground">{courseTitle}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {submission.student?.user?.firstName} {submission.student?.user?.lastName}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          ส่งเมื่อ:{' '}
                          {new Date(submission.submittedAt || submission.createdAt).toLocaleString('th-TH')}
                        </p>
                        {submission.textAnswer && (
                          <p className="mt-2 text-sm text-gray-700">
                            คำตอบ: {submission.textAnswer}
                          </p>
                        )}
                        {submission.fileUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => openFile(submission.fileUrl!)}
                          >
                            <Paperclip className="mr-1 h-4 w-4" />
                            เปิดไฟล์แนบ
                          </Button>
                        )}
                        {lessonId && (
                          <Link
                            to={`/teacher/lessons/${lessonId}`}
                            className="mt-2 inline-flex items-center text-sm text-emerald-700 hover:underline"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            ดูในบทเรียน
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          submission.status === 'GRADED'
                            ? 'bg-green-100 text-green-700'
                            : submission.status === 'SUBMITTED'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {submission.status === 'GRADED'
                          ? 'ตรวจแล้ว'
                          : submission.status === 'SUBMITTED'
                            ? 'ส่งแล้ว'
                            : 'รอส่ง'}
                      </span>
                      {submission.grade != null && (
                        <p className="text-xl font-bold text-emerald-700">
                          {submission.grade}/{maxPoints}
                        </p>
                      )}
                      {submission.feedback && (
                        <p className="max-w-xs text-right text-sm text-gray-600">
                          ความคิดเห็น: {submission.feedback}
                        </p>
                      )}
                      <Button size="sm" className="mt-1" onClick={() => openGrading(submission)}>
                        {submission.status === 'GRADED' ? 'แก้ไขคะแนน' : 'ตรวจงาน'}
                      </Button>
                    </div>
                  </div>
                </CardContent>

                {isGrading && (
                  <Card className="mx-4 mb-4 border-emerald-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          {submission.status === 'GRADED' ? 'แก้ไขคะแนน' : 'ตรวจงาน'}
                        </CardTitle>
                        <Button variant="ghost" size="icon" type="button" onClick={closeGrading}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>คะแนน ({maxPoints} คะแนนเต็ม)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={maxPoints}
                          value={grade}
                          onChange={(e) => {
                            setGrade(e.target.value ? Number(e.target.value) : '')
                            setGradeError('')
                          }}
                          placeholder="ใส่คะแนน"
                        />
                        {gradeError && (
                          <p className="mt-1 text-sm text-red-600">{gradeError}</p>
                        )}
                      </div>
                      <div>
                        <Label>ความคิดเห็น</Label>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="ใส่ความคิดเห็น (ไม่จำเป็น)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          disabled={gradeMutation.isPending}
                          onClick={() => handleSave(maxPoints)}
                        >
                          บันทึก
                        </Button>
                        <Button type="button" variant="outline" onClick={closeGrading}>
                          ยกเลิก
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
