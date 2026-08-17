import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { File, Calendar, FileText, Image, Video, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { confirm } from '@/store/confirm-store'
import { toast } from '@/store/toast-store'
import { isApiError } from '@/lib/api-error'
import { useTranslation } from '@/lib/i18n'
import { resolveFileUrl } from '@/lib/storage'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { TeacherLessonContext, getLessonId } from '@/components/teacher/TeacherLessonContext'
import { TeacherResourceActions } from '@/components/teacher/TeacherResourceActions'
import { PageIntro } from '@/components/PageIntro'

interface Material {
  id: string
  lessonId: string
  title: string
  description?: string | null
  type: string
  fileUrl: string
  lesson?: any
  createdAt: string
}

export function TeacherMaterialsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'pdf',
  })

  const { data: materials, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-materials'],
    queryFn: () => api.get<Material[]>('/teacher/materials'),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/teacher/materials/${editing!.id}`, {
        title: form.title,
        description: form.description || null,
        type: form.type,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-materials'] })
      setOpen(false)
      setEditing(null)
      toast.success(t('teacherDashboard.saved'))
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : t('teacherDashboard.saveFailed'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/teacher/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-materials'] })
      toast.success(t('teacherDashboard.deleted'))
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : t('teacherDashboard.deleteFailed'))
    },
  })

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />
      case 'video':
        return <Video className="h-8 w-8 text-amber-700" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const openMaterial = async (fileUrl: string) => {
    const url = await resolveFileUrl(fileUrl)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openEdit = (material: Material) => {
    setEditing(material)
    setForm({
      title: material.title,
      description: material.description || '',
      type: material.type,
    })
    setOpen(true)
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="สตูดิโอ"
        title={t('teacherDashboard.allMaterials')}
        description={t('teacherDashboard.allMaterialsDesc')}
        actions={
          <Link to="/teacher/courses">
            <Button className="rounded-sm">
              <Plus className="mr-2 h-4 w-4" />
              อัปโหลดในคอร์ส
            </Button>
          </Link>
        }
      />

      {!materials?.length ? (
        <EmptyState
          icon={File}
          title="ยังไม่มีวัสดุการสอน"
          description="อัปโหลดไฟล์ได้จากหน้าจัดการบทเรียนในคอร์ส"
          actionLabel="ไปที่คอร์ส"
          onAction={() => { window.location.assign('/teacher/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <TeacherLessonContext item={material} />
                <div className="flex items-center gap-4">
                  {getTypeIcon(material.type)}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    {material.description && (
                      <p className="line-clamp-2 text-sm text-gray-500">{material.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(material.createdAt).toLocaleDateString('th-TH')}
                </p>
                <button
                  type="button"
                  onClick={() => openMaterial(material.fileUrl)}
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  เปิดไฟล์
                </button>
                <TeacherResourceActions
                  lessonId={getLessonId(material)}
                  onEdit={() => openEdit(material)}
                  onDelete={() => {
                    confirm({
                      title: 'ลบวัสดุ',
                      description: `ลบ "${material.title}" ถาวร?`,
                      variant: 'danger',
                      confirmLabel: 'ลบ',
                      onConfirm: () => deleteMutation.mutate(material.id),
                    })
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขวัสดุ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อ</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>ประเภท</Label>
              <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
              <Button disabled={!form.title || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
