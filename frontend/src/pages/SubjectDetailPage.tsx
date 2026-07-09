import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BookOpen, Star } from 'lucide-react';
import { api } from '../lib/api';

interface Subject {
  id: string;
  name: string;
  description?: string;
  courses?: any[];
}

export function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: subject, isLoading, error } = useQuery<Subject>({
    queryKey: ['subject', id],
    queryFn: async () => {
      if (!id) throw new Error('Subject ID not found');
      return await api.get(`/public/subjects/${id}`);
    },
    enabled: !!id,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && <div className="text-center py-20 text-gray-600">กำลังโหลด...</div>}
        {error && <div className="text-center py-20 text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>}
        {!isLoading && !error && subject && (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{subject.name}</h1>
              {subject.description && <p className="text-lg text-gray-600">{subject.description}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subject.courses?.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="block">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="h-48 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-emerald-700" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span>4.8</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-700">
                          {course.price === 0 ? 'ฟรี' : `฿${course.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
