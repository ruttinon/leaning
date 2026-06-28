import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { api } from '@/lib/api'

export function StudentBrowseCoursesPage() {
  const queryClient = useQueryClient()

  const { data: courses, isLoading } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => api.get<any>('/public/courses'),
  })

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => api.post(`/student/courses/${courseId}/enroll`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ค้นหาคอร์ส</h1>
        <p className="text-gray-600">ค้นหาและสมัครเรียนคอร์สที่คุณสนใจ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course: any) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {course.subject?.name || '-'}
                </span>
                <Button
                  onClick={() => enrollMutation.mutate(course.id)}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? 'กำลังสมัคร...' : 'สมัครเรียน'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
