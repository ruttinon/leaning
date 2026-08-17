import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar, CheckCircle2, CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageIntro } from '@/components/PageIntro'
import { EmptyState } from '@/components/EmptyState'
import { api } from '@/lib/api'

interface Payment {
  id: string
  courseId: string
  amount: number
  currency: string
  paymentMethod?: string | null
  transactionId?: string | null
  status: string
  createdAt: string
  updatedAt: string
  course?: {
    title: string
    thumbnailUrl?: string | null
  } | null
}

interface PaymentLocationState {
  notice?: string
  highlightPaymentId?: string
}

export function StudentPaymentsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as PaymentLocationState

  const { data: payments, isLoading } = useQuery({
    queryKey: ['student-payments'],
    queryFn: async () => api.get<Payment[]>('/student/payments'),
    refetchInterval: 10000,
  })

  const getStatusBadge = (status: string) => {
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
            รอดำเนินการ
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
            ชำระเงินไม่สำเร็จ
          </Badge>
        )
      case 'REFUNDED':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">
            คืนเงินแล้ว
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency || 'THB',
    }).format(amount)
  }

  if (isLoading) {
    return <div className="py-12 text-center text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="บัญชี"
        title="ประวัติการชำระเงิน"
        description="ติดตามรายการที่ชำระแล้ว รายการค้าง และกลับมาชำระเงินต่อได้จากหน้านี้"
      />

      {state.notice && (
        <div className="border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm">
          {state.notice}
        </div>
      )}

      {!payments || payments.length === 0 ? (
        <EmptyState title="ยังไม่มีประวัติการชำระเงิน" description="เมื่อคุณซื้อคอร์ส รายการจะแสดงที่นี่" />
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const isHighlighted = state.highlightPaymentId === payment.id

            return (
              <Card
                key={payment.id}
                className={`transition-shadow hover:shadow-lg ${
                  isHighlighted ? 'border-blue-300 ring-2 ring-blue-100' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="border border-[var(--border)] p-3">
                        {payment.status === 'COMPLETED' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <CreditCard className="h-6 w-6 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {payment.course?.title || 'คอร์ส'}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(payment.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          {payment.paymentMethod && (
                            <span className="text-sm text-gray-500">{payment.paymentMethod}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      {getStatusBadge(payment.status)}
                      {payment.transactionId && (
                        <p className="text-xs text-gray-400">Ref: {payment.transactionId}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {payment.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/student/payments/${payment.id}/checkout`)}
                          >
                            ชำระเงินต่อ
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                        {payment.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/student/courses/${payment.courseId}`)}
                          >
                            เปิดคอร์ส
                          </Button>
                        )}
                        {payment.status === 'FAILED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/courses/${payment.courseId}`)}
                          >
                            กลับไปหน้าคอร์ส
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
