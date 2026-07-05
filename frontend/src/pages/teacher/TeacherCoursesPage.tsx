import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus } from 'lucide-react'
import { api } from '@/lib/api'

export function TeacherCoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: async () => api.get<Array<any>>('/teacher/courses'),
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">คอร์สของฉัน</h1>
          <p className="text-gray-600">จัดการคอร์สของคุณ</p>
        </div>
        <Link to="/teacher/courses/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            สร้างคอร์สใหม่
          </Button>
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500 mb-4">คุณยังไม่มีคอร์ส</p>
            <Link to="/teacher/courses/create">
              <Button>สร้างคอร์สแรกของคุณ</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-green-600" />
              </div>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${course.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : course.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {course.status === 'PUBLISHED' ? 'เผยแพร่แล้ว' : course.status === 'PENDING_REVIEW' ? 'รออนุมัติ' : course.status === 'DRAFT' ? 'ฉบับร่าง' : course.status}
                  </span>
                  <span className="text-sm text-gray-500">{course.subject?.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{course.price ? `${course.price} บาท` : 'ฟรี'}</span>
                  <Link to={`/teacher/courses/${course.id}`}>
                    <Button variant="outline" size="sm">จัดการ</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
