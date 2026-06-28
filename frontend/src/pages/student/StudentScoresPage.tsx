import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

interface ScoresData {
  quizAttempts?: Array<any>
  assignmentSubmissions?: Array<any>
}

export function StudentScoresPage() {
  const { data: scores, isLoading } = useQuery({
    queryKey: ['student-scores'],
    queryFn: async () => api.get<ScoresData>('/student/scores'),
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">คะแนน</h1>
        <p className="text-gray-600">ดูคะแนนของคุณ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Scores */}
        <Card>
          <CardHeader>
            <CardTitle>คะแนนแบบฝึกหัด</CardTitle>
          </CardHeader>
          <CardContent>
            {!scores?.quizAttempts || scores.quizAttempts.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีคะแนน</p>
            ) : (
              <div className="space-y-4">
                {scores.quizAttempts.map((attempt: any) => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{attempt.quiz?.title}</p>
                      <p className="text-sm text-gray-500">{attempt.quiz?.lesson?.chapter?.course?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        {attempt.score !== null ? `${attempt.score}/${attempt.maxScore}` : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Scores */}
        <Card>
          <CardHeader>
            <CardTitle>คะแนนการบ้าน</CardTitle>
          </CardHeader>
          <CardContent>
            {!scores?.assignmentSubmissions || scores.assignmentSubmissions.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีคะแนน</p>
            ) : (
              <div className="space-y-4">
                {scores.assignmentSubmissions.map((submission: any) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{submission.assignment?.title}</p>
                      <p className="text-sm text-gray-500">{submission.assignment?.lesson?.chapter?.course?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        {submission.grade !== null ? `${submission.grade}/${submission.assignment?.maxPoints}` : '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {submission.status === 'GRADED' ? 'ตรวจแล้ว' : submission.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
