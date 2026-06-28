import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Calendar, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface Exam {
  id: string;
  lessonId: string;
  title: string;
  description?: string | null;
  type: string;
  timeLimit?: number | null;
  maxAttempts?: number | null;
  showAnswers: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

export function TeacherExamsPage() {
  const { data: exams, isLoading } = useQuery({
    queryKey: ['teacher-exams'],
    queryFn: async () => api.get<Exam[]>('/teacher/exams'),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exam ทั้งหมด</h1>
        <p className="text-gray-600">จัดการข้อสอบและระดับชั้นของคุณ</p>
      </div>

      {!exams || exams.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มี Exam</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{exam.title}</CardTitle>
                {exam.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{exam.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-500">
                  {exam.timeLimit && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      ระยะเวลา: {exam.timeLimit} นาที
                    </p>
                  )}
                  {exam.maxAttempts && (
                    <p>จำนวนครั้งที่ทำได้: {exam.maxAttempts} ครั้ง</p>
                  )}
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    สร้างเมื่อ: {new Date(exam.createdAt).toLocaleDateString('th-TH')}
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
