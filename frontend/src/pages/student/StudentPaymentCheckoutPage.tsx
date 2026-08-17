import { type FormEvent, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { PageIntro } from '@/components/PageIntro'
import { isStripeClientConfigured, stripePromise } from '@/lib/stripe'
import { useTranslation } from '@/lib/i18n'

interface PaymentDetailResponse {
  clientSecret: string | null
  paymentIntentStatus?: string | null
  checkoutMode?: string
  payment: {
    id: string
    courseId: string
    amount: number
    currency: string
    paymentMethod?: string | null
    transactionId?: string | null
    status: string
    couponCode?: string | null
    createdAt: string
    updatedAt: string
    course?: {
      id?: string
      title?: string | null
    } | null
  }
  enrollment?: {
    courseId?: string
    course?: {
      id: string
    } | null
  } | null
}

interface CheckoutNoticeState {
  notice?: string
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
          ชำระเงินสำเร็จ
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
          รอชำระเงิน
        </Badge>
      )
    case 'FAILED':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
          ไม่สำเร็จ
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency || 'THB',
  }).format(amount)
}

function StripeCheckoutForm({
  paymentId,
  onSubmitted,
}: {
  paymentId: string
  onSubmitted: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const submitResult = await elements.submit()
    if (submitResult.error) {
      setMessage(submitResult.error.message || 'กรุณาตรวจสอบข้อมูลการชำระเงิน')
      setIsSubmitting(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/student/payments/${paymentId}/checkout`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setMessage(error.message || 'ไม่สามารถยืนยันการชำระเงินได้')
      setIsSubmitting(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      setMessage('ชำระเงินสำเร็จแล้ว กำลังยืนยันกับระบบ...')
    } else if (paymentIntent?.status === 'processing') {
      setMessage('ระบบกำลังประมวลผลการชำระเงิน...')
    } else if (paymentIntent?.status === 'requires_action') {
      setMessage('กำลังพาไปยังขั้นตอนยืนยันการชำระเงินเพิ่มเติม...')
    }

    onSubmitted()
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />
      {message && (
        <div className="rounded-2xl border border-blue-200 bg-emerald-50 px-4 py-3 text-sm text-blue-700">
          {message}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={!stripe || !elements || isSubmitting}>
        {isSubmitting ? 'กำลังยืนยันการชำระเงิน...' : 'ชำระเงินตอนนี้'}
      </Button>
    </form>
  )
}

export function StudentPaymentCheckoutPage() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const state = (location.state || {}) as CheckoutNoticeState

  const paymentQuery = useQuery({
    queryKey: ['student-payment', paymentId],
    queryFn: async () => {
      if (!paymentId) {
        throw new Error('Payment ID not found')
      }

      return api.get<PaymentDetailResponse>(`/student/payments/${paymentId}`)
    },
    enabled: !!paymentId,
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (paymentQuery.data?.payment.status === 'COMPLETED') {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
      queryClient.invalidateQueries({ queryKey: ['my-courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
    }
  }, [paymentQuery.data?.payment.status, queryClient])

  const payment = paymentQuery.data?.payment
  const courseId =
    payment?.courseId ||
    paymentQuery.data?.enrollment?.courseId ||
    paymentQuery.data?.enrollment?.course?.id

  const refreshPaymentState = () => {
    queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    queryClient.invalidateQueries({ queryKey: ['student-payment', paymentId] })
    paymentQuery.refetch()
  }

  if (paymentQuery.isLoading) {
    return <div className="py-12 text-center text-gray-600">กำลังโหลด...</div>
  }

  if (paymentQuery.error instanceof Error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {paymentQuery.error.message}
        </div>
        <Button variant="outline" onClick={() => navigate('/student/payments')}>
          กลับไปหน้าการชำระเงิน
        </Button>
      </div>
    )
  }

  if (!payment || !paymentQuery.data) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          ไม่พบข้อมูลการชำระเงิน
        </div>
        <Button variant="outline" onClick={() => navigate('/student/payments')}>
          กลับไปหน้าการชำระเงิน
        </Button>
      </div>
    )
  }

  const canRenderStripeCheckout =
    payment.status === 'PENDING' &&
    paymentQuery.data.checkoutMode === 'stripe' &&
    !!paymentQuery.data.clientSecret &&
    isStripeClientConfigured

  const paymentIntentStatus = paymentQuery.data.paymentIntentStatus

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro
        kicker="ชำระเงิน"
        title={t('checkout.title')}
        description={t('checkout.subtitle')}
        actions={
          <Button variant="outline" className="rounded-sm" onClick={() => navigate('/student/payments')}>
            {t('checkout.backToPayments')}
          </Button>
        }
      />

      {state.notice && (
        <div className="rounded-2xl border border-blue-200 bg-emerald-50 px-4 py-3 text-sm text-blue-700">
          {state.notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">รายละเอียดการชำระเงิน</CardTitle>
            <CardDescription>
              รายการนี้จะผูกกับคอร์สของคุณ และสามารถกลับมาทำรายการต่อจากหน้าเดียวกันได้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">คอร์ส</p>
                  <h2 className="text-lg font-semibold">{payment.course?.title || 'คอร์ส'}</h2>
                </div>
                {getStatusBadge(payment.status)}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-sm text-slate-500">{t('checkout.amount')}</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>
                {payment.couponCode && (
                  <div className="rounded-xl bg-white px-4 py-3">
                    <p className="text-sm text-slate-500">{t('checkout.coupon')}</p>
                    <p className="font-medium">{payment.couponCode}</p>
                  </div>
                )}
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-sm text-slate-500">วิธีชำระ</p>
                  <p className="font-medium">{payment.paymentMethod || '-'}</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-sm text-slate-500">หมายเลขอ้างอิง</p>
                  <p className="font-medium">{payment.transactionId || '-'}</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-sm text-slate-500">สถานะ Stripe</p>
                  <p className="font-medium">{paymentIntentStatus || '-'}</p>
                </div>
              </div>
            </div>

            {payment.status === 'COMPLETED' && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-green-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">ระบบยืนยันการชำระเงินแล้ว</p>
                    <p className="mt-1 text-sm">
                      คุณสามารถเปิดคอร์สและเริ่มเรียนได้ทันที
                    </p>
                  </div>
                </div>
              </div>
            )}

            {payment.status === 'PENDING' && (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-4 text-yellow-800">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">รายการนี้ยังไม่เสร็จสมบูรณ์</p>
                    <p className="mt-1 text-sm">
                      หลังชำระเงินสำเร็จ ระบบจะรอ webhook จาก Stripe เพื่อปลดล็อกคอร์สให้อัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>
            )}

            {payment.status === 'FAILED' && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">รายการนี้ไม่สามารถชำระเงินต่อได้</p>
                    <p className="mt-1 text-sm">
                      กลับไปหน้าคอร์สเพื่อสร้างรายการใหม่ หรือเลือกชำระเงินจากรายการค้างอื่นแทน
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={refreshPaymentState}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                รีเฟรชสถานะ
              </Button>
              {payment.status === 'COMPLETED' && courseId && (
                <Button onClick={() => navigate(`/student/courses/${courseId}`)}>
                  เปิดคอร์ส
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {payment.status === 'FAILED' && courseId && (
                <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
                  กลับไปหน้าคอร์ส
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              ดำเนินการชำระเงิน
            </CardTitle>
            <CardDescription>
              ระบบใช้ Stripe เพื่อรับชำระเงิน และจะเปิดเรียนหลังตรวจสอบรายการเรียบร้อย
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canRenderStripeCheckout ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: paymentQuery.data.clientSecret!,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#2563eb',
                      borderRadius: '14px',
                    },
                  },
                }}
              >
                <StripeCheckoutForm paymentId={payment.id} onSubmitted={refreshPaymentState} />
              </Elements>
            ) : payment.status === 'COMPLETED' ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                รายการนี้เสร็จสมบูรณ์แล้ว ไม่ต้องชำระเงินซ้ำ
              </div>
            ) : payment.status === 'FAILED' ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                รายการนี้ปิดการใช้งานแล้ว กรุณากลับไปสร้างรายการใหม่จากหน้าคอร์ส
              </div>
            ) : !isStripeClientConfigured ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                ยังไม่ได้ตั้งค่า `VITE_STRIPE_PUBLISHABLE_KEY` สำหรับ frontend จึงไม่สามารถแสดงฟอร์มชำระเงินจริงได้
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                ฟอร์มชำระเงินยังไม่พร้อมสำหรับรายการนี้ ลองรีเฟรชสถานะอีกครั้ง หรือกลับไปหน้าประวัติการชำระเงิน
              </div>
            )}

            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
                <p>
                  ถ้ามีการยืนยันเพิ่มเติมจากธนาคารหรือบัตร ระบบจะพาคุณกลับมาหน้านี้และอัปเดตสถานะให้เอง
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
