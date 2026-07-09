import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { api } from '@/lib/api'

export function StudentBrowseCoursesPage() {
  const navigate = useNavigate()
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
      queryClient.invalidateQueries({ queryKey: ['my-courses'] })
    },
  })

  if (isLoading) {
    return <div className="py-12 text-center text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ค้นหาคอร์ส</h1>
        <p className="text-gray-600">ค้นหาและสมัครเรียนคอร์สที่คุณสนใจ</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course: any) => {
          const isPaidCourse = Number(course.price) > 0

          return (
            <Card key={course.id} className="transition-shadow hover:shadow-lg">
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">{course.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-500">{course.description}</p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-sm text-gray-500">
                      {course.subject?.name || '-'}
                    </span>
                    <p className="text-sm font-semibold text-blue-600">
                      {isPaidCourse ? `฿${course.price}` : 'ฟรี'}
                    </p>
                  </div>
                  {isPaidCourse ? (
                    <Button onClick={() => navigate(`/courses/${course.id}`)}>
                      ดูรายละเอียด
                    </Button>
                  ) : (
                    <Button
                      onClick={() => enrollMutation.mutate(course.id)}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? 'กำลังสมัคร...' : 'สมัครเรียนฟรี'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
