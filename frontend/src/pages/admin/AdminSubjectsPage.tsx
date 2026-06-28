import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'

interface Subject {
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
  color?: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function AdminSubjectsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    order: '0',
    isActive: true,
  })
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    order: '0',
    isActive: true,
  })
  const queryClient = useQueryClient()

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['admin-subjects'],
    queryFn: async () => api.get<Subject[]>('/admin/subjects'),
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => api.post('/admin/subjects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subjects'] })
      setIsAddOpen(false)
      setAddForm({
        name: '',
        description: '',
        color: '#3b82f6',
        order: '0',
        isActive: true,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      api.put(`/admin/subjects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subjects'] })
      setEditingSubject(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subjects'] })
    },
  })

  const handleAdd = () => {
    createMutation.mutate({
      ...addForm,
      order: Number(addForm.order),
    })
  }

  const handleEdit = () => {
    if (!editingSubject) return
    updateMutation.mutate({
      id: editingSubject.id,
      data: {
        ...editForm,
        order: Number(editForm.order),
      },
    })
  }

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject)
    setEditForm({
      name: subject.name,
      description: subject.description || '',
      color: subject.color || '#3b82f6',
      order: String(subject.order),
      isActive: subject.isActive,
    })
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการวิชา</h1>
          <p className="text-gray-600">จัดการวิชาในระบบ</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มวิชาใหม่
        </Button>
      </div>

      {!subjects || subjects.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีวิชาในระบบ</p>
            <Button onClick={() => setIsAddOpen(true)}>
              เพิ่มวิชาแรกของคุณ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <div
                className="h-40 flex items-center justify-center"
                style={{ backgroundColor: subject.color || '#3b82f6' }}
              >
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">{subject.name}</h3>
                {subject.description && (
                  <p className="text-gray-500 text-sm mb-4">{subject.description}</p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      subject.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {subject.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                  <span className="text-xs text-gray-400">
                    ลำดับ: {subject.order}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(subject)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate(subject.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              สร้างวิชาใหม่สำหรับจัดหมวดหมู่คอร์ส
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">ชื่อวิชา</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="คณิตศาสตร์"
              />
            </div>
            <div>
              <Label htmlFor="add-description">คำอธิบาย (ไม่จำเป็น)</Label>
              <Textarea
                id="add-description"
                value={addForm.description}
                onChange={(e) =>
                  setAddForm({ ...addForm, description: e.target.value })
                }
                placeholder="รายละเอียดเกี่ยวกับวิชานี้"
              />
            </div>
            <div>
              <Label htmlFor="add-color">สีของวิชา</Label>
              <Input
                id="add-color"
                type="color"
                value={addForm.color}
                onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                className="h-12 p-1"
              />
            </div>
            <div>
              <Label htmlFor="add-order">ลำดับการแสดง</Label>
              <Input
                id="add-order"
                type="number"
                min="0"
                value={addForm.order}
                onChange={(e) => setAddForm({ ...addForm, order: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'กำลังเพิ่ม...' : 'เพิ่มวิชา'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingSubject}
        onOpenChange={(open) => !open && setEditingSubject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขวิชา</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลของวิชา {editingSubject?.name}
            </DialogDescription>
          </DialogHeader>
          {editingSubject && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">ชื่อวิชา</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">คำอธิบาย (ไม่จำเป็น)</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-color">สีของวิชา</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={editForm.color}
                  onChange={(e) =>
                    setEditForm({ ...editForm, color: e.target.value })
                  }
                  className="h-12 p-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-order">ลำดับการแสดง</Label>
                <Input
                  id="edit-order"
                  type="number"
                  min="0"
                  value={editForm.order}
                  onChange={(e) =>
                    setEditForm({ ...editForm, order: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingSubject(null)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
