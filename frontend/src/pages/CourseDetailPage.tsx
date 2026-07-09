import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Clock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Users,
  X,
} from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuthStore } from '../store/auth-store'
import { useAppStore } from '../store/theme-store'
import { useTranslation } from '../lib/i18n'
import { api } from '../lib/api'
import { toast } from '../store/toast-store'
import { isApiError } from '../lib/api-error'

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  subject: any
  teacher: any
  status: string
  price: number
  level?: string
  duration?: string
  chapters?: any[]
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

interface PaymentIntentResponse {
  clientSecret: string | null
  paymentIntentStatus?: string | null
  checkoutMode?: string
  payment?: {
    id: string
    status: string
    paymentMethod?: string | null
  }
  enrollment?: {
    courseId?: string
    course?: {
      id: string
    } | null
  } | null
}

interface CouponPreview {
  code: string
  discountPercent: number
  originalPrice: number
  finalAmount: number
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()
  const { theme } = useAppStore()
  const { t } = useTranslation()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPreview | null>(null)

  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Course ID not found')
      }

      return api.get(`/public/courses/${id}`)
    },
    enabled: !!id,
  })

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error('Course ID not found')
      }

      return api.post(`/student/courses/${id}/enroll`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['my-courses'] })
      navigate(`/student/courses/${id}`)
    },
  })

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error('Course ID not found')
      }

      return api.post<PaymentIntentResponse>(`/student/courses/${id}/payment-intent`, {
        couponCode: appliedCoupon?.code,
      })
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['public-courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })

      const enrolledCourseId =
        result.enrollment?.courseId || result.enrollment?.course?.id || id

      if (result.enrollment && enrolledCourseId) {
        queryClient.invalidateQueries({ queryKey: ['my-courses'] })
        navigate(`/student/courses/${enrolledCourseId}`)
        return
      }

      if (result.payment?.id && result.clientSecret) {
        navigate(`/student/payments/${result.payment.id}/checkout`, {
          state: {
            notice: 'กรอกข้อมูลการชำระเงินเพื่อปลดล็อกคอร์สนี้',
          },
        })
        return
      }

      navigate('/student/payments', {
        state: {
          notice: 'สร้างรายการชำระเงินแล้ว คุณสามารถกลับมาชำระเงินต่อได้จากหน้านี้',
          highlightPaymentId: result.payment?.id,
        },
      })
    },
  })

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!id) {
        throw new Error('Course ID not found')
      }

      return api.post<CouponPreview>('/student/coupons/validate', { code, courseId: id })
    },
    onSuccess: (data) => {
      setAppliedCoupon(data)
      toast.success(`${t('course.couponApplied')}: ${data.code} (-${data.discountPercent}%)`)
    },
    onError: (error) => {
      setAppliedCoupon(null)
      toast.error(isApiError(error) ? error.message : 'คูปองไม่ถูกต้อง')
    },
  })

  const isStudent = user?.role === 'STUDENT'
  const isPaidCourse = Number(course?.price ?? 0) > 0
  const isActionPending =
    enrollMutation.isPending || purchaseMutation.isPending || validateCouponMutation.isPending
  const displayPrice = appliedCoupon?.finalAmount ?? Number(course?.price ?? 0)
  const totalLessons =
    course?.chapters?.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0

  const actionError =
    enrollMutation.error instanceof Error
      ? enrollMutation.error.message
      : purchaseMutation.error instanceof Error
        ? purchaseMutation.error.message
        : null

  const primaryActionLabel = !course
    ? 'กำลังโหลด...'
    : !isAuthenticated
      ? isPaidCourse
        ? 'เข้าสู่ระบบเพื่อซื้อคอร์ส'
        : 'เข้าสู่ระบบเพื่อสมัครเรียน'
      : !isStudent
        ? 'ใช้บัญชีนักเรียนเพื่อดำเนินการ'
        : isPaidCourse
          ? purchaseMutation.isPending
            ? 'กำลังสร้างรายการชำระเงิน...'
            : 'เริ่มชำระเงิน'
          : enrollMutation.isPending
            ? 'กำลังลงทะเบียน...'
            : 'ลงทะเบียนเรียนทันที'

  const actionHint = isPaidCourse
    ? 'คอร์สเสียเงินจะพาไปยังหน้าชำระเงินจริง และเปิดเรียนหลังระบบยืนยันการจ่ายสำเร็จ'
    : 'คอร์สฟรีสามารถลงทะเบียนและเริ่มเรียนได้ทันที'

  const handlePrimaryAction = () => {
    if (!course) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!isStudent) {
      return
    }

    if (isPaidCourse) {
      purchaseMutation.mutate()
      return
    }

    enrollMutation.mutate()
  }

  const handleApplyCoupon = () => {
    const code = couponInput.trim()
    if (!code) {
      return
    }

    validateCouponMutation.mutate(code.toUpperCase())
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Navbar />
      <main className="flex-1">
        {isLoading && <div className="py-20 text-center text-slate-600">กำลังโหลด...</div>}
        {error && (
          <div className="py-20 text-center text-red-600">
            เกิดข้อผิดพลาด: {String(error)}
          </div>
        )}
        {!isLoading && !error && course && (
          <>
            <section className="bg-gradient-to-br from-emerald-800 via-green-700 to-amber-700 py-20 text-white">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
                      <Sparkles className="h-4 w-4" />
                      {course.level || 'คอร์สยอดนิยม'}
                    </div>
                    <h1 className="mb-6 text-3xl font-bold md:text-5xl">{course.title}</h1>
                    <p className="mb-8 max-w-2xl text-lg text-emerald-50">{course.description}</p>
                    <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-emerald-50">
                      <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">
                        <Users className="h-4 w-4" />
                        <span>
                          อาจารย์ {course.teacher?.user?.firstName} {course.teacher?.user?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8 คะแนน</span>
                      </div>
                      {course.duration && (
                        <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="lg"
                      onClick={handlePrimaryAction}
                      disabled={isActionPending || (isAuthenticated && !isStudent)}
                      className="bg-white text-emerald-800 hover:bg-slate-100"
                    >
                      {primaryActionLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="mt-4 text-sm text-emerald-100">{actionHint}</p>
                    {actionError && <p className="mt-2 text-sm text-red-100">{actionError}</p>}
                  </div>
                  <div className="flex justify-center">
                    <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15">
                        <BookOpen className="h-12 w-12 text-white" />
                      </div>
                      <h2 className="text-2xl font-semibold">
                        {isPaidCourse ? 'ปลดล็อกหลังชำระเงิน' : 'พร้อมเรียนทันที'}
                      </h2>
                      <p className="mt-3 text-sm text-emerald-50">
                        เข้าถึงเนื้อหาแบบเป็นลำดับ ติดตามความก้าวหน้า และเรียนต่อจากอุปกรณ์ใดก็ได้
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-4 flex items-center gap-2 text-emerald-700">
                      <ShieldCheck className="h-5 w-5" />
                      <h2 className="text-xl font-semibold">สิ่งที่คุณจะได้รับ</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/60">
                        <p className="font-medium">เนื้อหาที่จัดเรียงชัดเจน</p>
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
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {totalLessons} บทเรียน
                      </span>
                    </div>
                    <div className="space-y-4">
                      {course.chapters?.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-700/50"
                        >
                          <h3 className="mb-3 text-lg font-semibold">{chapter.title}</h3>
                          <div className="space-y-2">
                            {chapter.lessons?.map((lesson: any) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm shadow-sm dark:bg-slate-800"
                              >
                                <PlayCircle className="h-5 w-5 flex-shrink-0 text-emerald-700" />
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
                        <span className="text-slate-500">{t('course.price')}</span>
                        <div className="text-right">
                          {appliedCoupon && (
                            <p className="text-sm text-slate-400 line-through">
                              ฿{appliedCoupon.originalPrice}
                            </p>
                          )}
                          <span className="text-xl font-bold text-emerald-700">
                            {displayPrice === 0 ? 'ฟรี' : `฿${displayPrice}`}
                          </span>
                        </div>
                      </div>
                      {isPaidCourse && isAuthenticated && isStudent && (
                        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            <Tag className="h-4 w-4" />
                            {t('course.couponCode')}
                          </div>
                          {appliedCoupon ? (
                            <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm dark:bg-slate-800">
                              <span>
                                {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
                              </span>
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="text-slate-500 hover:text-red-600"
                                aria-label={t('course.removeCoupon')}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                value={couponInput}
                                onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                                placeholder="DEMO10"
                                className="bg-white dark:bg-slate-800"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleApplyCoupon}
                                disabled={!couponInput.trim() || validateCouponMutation.isPending}
                              >
                                {t('course.applyCoupon')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
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
                          <span className="font-medium">
                            {new Date(course.publishedAt).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="mt-6 w-full"
                      onClick={handlePrimaryAction}
                      disabled={isActionPending || (isAuthenticated && !isStudent)}
                    >
                      {primaryActionLabel}
                    </Button>
                    <p className="mt-3 text-sm text-slate-500">{actionHint}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
