import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { PaginationControls } from '@/components/PaginationControls'
import { PageIntro } from '@/components/PageIntro'
import { useTranslation } from '@/lib/i18n'

export function AdminContactsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-contacts', page],
    queryFn: () => api.get<any>(`/admin/contacts?page=${page}&limit=20`),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro kicker="ข้อความ" title={t('adminDashboard.contacts')} description="ข้อความจากฟอร์มติดต่อบนเว็บไซต์" />

      {!data?.data?.length ? (
        <EmptyState icon={Mail} title="ยังไม่มีข้อความติดต่อ" />
      ) : (
        <div className="space-y-4">
          {data.data.map((item: any) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{item.subject}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {item.name} · {item.email}
                  </p>
                </div>
                <Badge variant="outline">{item.status}</Badge>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-gray-700">{item.message}</p>
                <p className="mt-3 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString('th-TH')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaginationControls meta={data?.meta} page={page} onPageChange={setPage} />
    </div>
  )
}
