import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Clock, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { toast } from '@/store/toast-store'
import { isApiError } from '@/lib/api-error'

interface QuizMeta {
  id: string
  title: string
  description?: string
  timeLimit?: number | null
  maxAttempts?: number | null
  showAnswers?: boolean
  attemptCount?: number
  attemptsRemaining?: number | null
  canAttempt?: boolean
  availabilityMessage?: string | null
  questions: Array<{
    id: string
    text: string
    type: string
    points: number
    options?: Array<{ id: string; text: string; isCorrect?: boolean }>
  }>
}

interface AttemptResult {
  id: string
  score?: number | string | null
  maxScore?: number | string | null
  completedAt?: string
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function StudentQuizPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()

  const [answers, setAnswers] = useState<any[]>([])
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [submittedResult, setSubmittedResult] = useState<AttemptResult | null>(null)

  const { data: quiz, isLoading, isError, refetch } = useQuery({
    queryKey: ['student-quiz', quizId],
    queryFn: () => api.get<QuizMeta>(`/student/quizzes/${quizId}`),
  })

  const startAttemptMutation = useMutation({
    mutationFn: () => api.post<{ id: string; startedAt: string }>(`/student/quizzes/${quizId}/attempts`, {}),
    onSuccess: (data) => {
      setAttemptId(data.id)
      if (quiz?.timeLimit) {
        setSecondsLeft(quiz.timeLimit * 60)
      }
      toast.info('เริ่มทำแบบทดสอบแล้ว')
    },
    onError: (err: unknown) => {
      toast.error(isApiError(err) ? err.message : 'ไม่สามารถเริ่มทำแบบทดสอบได้')
    },
  })

  const submitAttemptMutation = useMutation({
    mutationFn: () =>
      api.post<AttemptResult>(`/student/quiz-attempts/${attemptId}/submit`, { answers }),
    onSuccess: (data) => {
      setSubmittedResult(data)
      toast.success('ส่งคำตอบเรียบร้อยแล้ว')
    },
    onError: (err: unknown) => {
      toast.error(isApiError(err) ? err.message : 'ส่งคำตอบไม่สำเร็จ')
    },
  })

  const submitAnswers = useCallback(() => {
    if (!attemptId || submitAttemptMutation.isPending) return
    submitAttemptMutation.mutate()
  }, [attemptId, submitAttemptMutation])

  useEffect(() => {
    if (quiz?.questions && answers.length === 0) {
      setAnswers(
        quiz.questions.map((q) => ({
          questionId: q.id,
          selectedOptionIds: [] as string[],
          textAnswer: '',
        })),
      )
    }
  }, [quiz, answers.length])

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0 || submittedResult) return
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          window.clearInterval(timer)
          if (prev !== null && prev <= 1 && attemptId && !submittedResult) {
            submitAnswers()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft, attemptId, submittedResult, submitAnswers])

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, selectedOptionIds: [optionId] }
          : answer,
      ),
    )
  }

  const handleTextAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId ? { ...answer, textAnswer: value } : answer,
      ),
    )
  }

  const validateAnswers = () => {
    if (!quiz?.questions) return false
    for (const question of quiz.questions) {
      const answer = answers.find((a) => a.questionId === question.id)
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        if (!answer?.selectedOptionIds?.length) {
          toast.error(`กรุณาตอบข้อที่ ${quiz.questions.indexOf(question) + 1}`)
          return false
        }
      } else if (!answer?.textAnswer?.trim()) {
        toast.error(`กรุณาตอบข้อที่ ${quiz.questions.indexOf(question) + 1}`)
        return false
      }
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAnswers()) return
    submitAnswers()
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (!quiz) return <ErrorState title="ไม่พบแบบทดสอบ" />

  const isSubmitted = !!submittedResult
  const score = submittedResult?.score != null ? Number(submittedResult.score) : null
  const maxScore = submittedResult?.maxScore != null ? Number(submittedResult.maxScore) : null
  const percentage =
    score != null && maxScore != null && maxScore > 0
      ? Math.round((score / maxScore) * 100)
      : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="kicker">แบบฝึกหัด</p>
        <h1 className="mt-2 text-4xl">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
          {quiz.timeLimit && <span>เวลา: {quiz.timeLimit} นาที</span>}
          {quiz.maxAttempts != null && (
            <span>
              ทำได้ {quiz.maxAttempts} ครั้ง
              {quiz.attemptsRemaining != null && ` (เหลือ ${quiz.attemptsRemaining} ครั้ง)`}
            </span>
          )}
        </div>
      </div>

      {quiz.availabilityMessage && !attemptId && !isSubmitted && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-2 pt-6 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            {quiz.availabilityMessage}
          </CardContent>
        </Card>
      )}

      {!attemptId && !isSubmitted && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="mb-4">กดเริ่มทำแบบทดสอบเมื่อพร้อม</p>
            <Button
              onClick={() => startAttemptMutation.mutate()}
              disabled={startAttemptMutation.isPending || quiz.canAttempt === false}
            >
              เริ่มทำ
            </Button>
          </CardContent>
        </Card>
      )}

      {attemptId && !isSubmitted && (
        <>
          {secondsLeft !== null && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                secondsLeft <= 60 ? 'bg-red-100 text-red-800' : 'bg-sky-100 text-sky-800'
              }`}
            >
              <Clock className="h-4 w-4" />
              เวลาที่เหลือ: {formatTime(secondsLeft)}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {quiz.questions.map((question, index) => (
              <Card key={question.id} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {index + 1}. {question.text} ({question.points} คะแนน)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') &&
                    question.options && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option.id}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={
                                answers
                                  .find((a) => a.questionId === question.id)
                                  ?.selectedOptionIds.includes(option.id) || false
                              }
                              onChange={() => handleOptionSelect(question.id, option.id)}
                              className="h-4 w-4"
                            />
                            {option.text}
                          </label>
                        ))}
                      </div>
                    )}

                  {(question.type === 'SHORT_ANSWER' || question.type === 'ESSAY') && (
                    <Textarea
                      placeholder="เขียนคำตอบ..."
                      value={answers.find((a) => a.questionId === question.id)?.textAnswer || ''}
                      onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            <Button type="submit" disabled={submitAttemptMutation.isPending}>
              {submitAttemptMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
            </Button>
          </form>
        </>
      )}

      {isSubmitted && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle>ส่งคำตอบเรียบร้อย!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {score != null && maxScore != null ? (
              <div className="rounded-xl bg-emerald-50 p-6 text-center">
                <p className="text-sm text-emerald-700">คะแนนของคุณ</p>
                <p className="text-4xl font-bold text-emerald-800">
                  {score}/{maxScore}
                </p>
                {percentage != null && (
                  <p className="mt-1 text-emerald-600">{percentage}%</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">ครูจะตรวจและแจ้งคะแนนภายหลัง</p>
            )}
            <Button onClick={() => navigate(-1)}>กลับ</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
