import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'

export function StudentQuizPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [answers, setAnswers] = useState<any[]>([])
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['student-quiz', quizId],
    queryFn: () => api.get<any>(`/student/quizzes/${quizId}`),
  })

  const startAttemptMutation = useMutation({
    mutationFn: () => api.post(`/student/quizzes/${quizId}/attempts`, {}),
    onSuccess: (data: any) => {
      setAttemptId(data.id)
    },
  })

  const submitAttemptMutation = useMutation({
    mutationFn: () => api.post(`/student/quiz-attempts/${attemptId}/submit`, {
      answers,
    }),
    onSuccess: () => {
      setIsSubmitted(true)
      queryClient.invalidateQueries({ queryKey: ['student-quiz-attempt', attemptId] })
    },
  })

  useEffect(() => {
    if (quiz?.questions && answers.length === 0) {
      setAnswers(quiz.questions.map((q: any) => ({
        questionId: q.id,
        selectedOptionIds: [],
        textAnswer: '',
      })))
    }
  }, [quiz])

  const handleStartAttempt = () => {
    startAttemptMutation.mutate()
  }

  const handleOptionChange = (questionId: string, optionId: string, isChecked: boolean) => {
    setAnswers(prev => prev.map(answer => {
      if (answer.questionId === questionId) {
        return {
          ...answer,
          selectedOptionIds: isChecked
            ? [...answer.selectedOptionIds, optionId]
            : answer.selectedOptionIds.filter((id: string) => id !== optionId),
        }
      }
      return answer
    }))
  }

  const handleTextAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => prev.map(answer => {
      if (answer.questionId === questionId) {
        return {
          ...answer,
          textAnswer: value,
        }
      }
      return answer
    }))
  }

  const handleSubmit = () => {
    if (!attemptId) return
    submitAttemptMutation.mutate()
  }

  if (isLoading) return <div className="text-center py-12">กำลังโหลด...</div>
  if (!quiz) return <div className="text-center py-12">ไม่พบแบบทดสอบ</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>← กลับ</Button>
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
        </div>
      </div>

      {!attemptId && !isSubmitted && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="mb-4">กดเริ่มทำแบบทดสอบ</p>
              <Button onClick={handleStartAttempt} disabled={startAttemptMutation.isPending}>
                เริ่มทำ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {attemptId && !isSubmitted && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {quiz.questions.map((question: any, index: number) => (
            <Card key={question.id} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {index + 1}. {question.text} ({question.points} คะแนน)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {question.type === 'MULTIPLE_CHOICE' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option: any) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`option-${option.id}`}
                          checked={answers.find(a => a.questionId === question.id)?.selectedOptionIds.includes(option.id) || false}
                          onChange={(e) => handleOptionChange(question.id, option.id, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`option-${option.id}`}>{option.text}</label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'TRUE_FALSE' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option: any) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          id={`option-${option.id}`}
                          value={option.id}
                          checked={answers.find(a => a.questionId === question.id)?.selectedOptionIds.includes(option.id) || false}
                          onChange={(e) => {
                            setAnswers(prev => prev.map(answer => {
                              if (answer.questionId === question.id) {
                                return {
                                  ...answer,
                                  selectedOptionIds: [e.target.value],
                                }
                              }
                              return answer
                            }))
                          }}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`option-${option.id}`}>{option.text}</label>
                      </div>
                    ))}
                  </div>
                )}

                {(question.type === 'SHORT_ANSWER' || question.type === 'ESSAY') && (
                  <Textarea
                    placeholder="เข้าถามคําตอบ..."
                    value={answers.find(a => a.questionId === question.id)?.textAnswer || ''}
                    onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-4">
            <Button type="submit" disabled={submitAttemptMutation.isPending}>
              ส่งคําตอบ
            </Button>
          </div>
        </form>
      )}

      {isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle>ส่งคําตอบเรียบร้อย!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">ขอบคุณที่ทำแบบทดสอบ</p>
            <Button className="mt-4" onClick={() => navigate(-1)}>
              กลับ
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
