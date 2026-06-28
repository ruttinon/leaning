import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, CheckCircle2 } from 'lucide-react'
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

export function StudentPaymentsPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['student-payments'],
    queryFn: async () => api.get<Payment[]>('/student/payments'),
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
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ประวัติการชำระเงิน</h1>
        <p className="text-gray-600">ดูประวัติการชำระเงินของคุณ</p>
      </div>

      {!payments || payments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีประวัติการชำระเงิน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card
              key={payment.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      {payment.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {payment.course?.title || 'คอร์ส'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(payment.createdAt).toLocaleDateString(
                            'th-TH',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </span>
                        {payment.paymentMethod && (
                          <span className="text-sm text-gray-500">
                            {payment.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    {getStatusBadge(payment.status)}
                    {payment.transactionId && (
                      <p className="text-xs text-gray-400">
                        Ref: {payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
