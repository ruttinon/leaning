import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Teacher {
  id: string;
  user: any;
  bio: string;
  qualifications?: string;
  experience?: string;
  specialization?: string;
  courses?: any[];
}

export function TeachersPage() {
  const { data: teachers, isLoading, error } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => await api.get('/public/teachers'),
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ครูผู้สอนทั้งหมด</h1>
          <p className="text-lg text-gray-600">พบครูที่มีความเชี่ยวชาญตามสาขา!</p>
        </div>

        {isLoading && <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>}
        {error && <div className="text-center py-12 text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers?.map((teacher) => (
              <Link key={teacher.id} to={`/teachers/${teacher.id}`} className="block">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-40 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                    <Users className="h-16 w-16 text-green-600" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {teacher.user?.firstName} {teacher.user?.lastName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{teacher.bio}</p>
                    {teacher.specialization && (
                      <div className="text-sm text-gray-500 mb-4">
                        เชี่ยวชาญ: {teacher.specialization}
                      </div>
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
