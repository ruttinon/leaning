import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BookOpen, Star, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function CoursesPage() {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => await api.get('/public/courses'),
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">คอร์สทั้งหมด</h1>
          <p className="text-lg text-gray-600">เลือกเรียนคอร์สที่สนใจได้เลย!</p>
        </div>

        {isLoading && <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>}
        {error && <div className="text-center py-12 text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses?.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="block">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-16 w-16 text-blue-600" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                    {course.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>อาจารย์ {course.teacher?.user?.firstName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {course.price === 0 ? 'ฟรี' : `฿${course.price}`}
                      </span>
                      <span className="text-sm text-gray-500">{course.level}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
