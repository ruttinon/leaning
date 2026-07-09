import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { api } from '@/lib/api'

export function StudentMyCoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => api.get<Array<any>>('/student/courses'),
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">คอร์สของฉัน</h1>
        <p className="text-gray-600">คอร์สที่คุณได้ลงทะเบียน</p>
      </div>

      {(!courses || courses.length === 0) ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">คุณยังไม่ได้ลงทะเบียนคอร์ส</p>
          <Link to="/student/browse-courses">
            <Button>
              ดูคอร์สทั้งหมด
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((enrollment: any) => (
            <Link key={enrollment.id} to={`/student/courses/${enrollment.courseId}`} className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-emerald-700" />
                </div>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{enrollment.course.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    อาจารย์ {enrollment.course.teacher?.user?.firstName} {enrollment.course.teacher?.user?.lastName}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">ความก้าวหน้า: {enrollment.progress}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-700 h-2 rounded-full"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
