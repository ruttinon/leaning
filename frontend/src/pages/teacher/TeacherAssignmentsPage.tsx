import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description?: string | null;
  maxPoints: number;
  dueDate?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function TeacherAssignmentsPage() {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: async () => api.get<Assignment[]>('/teacher/assignments'),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assignment ทั้งหมด</h1>
        <p className="text-gray-600">จัดการการบ้านและงานของนักเรียน</p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มี Assignment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                {assignment.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>คะแนนเต็ม: {assignment.maxPoints}</p>
                  {assignment.dueDate && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      ส่งเมื่อ: {new Date(assignment.dueDate).toLocaleDateString('th-TH')}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    สร้างเมื่อ: {new Date(assignment.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
