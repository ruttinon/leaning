import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Video, Plus, ExternalLink, Trash2, Pencil } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { PageIntro } from '@/components/PageIntro'
import { useTranslation } from '@/lib/i18n'

export function TeacherLiveClassesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    courseId: '',
    title: '',
    description: '',
    meetingUrl: '',
    meetingProvider: 'ZOOM',
    scheduledAt: '',
    durationMinutes: 60,
  })

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => api.get<any[]>('/teacher/courses'),
  })

  const { data: liveClasses, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-live-classes'],
    queryFn: () => api.get<any[]>('/teacher/live-classes'),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        return api.put(`/teacher/live-classes/${editingId}`, form)
      }
      return api.post('/teacher/live-classes', form)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-live-classes'] })
      setOpen(false)
      setEditingId(null)
      setForm({
        courseId: '',
        title: '',
        description: '',
        meetingUrl: '',
        meetingProvider: 'ZOOM',
        scheduledAt: '',
        durationMinutes: 60,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/teacher/live-classes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-live-classes'] }),
  })

  const openEdit = (item: any) => {
    setEditingId(item.id)
    setForm({
      courseId: item.courseId,
      title: item.title,
      description: item.description || '',
      meetingUrl: item.meetingUrl,
      meetingProvider: item.meetingProvider,
      scheduledAt: item.scheduledAt?.slice(0, 16),
      durationMinutes: item.durationMinutes,
    })
    setOpen(true)
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="สด"
        title={t('liveClasses.title')}
        description={t('liveClasses.teacherSubtitle')}
        actions={
          <Button className="rounded-sm" onClick={() => { setEditingId(null); setOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            {t('liveClasses.create')}
          </Button>
        }
      />

      {!liveClasses?.length ? (
        <EmptyState icon={Video} title={t('liveClasses.empty')} description={t('liveClasses.emptyDesc')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {liveClasses.map((item: any) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.course?.title}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                  {item.status}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {new Date(item.scheduledAt).toLocaleString('th-TH')} · {item.durationMinutes} นาที
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href={item.meetingUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" type="button">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      {t('liveClasses.join')}
                    </Button>
                  </a>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t('liveClasses.edit') : t('liveClasses.create')}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
          >
            <div>
              <Label>{t('common.courses')}</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                required
                disabled={!!editingId}
              >
                <option value="">เลือกคอร์ส</option>
                {courses?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>หัวข้อ</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label>รายละเอียด</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>ลิงก์ห้องเรียน (Zoom / Google Meet)</Label>
              <Input type="url" value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} required />
            </div>
            <div>
              <Label>วันเวลาเริ่ม</Label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
