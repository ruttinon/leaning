import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Users, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Student {
  id: string;
  email: string;
  username?: string | null;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  enrollments: number;
}

export function TeacherStudentsPage() {
  const { data: students, isLoading } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: async () => api.get<Student[]>('/teacher/students'),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">นักเรียนทั้งหมด</h1>
        <p className="text-gray-600">ดูรายชื่อนักเรียนที่ลงทะเบียนเรียนกับคุณ</p>
      </div>

      {!students || students.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีนักเรียน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {student.firstName.charAt(0)}
                    {student.lastName.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {student.firstName} {student.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    {student.username && (
                      <p className="text-sm text-gray-400">@{student.username}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(student.createdAt).toLocaleDateString('th-TH')}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {student.enrollments} คอร์ส
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
