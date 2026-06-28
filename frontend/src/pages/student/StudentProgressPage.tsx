import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

export function StudentProgressPage() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['student-progress'],
    queryFn: async () => api.get<Array<any>>('/student/progress'),
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ความก้าวหน้า</h1>
        <p className="text-gray-600">ติดตามความก้าวหน้าการเรียนของคุณ</p>
      </div>

      {!progress || progress.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">คุณยังไม่ได้ลงทะเบียนคอร์ส</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {progress.map((item: any) => (
            <Card key={item.course.id}>
              <CardHeader>
                <CardTitle>{item.course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">
                    บทเรียนที่เสร็จ: {item.completedLessons}/{item.totalLessons}
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
