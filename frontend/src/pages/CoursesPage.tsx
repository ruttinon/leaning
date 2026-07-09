import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BookOpen, Star, Users, Sparkles, ArrowRight, Clock3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAppStore } from '@/store/theme-store';

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
  const { theme } = useAppStore();
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => await api.get('/public/courses'),
  });

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-br from-emerald-800 via-green-700 to-amber-700 py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.26),_transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white/90 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                คอร์สที่ถูกออกแบบมาเพื่อให้คุณเรียนได้ง่ายขึ้น
              </div>
              <h1 className="text-4xl font-bold text-white md:text-5xl">เลือกคอร์สที่ใช่สำหรับคุณ</h1>
              <p className="mt-4 text-lg text-emerald-50">เรียนจากครูมืออาชีพ คอร์สเน้นการปฏิบัติ และติดตามความก้าวหน้าได้จากที่เดียว</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800">
            <div>
              <h2 className="text-xl font-semibold">คอร์สทั้งหมด</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>เลือกตามความสนใจและระดับความพร้อมของคุณ</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-700 dark:text-slate-300">
                <Clock3 className="h-4 w-4" />
                เรียนได้ทุกเมื่อ
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-700 dark:text-slate-300">
                <Users className="h-4 w-4" />
                ครูผู้เชี่ยวชาญ
              </div>
            </div>
          </div>

          {isLoading && <div className="py-12 text-center text-slate-600">กำลังโหลด...</div>}
          {error && <div className="py-12 text-center text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {courses?.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="group block">
                  <div className={`overflow-hidden rounded-3xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-emerald-100 via-green-100 to-amber-100">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            const target = event.currentTarget
                            target.onerror = null
                            target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                          }}
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-emerald-700" />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">{course.level || 'พื้นฐาน'}</span>
                        <span className="text-sm font-semibold text-emerald-600">{course.price === 0 ? 'ฟรี' : `฿${course.price}`}</span>
                      </div>
                      <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{course.title}</h3>
                      {course.description && (
                        <p className={`mt-2 text-sm leading-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{course.description}</p>
                      )}
                      <div className="mt-5 flex items-center justify-between text-sm">
                        <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Users className="h-4 w-4" />
                          <span>อาจารย์ {course.teacher?.user?.firstName || 'ทีมครู'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">4.8</span>
                        </div>
                      </div>
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                        ดูรายละเอียด <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
