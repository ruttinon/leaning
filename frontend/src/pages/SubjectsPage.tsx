import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Subject {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  order?: number;
  isActive: boolean;
  courses?: any[];
}

export function SubjectsPage() {
  const { data: subjects, isLoading, error } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => await api.get('/public/subjects'),
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">รายวิชาทั้งหมด</h1>
          <p className="text-lg text-gray-600">เลือกวิชาที่สนใจและดูคอร์สที่เกี่ยวข้อง!</p>
        </div>

        {isLoading && <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>}
        {error && <div className="text-center py-12 text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects?.map((subject) => (
              <Link key={subject.id} to={`/subjects/${subject.id}`} className="block">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div
                    className="h-40 flex items-center justify-center"
                    style={{ backgroundColor: subject.color || '#3b82f6' }}
                  >
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{subject.name}</h3>
                    {subject.description && (
                      <p className="text-gray-600 text-sm">{subject.description}</p>
                    )}
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
