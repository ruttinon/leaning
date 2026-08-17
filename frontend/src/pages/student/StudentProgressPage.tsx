import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageIntro } from '@/components/PageIntro'
import { EmptyState } from '@/components/EmptyState'
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
      <PageIntro kicker="ติดตาม" title="ความก้าวหน้า" description="ติดตามความก้าวหน้าการเรียนของคุณ" />

      {!progress || progress.length === 0 ? (
        <EmptyState title="ยังไม่ได้ลงทะเบียนคอร์ส" description="เมื่อเริ่มเรียนแล้ว ความก้าวหน้าจะปรากฏที่นี่" />
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
                  <span className="text-3xl font-semibold text-[var(--primary)]">{item.progress}%</span>
                </div>
                <div className="h-1 w-full bg-[var(--bg-tertiary)]">
                  <div
                    className="h-1 bg-[var(--primary)] transition-all duration-500"
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
