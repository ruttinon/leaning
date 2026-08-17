import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { PageIntro } from '@/components/PageIntro'
import { useTranslation } from '@/lib/i18n'

export function StudentLiveClassesPage() {
  const { t } = useTranslation()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['student-live-classes'],
    queryFn: () => api.get<any[]>('/student/live-classes'),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro kicker="สด" title={t('liveClasses.title')} description={t('liveClasses.studentSubtitle')} />

      {!data?.length ? (
        <EmptyState icon={Video} title={t('liveClasses.empty')} description={t('liveClasses.studentEmpty')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((item: any) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.course?.title}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  ครู: {item.teacher?.user?.firstName} {item.teacher?.user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(item.scheduledAt).toLocaleString('th-TH')} · {item.durationMinutes} นาที
                </p>
                <a href={item.meetingUrl} target="_blank" rel="noreferrer">
                  <Button type="button">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('liveClasses.join')}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
