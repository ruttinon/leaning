import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'

export function CreateCoursePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    level: 'BEGINNER',
    price: 0,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => api.get<Array<any>>('/public/subjects'),
  })

  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => api.post('/teacher/courses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] })
      setSuccessMessage('คอร์สถูกสร้างเรียบร้อยแล้ว คุณสามารถจัดการเนื้อหาและส่งเพื่ออนุมัติได้ทันที')
      setTimeout(() => navigate('/teacher/courses'), 800)
    },
    onError: (err: any) => {
      setError(err?.message || 'เกิดข้อผิดพลาด')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)
    try {
      await createCourseMutation.mutateAsync({
        ...formData,
        price: parseFloat(formData.price.toString()),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← กลับ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สร้างคอร์สใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">ชื่อคอร์ส</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="subjectId">วิชา</Label>
              <select
                id="subjectId"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">เลือกวิชา</option>
                {subjects?.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="level">ระดับ</Label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="BEGINNER">Beginner (มือใหม่)</option>
                <option value="INTERMEDIATE">Intermediate (ปานกลาง)</option>
                <option value="ADVANCED">Advanced (ขั้นสูง)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="price">ราคา (บาท)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'กำลังสร้าง...' : 'สร้างคอร์ส'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                ยกเลิก
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
