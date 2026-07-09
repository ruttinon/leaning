import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Users, BookOpen, Star } from 'lucide-react'
import { api } from '../lib/api'

interface Teacher {
  id: string
  user: any
  bio: string
  qualifications?: string
  experience?: string
  specialization?: string
  courses?: any[]
}

export function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: teacher, isLoading, error } = useQuery<Teacher>({
    queryKey: ['teacher', id],
    queryFn: async () => {
      if (!id) throw new Error('Teacher ID not found')
      return await api.get(`/public/teachers/${id}`)
    },
    enabled: !!id,
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && <div className="text-center py-20 text-gray-600">กำลังโหลด...</div>}
        {error && <div className="text-center py-20 text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>}
        {!isLoading && !error && teacher && (
          <>
            {/* Teacher Info */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-12">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-32 h-32 bg-gradient-to-br from-green-200 to-teal-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-16 w-16 text-green-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {teacher.user?.firstName} {teacher.user?.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">{teacher.bio}</p>
                  {teacher.specialization && (
                    <p className="text-gray-500 mb-2">
                      <strong>เชี่ยวชาญ:</strong> {teacher.specialization}
                    </p>
                  )}
                  {teacher.qualifications && (
                    <p className="text-gray-500 mb-2">
                      <strong>วุฒิการศึกษา:</strong> {teacher.qualifications}
                    </p>
                  )}
                  {teacher.experience && (
                    <p className="text-gray-500">
                      <strong>ประสบการณ์:</strong> {teacher.experience}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Teacher's Courses */}
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              คอร์สของอาจารย์ {teacher.user?.firstName}
            </h2>
            {teacher.courses && teacher.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teacher.courses.map((course) => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="block">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="h-48 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-emerald-700" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                        {course.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                        )}
                        <div className="flex items-center justify-between">
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
            ) : (
              <div className="text-center py-12 text-gray-600">
                ยังไม่มีคอร์สในขณะนี้
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
