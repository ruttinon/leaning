import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BookOpen, Star, Users, Clock, PlayCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../store/auth-store';
import { api } from '../lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  subject: any;
  teacher: any;
  status: string;
  price: number;
  level?: string;
  duration?: string;
  chapters?: any[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID not found');
      return await api.get(`/public/courses/${id}`);
    },
    enabled: !!id,
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Will implement enroll API later
    alert('Enrolling in course...');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {isLoading && <div className="text-center py-20 text-gray-600">กำลังโหลด...</div>}
        {error && <div className="text-center py-20 text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>}
        {!isLoading && !error && course && (
          <>
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-block bg-blue-600 px-4 py-1 rounded-full text-sm mb-4">
                      {course.level}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">{course.title}</h1>
                    <p className="text-lg mb-6 text-blue-100">{course.description}</p>
                    <div className="flex items-center gap-6 mb-8">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>อาจารย์ {course.teacher?.user?.firstName} {course.teacher?.user?.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span>4.8</span>
                      </div>
                      {course.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          <span>{course.duration}</span>
                        </div>
                      )}
                    </div>
                    <Button size="lg" onClick={handleEnroll} className="bg-white text-blue-900 hover:bg-gray-100">
                      ลงทะเบียนเรียน
                    </Button>
                  </div>
                  <div className="hidden lg:flex justify-center">
                    <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                      <BookOpen className="h-24 w-24 mx-auto text-blue-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">บทเรียนทั้งหมด</h2>
                  {course.chapters?.map((chapter) => (
                    <div key={chapter.id} className="bg-white rounded-xl shadow-md p-6 mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{chapter.title}</h3>
                      {chapter.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                          <PlayCircle className="h-6 w-6 text-blue-600" />
                          <span className="text-gray-700">{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">รายละเอียดเพิ่มเติม</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">ราคา</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {course.price === 0 ? 'ฟรี' : `฿${course.price}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">ระดับ</span>
                        <span className="font-medium text-gray-900">{course.level}</span>
                      </div>
                      {course.duration && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">ระยะเวลา</span>
                          <span className="font-medium text-gray-900">{course.duration}</span>
                        </div>
                      )}
                      {course.publishedAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">เผยแพร่</span>
                          <span className="font-medium text-gray-900">{new Date(course.publishedAt).toLocaleDateString('th-TH')}</span>
                        </div>
                      )}
                    </div>
                    <Button className="w-full mt-6" onClick={handleEnroll}>
                      ลงทะเบียนเรียนตอนนี้
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
