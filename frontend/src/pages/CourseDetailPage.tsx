import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  PlayCircle,
  Tag,
  X,
} from 'lucide-react'
import { PublicShell } from '@/components/PublicShell'
import { Photo } from '@/components/media/Photo'
import { resolveCover } from '@/lib/media'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuthStore } from '../store/auth-store'
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
    <PublicShell>
        {isLoading && <div className="py-20 text-center text-[var(--text-muted)]">กำลังโหลด...</div>}
        {error && (
          <div className="py-20 text-center text-[var(--danger)]">
            เกิดข้อผิดพลาด: {String(error)}
          </div>
        )}
        {!isLoading && !error && course && (
          <>
            <section className="mx-auto grid max-w-6xl items-end gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="kicker">{course.level || 'คอร์ส'}</p>
                <h1 className="mt-3 text-4xl md:text-5xl">{course.title}</h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">{course.description}</p>
                <p className="mt-6 text-sm text-[var(--text-muted)]">
                  อาจารย์ {course.teacher?.user?.firstName} {course.teacher?.user?.lastName}
                  {course.duration ? ` · ${course.duration}` : ''}
                </p>
                <Button
                  size="lg"
                  className="mt-8 rounded-sm"
                  onClick={handlePrimaryAction}
                  disabled={isActionPending || (isAuthenticated && !isStudent)}
                >
                  {primaryActionLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="mt-3 text-sm text-[var(--text-muted)]">{actionHint}</p>
                {actionError && <p className="mt-2 text-sm text-[var(--danger)]">{actionError}</p>}
              </div>
              <div className="img-frame overflow-hidden rounded-sm">
                <Photo src={resolveCover(course.thumbnailUrl, course.id)} alt={course.title} className="aspect-[4/3]" />
              </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="mb-6 border border-[var(--border)] bg-[var(--bg-card)] p-6">
                    <h2 className="mb-4 text-2xl">สิ่งที่คุณจะได้รับ</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <p className="font-medium">เนื้อหาที่จัดเรียงชัดเจน</p>
                      </div>
                      <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <p className="font-medium">เรียนตามลำดับขั้นตอน</p>
                      </div>
                      <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <p className="font-medium">ติดตามความก้าวหน้าได้ง่าย</p>
                      </div>
                      <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <p className="font-medium">สนับสนุนจากครูผู้สอน</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-2xl">บทเรียนทั้งหมด</h2>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {totalLessons} บทเรียน
                      </span>
                    </div>
                    <div className="space-y-4">
                      {course.chapters?.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="border border-[var(--border)] p-5"
                        >
                          <h3 className="mb-3 text-lg">{chapter.title}</h3>
                          <div className="space-y-2">
                            {chapter.lessons?.map((lesson: any) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 border border-[var(--border)] bg-[var(--bg-card)] px-3 py-3 text-sm"
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
                  <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6">
                    <h3 className="mb-4 text-2xl">รายละเอียดคอร์ส</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
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
                        <div className="border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            <Tag className="h-4 w-4" />
                            {t('course.couponCode')}
                          </div>
                          {appliedCoupon ? (
                            <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm">
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
                      <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
                        <span className="text-slate-500">ระดับ</span>
                        <span className="font-medium">{course.level || 'ทั่วไป'}</span>
                      </div>
                      {course.duration && (
                        <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
                          <span className="text-slate-500">ระยะเวลา</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                      )}
                      {course.publishedAt && (
                        <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
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
    </PublicShell>
  )
}
