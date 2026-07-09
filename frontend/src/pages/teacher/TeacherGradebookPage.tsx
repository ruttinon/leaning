import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export function TeacherGradebookPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const { data: gradebook, isLoading } = useQuery({
    queryKey: ['teacher-gradebook', courseId],
    queryFn: async () => api.get<any[]>(`/teacher/gradebook/${courseId}`),
    enabled: !!courseId,
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สมุดคะแนน</h1>
        <p className="text-gray-600">ดูคะแนนของนักเรียนทั้งหมด</p>
      </div>

      {!gradebook || gradebook.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">ยังไม่มีนักเรียนในคอร์สนี้</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <CardContent className="pt-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">นักเรียน</th>
                    <th scope="col" className="px-6 py-3">คะแนน Quiz</th>
                    <th scope="col" className="px-6 py-3">คะแนน Assignment</th>
                    <th scope="col" className="px-6 py-3">คะแนนรวม</th>
                    <th scope="col" className="px-6 py-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {gradebook.map((entry: any, index: number) => {
                    const percentage = entry.totalMaxScore > 0
                      ? Math.round((entry.totalScore / entry.totalMaxScore) * 100)
                      : 0
                    const status = percentage >= 80 ? 'ผ่าน' : percentage >= 50 ? 'พอใช้' : 'ต้องปรับปรุง'

                    return (
                      <tr key={index} className="bg-white border-b hover:bg-gray-50">
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
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            status === 'ผ่าน' ? 'bg-green-100 text-green-700' :
                            status === 'พอใช้' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {status}
                          </span>
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
    </div>
  )
}
