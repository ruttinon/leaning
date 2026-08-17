import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Award, ChevronLeft, Eye } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { PageIntro } from '@/components/PageIntro'

interface GradebookEntry {
  student: {
    id: string
    user: { firstName: string; lastName: string }
  }
  totalQuizScore: number
  totalQuizMaxScore: number
  totalAssignmentScore: number
  totalAssignmentMaxScore: number
  totalScore: number
  totalMaxScore: number
  quizAttempts?: Array<{
    id: string
    score?: number | string | null
    maxScore?: number | string | null
    completedAt?: string | null
    quiz?: { title: string; type?: string }
  }>
  assignmentSubmissions?: Array<{
    id: string
    grade?: number | string | null
    status: string
    assignment?: { title: string; maxPoints: number }
  }>
}

export function TeacherGradebookPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [selectedEntry, setSelectedEntry] = useState<GradebookEntry | null>(null)

  const { data: gradebook, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-gradebook', courseId],
    queryFn: () => api.get<GradebookEntry[]>(`/teacher/gradebook/${courseId}`),
    enabled: !!courseId,
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="คะแนน"
        title="สมุดคะแนน"
        description="ดูคะแนนของนักเรียนทั้งหมดในคอร์สนี้ — กดดูรายละเอียดเพื่อ drill-down"
        actions={
          <Link to="/teacher/gradebook">
            <Button variant="outline" size="sm" className="rounded-sm">
              <ChevronLeft className="mr-1 h-4 w-4" />
              กลับ
            </Button>
          </Link>
        }
      />

      {!gradebook?.length ? (
        <EmptyState
          icon={Award}
          title="ยังไม่มีนักเรียนในคอร์สนี้"
          description="เมื่อมีนักเรียนลงทะเบียนและทำ Quiz หรือส่งการบ้าน คะแนนจะแสดงที่นี่"
        />
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <CardContent className="pt-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">นักเรียน</th>
                    <th scope="col" className="px-6 py-3">คะแนน Quiz</th>
                    <th scope="col" className="px-6 py-3">คะแนน Assignment</th>
                    <th scope="col" className="px-6 py-3">คะแนนรวม</th>
                    <th scope="col" className="px-6 py-3">สถานะ</th>
                    <th scope="col" className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {gradebook.map((entry) => {
                    const percentage = entry.totalMaxScore > 0
                      ? Math.round((entry.totalScore / entry.totalMaxScore) * 100)
                      : 0
                    const status = percentage >= 80 ? 'ผ่าน' : percentage >= 50 ? 'พอใช้' : 'ต้องปรับปรุง'

                    return (
                      <tr
                        key={entry.student.id}
                        className="border-b bg-white hover:bg-gray-50"
                      >
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                          {entry.student.user.firstName} {entry.student.user.lastName}
                        </th>
                        <td className="px-6 py-4">
                          {entry.totalQuizScore}/{entry.totalQuizMaxScore}
                        </td>
                        <td className="px-6 py-4">
                          {entry.totalAssignmentScore}/{entry.totalAssignmentMaxScore}
                        </td>
                        <td className="px-6 py-4">
                          {entry.totalScore}/{entry.totalMaxScore} ({percentage}%)
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-1 text-sm ${
                            status === 'ผ่าน' ? 'bg-green-100 text-green-700' :
                            status === 'พอใช้' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            รายละเอียด
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="p-0">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedEntry.student.user.firstName} {selectedEntry.student.user.lastName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 px-6 pb-6">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-800">Quiz / Exam</h3>
                  {!selectedEntry.quizAttempts?.length ? (
                    <p className="text-sm text-gray-500">ยังไม่มีการทำ Quiz</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedEntry.quizAttempts.map((attempt) => (
                        <li
                          key={attempt.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                        >
                          <span>
                            {attempt.quiz?.title || 'Quiz'}
                            {attempt.quiz?.type === 'EXAM' && (
                              <span className="ml-2 text-xs text-amber-600">(Exam)</span>
                            )}
                          </span>
                          <span className="font-medium text-emerald-700">
                            {attempt.completedAt
                              ? `${Number(attempt.score || 0)}/${Number(attempt.maxScore || 0)}`
                              : 'ยังไม่ส่ง'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-800">Assignment</h3>
                  {!selectedEntry.assignmentSubmissions?.length ? (
                    <p className="text-sm text-gray-500">ยังไม่มีการส่งงาน</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedEntry.assignmentSubmissions.map((sub) => (
                        <li
                          key={sub.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                        >
                          <span>{sub.assignment?.title || 'งาน'}</span>
                          <span className="font-medium">
                            {sub.status === 'GRADED'
                              ? `${Number(sub.grade || 0)}/${sub.assignment?.maxPoints || 0}`
                              : sub.status === 'SUBMITTED'
                                ? 'รอตรวจ'
                                : 'รอส่ง'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-xl bg-emerald-50 p-4 text-center">
                  <p className="text-sm text-emerald-700">คะแนนรวม</p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {selectedEntry.totalScore}/{selectedEntry.totalMaxScore}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
