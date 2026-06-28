import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, X } from 'lucide-react'
import { api } from '@/lib/api'

export function TeacherSubmissionsPage() {
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null)
  const [grade, setGrade] = useState<number | ''>('')
  const [feedback, setFeedback] = useState('')
  const queryClient = useQueryClient()

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['teacher-submissions'],
    queryFn: async () => api.get<Array<any>>('/teacher/submissions'),
  })

  const gradeMutation = useMutation({
    mutationFn: async () => {
      if (!gradingSubmissionId) return
      return api.put(`/teacher/submissions/${gradingSubmissionId}/grade`, {
        grade: grade,
        feedback: feedback,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] })
      setGradingSubmissionId(null)
      setGrade('')
      setFeedback('')
    },
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">การบ้านที่ส่งมา</h1>
        <p className="text-gray-600">ตรวจและให้คะแนนการบ้าน</p>
      </div>

      {!submissions || submissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">ยังไม่มีการบ้านที่ส่งมา</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission: any) => (
            <Card key={submission.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{submission.assignment?.title}</h3>
                      <p className="text-gray-500 text-sm">
                        {submission.student?.user?.firstName} {submission.student?.user?.lastName}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        ส่งเมื่อ: {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString('th-TH')}
                      </p>
                      {submission.textAnswer && (
                        <p className="text-sm text-gray-700 mt-2">คำตอบ: {submission.textAnswer}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      submission.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                      submission.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {submission.status === 'GRADED' ? 'ตรวจแล้ว' :
                       submission.status === 'SUBMITTED' ? 'ส่งแล้ว' : 'รอส่ง'}
                    </span>
                    {submission.grade !== null && (
                      <p className="text-xl font-bold text-blue-600 mt-2">
                        {submission.grade}/{submission.assignment?.maxPoints}
                      </p>
                    )}
                    {submission.feedback && (
                      <p className="text-sm text-gray-600 mt-1">ความคิดเห็น: {submission.feedback}</p>
                    )}
                    {submission.status !== 'GRADED' && (
                      <Button size="sm" className="mt-2" onClick={() => {
                        setGradingSubmissionId(submission.id)
                      }}>ตรวจงาน</Button>
                    )}
                  </div>
                </div>
              </CardContent>

              {gradingSubmissionId === submission.id && (
                <Card className="mt-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>ตรวจงาน</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setGradingSubmissionId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>คะแนน ({submission.assignment?.maxPoints} คะแนนเต็ม)</Label>
                      <Input
                        type="number"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : '')}
                        placeholder="ใส่คะแนน"
                      />
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
                        onClick={() => gradeMutation.mutate()}
                        disabled={gradeMutation.isPending}
                      >บันทึก</Button>
                      <Button
                        variant="outline"
                        onClick={() => setGradingSubmissionId(null)}
                      >ยกเลิก</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
