import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BookOpen, Star, Users, Clock, PlayCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../store/auth-store';
import { useAppStore } from '../store/theme-store';
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
  const { theme } = useAppStore();
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

  const totalLessons = course?.chapters?.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0;

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      <main className="flex-1">
        {isLoading && <div className="py-20 text-center text-slate-600">กำลังโหลด...</div>}
        {error && <div className="py-20 text-center text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>}
        {!isLoading && !error && course && (
          <>
            <section className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 py-20 text-white">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
                      <Sparkles className="h-4 w-4" />
                      {course.level || 'คอร์สยอดนิยม'}
                    </div>
                    <h1 className="mb-6 text-3xl font-bold md:text-5xl">{course.title}</h1>
                    <p className="mb-8 max-w-2xl text-lg text-indigo-50">{course.description}</p>
                    <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-indigo-50">
                      <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">
                        <Users className="h-4 w-4" />
                        <span>อาจารย์ {course.teacher?.user?.firstName} {course.teacher?.user?.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>4.8 คะแนน</span>
                      </div>
                      {course.duration && (
                        <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                      )}
                    </div>
                    <Button size="lg" onClick={handleEnroll} className="bg-white text-indigo-700 hover:bg-slate-100">
                      ลงทะเบียนเรียน
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15">
                        <BookOpen className="h-12 w-12 text-white" />
                      </div>
                      <h2 className="text-2xl font-semibold">พร้อมเรียนทันที</h2>
                      <p className="mt-3 text-sm text-indigo-50">เข้าถึงเนื้อหาแบบเป็นลำดับและติดตามความก้าวหน้าได้อย่างง่าย ๆ</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-4 flex items-center gap-2 text-indigo-600">
                      <ShieldCheck className="h-5 w-5" />
                      <h2 className="text-xl font-semibold">สิ่งที่คุณจะได้รับ</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/60">
                        <p className="font-medium">เนื้อหาที่จัดระเบียบชัดเจน</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/60">
                        <p className="font-medium">เรียนตามลำดับขั้นตอน</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/60">
                        <p className="font-medium">ติดตามความก้าวหน้าได้ง่าย</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/60">
                        <p className="font-medium">สนับสนุนจากครูผู้สอน</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-xl font-semibold">บทเรียนทั้งหมด</h2>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                        {totalLessons} บทเรียน
                      </span>
                    </div>
                    <div className="space-y-4">
                      {course.chapters?.map((chapter) => (
                        <div key={chapter.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-700/50">
                          <h3 className="mb-3 text-lg font-semibold">{chapter.title}</h3>
                          <div className="space-y-2">
                            {chapter.lessons?.map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm shadow-sm dark:bg-slate-800">
                                <PlayCircle className="h-5 w-5 flex-shrink-0 text-indigo-600" />
                                <span>{lesson.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="mb-4 text-xl font-semibold">รายละเอียดคอร์ส</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-700/60">
                        <span className="text-slate-500">ราคา</span>
                        <span className="text-xl font-bold text-indigo-600">{course.price === 0 ? 'ฟรี' : `฿${course.price}`}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-700/60">
                        <span className="text-slate-500">ระดับ</span>
                        <span className="font-medium">{course.level || 'ทั่วไป'}</span>
                      </div>
                      {course.duration && (
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-700/60">
                          <span className="text-slate-500">ระยะเวลา</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                      )}
                      {course.publishedAt && (
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-700/60">
                          <span className="text-slate-500">เผยแพร่</span>
                          <span className="font-medium">{new Date(course.publishedAt).toLocaleDateString('th-TH')}</span>
                        </div>
                      )}
                    </div>
                    <Button className="mt-6 w-full" onClick={handleEnroll}>
                      ลงทะเบียนเรียนตอนนี้
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
