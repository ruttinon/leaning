import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Quiz {
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

export function TeacherQuizzesPage() {
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['teacher-quizzes'],
    queryFn: async () => api.get<Quiz[]>('/teacher/quizzes'),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quiz ทั้งหมด</h1>
        <p className="text-gray-600">จัดการ Quiz และโจทย์การฝึกหัดของคุณ</p>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มี Quiz</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{quiz.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(quiz.createdAt).toLocaleDateString('th-TH')}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quiz.showAnswers ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> แสดงเฉลย
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> ไม่แสดงเฉลย
                    </span>
                  )}
                  {quiz.timeLimit && (
                    <span className="text-xs bg-emerald-100 text-blue-700 px-2 py-1 rounded-full">
                      {quiz.timeLimit} นาที
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
