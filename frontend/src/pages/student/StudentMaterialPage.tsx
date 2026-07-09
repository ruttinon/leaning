import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PdfReader } from '@/components/PdfReader'
import { api } from '@/lib/api'
import { resolveStudentFileUrl } from '@/lib/storage'

interface Material {
  id: string
  title: string
  description?: string | null
  type: string
  fileUrl: string
}

export function StudentMaterialPage() {
  const { materialId } = useParams<{ materialId: string }>()

  const { data: material, isLoading, error } = useQuery({
    queryKey: ['student-material', materialId],
    queryFn: async () => {
      if (!materialId) {
        throw new Error('Material ID not found')
      }

      return api.get<Material>(`/student/materials/${materialId}`)
    },
    enabled: !!materialId,
  })

  const { data: resolvedUrl } = useQuery({
    queryKey: ['student-material-url', material?.id, material?.fileUrl],
    queryFn: async () => resolveStudentFileUrl(material?.fileUrl),
    enabled: !!material?.fileUrl,
  })

  if (isLoading) {
    return <div className="py-12 text-center text-gray-600">กำลังโหลด...</div>
  }

  if (error instanceof Error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {error.message}
      </div>
    )
  }

  if (!material) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        ไม่พบข้อมูลเอกสาร
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{material.title}</h1>
        {material.description && <p className="text-gray-600">{material.description}</p>}
      </div>

      {material.type === 'pdf' && resolvedUrl ? (
        <Card>
          <CardContent className="pt-6">
            <PdfReader url={resolvedUrl} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">ไฟล์ประเภทนี้จะแสดงผลโดยเปิดในแท็บใหม่</p>
            {resolvedUrl && (
              <Link to={resolvedUrl} target="_blank" rel="noopener noreferrer">
                <Button className="mt-4">เปิดไฟล์</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
