import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PdfReader } from '@/components/PdfReader'

export function StudentMaterialPage() {
  const { materialId } = useParams<{ materialId: string }>()
  const navigate = useNavigate()

  // In a real app, we would fetch material details here
  // For now, let's use dummy data
  const material = {
    id: materialId,
    title: 'เอกสารตัวอย่าง',
    type: 'pdf',
    fileUrl: '/uploads/sample.pdf',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>← กลับ</Button>
        <h1 className="text-2xl font-bold">{material.title}</h1>
      </div>

      {material.type === 'pdf' ? (
        <Card>
          <CardContent className="pt-6">
            <PdfReader url={material.fileUrl} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">ประเภทไฟล์ไม่รองรับการแสดงผลในเบราว์เซอร์</p>
            <Link to={material.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button className="mt-4">ดาวน์โหลดไฟล์</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
