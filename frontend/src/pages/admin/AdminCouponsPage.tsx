import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Ticket } from 'lucide-react'
import { api } from '@/lib/api'
import { confirm } from '@/store/confirm-store'
import { toast } from '@/store/toast-store'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'

interface Coupon {
  id: string
  code: string
  discount: number
  maxUses?: number | null
  usedCount: number
  expiresAt?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function AdminCouponsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [addForm, setAddForm] = useState({
    code: '',
    discount: '',
    maxUses: '',
    expiresAt: '',
  })
  const [editForm, setEditForm] = useState({
    code: '',
    discount: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
  })
  const queryClient = useQueryClient()

  const { data: coupons, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => api.get<Coupon[]>('/admin/coupons'),
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => api.post('/admin/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      setIsAddOpen(false)
      setAddForm({ code: '', discount: '', maxUses: '', expiresAt: '' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      api.put(`/admin/coupons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      setEditingCoupon(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('ลบคูปองแล้ว')
    },
  })

  const handleAdd = () => {
    createMutation.mutate({
      ...addForm,
      discount: Number(addForm.discount),
      maxUses: addForm.maxUses ? Number(addForm.maxUses) : null,
      expiresAt: addForm.expiresAt || null,
    })
  }

  const handleEdit = () => {
    if (!editingCoupon) return
    updateMutation.mutate({
      id: editingCoupon.id,
      data: {
        ...editForm,
        discount: Number(editForm.discount),
        maxUses: editForm.maxUses ? Number(editForm.maxUses) : null,
        expiresAt: editForm.expiresAt || null,
      },
    })
  }

  const handleEditClick = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setEditForm({
      code: coupon.code,
      discount: String(coupon.discount),
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
        : '',
      isActive: coupon.isActive,
    })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการคูปอง</h1>
          <p className="text-gray-600">จัดการคูปองส่วนลดในระบบ</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มคูปองใหม่
        </Button>
      </div>

      {!coupons || coupons.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีคูปองในระบบ</p>
            <Button onClick={() => setIsAddOpen(true)}>
              เพิ่มคูปองแรกของคุณ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-amber-800">
                    {coupon.code}
                  </CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      coupon.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {coupon.isActive ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                  </span>
                </div>
                <CardDescription>
                  ส่วนลด {coupon.discount}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  ใช้ไปแล้ว: {coupon.usedCount}
                  {coupon.maxUses !== null ? `/${coupon.maxUses}` : ''}
                </p>
                {coupon.expiresAt && (
                  <p className="text-sm text-gray-500">
                    หมดอายุ: {new Date(coupon.expiresAt).toLocaleDateString('th-TH')}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(coupon)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() =>
                      confirm({
                        title: 'ลบคูปอง',
                        description: `ลบคูปอง "${coupon.code}" ถาวร?`,
                        variant: 'danger',
                        confirmLabel: 'ลบ',
                        onConfirm: () => deleteMutation.mutate(coupon.id),
                      })
                    }
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
            <DialogTitle>เพิ่มคูปองใหม่</DialogTitle>
            <DialogDescription>
              สร้างคูปองส่วนลดใหม่สำหรับนักเรียน
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-code">โค้ดคูปอง</Label>
              <Input
                id="add-code"
                value={addForm.code}
                onChange={(e) =>
                  setAddForm({ ...addForm, code: e.target.value.toUpperCase() })
                }
                placeholder="SAVE50"
              />
            </div>
            <div>
              <Label htmlFor="add-discount">ส่วนลด (%)</Label>
              <Input
                id="add-discount"
                type="number"
                min="1"
                max="100"
                value={addForm.discount}
                onChange={(e) => setAddForm({ ...addForm, discount: e.target.value })}
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="add-max-uses">จำนวนครั้งสูงสุดที่ใช้ได้ (ไม่จำเป็น)</Label>
              <Input
                id="add-max-uses"
                type="number"
                min="1"
                value={addForm.maxUses}
                onChange={(e) => setAddForm({ ...addForm, maxUses: e.target.value })}
                placeholder="100"
              />
            </div>
            <div>
              <Label htmlFor="add-expires-at">วันหมดอายุ (ไม่จำเป็น)</Label>
              <Input
                id="add-expires-at"
                type="date"
                value={addForm.expiresAt}
                onChange={(e) =>
                  setAddForm({ ...addForm, expiresAt: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'กำลังเพิ่ม...' : 'เพิ่มคูปอง'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCoupon} onOpenChange={(open) => !open && setEditingCoupon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขคูปอง</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลของคูปอง {editingCoupon?.code}
            </DialogDescription>
          </DialogHeader>
          {editingCoupon && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-code">โค้ดคูปอง</Label>
                <Input
                  id="edit-code"
                  value={editForm.code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, code: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-discount">ส่วนลด (%)</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.discount}
                  onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-max-uses">จำนวนครั้งสูงสุดที่ใช้ได้ (ไม่จำเป็น)</Label>
                <Input
                  id="edit-max-uses"
                  type="number"
                  min="1"
                  value={editForm.maxUses}
                  onChange={(e) => setEditForm({ ...editForm, maxUses: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-expires-at">วันหมดอายุ (ไม่จำเป็น)</Label>
                <Input
                  id="edit-expires-at"
                  type="date"
                  value={editForm.expiresAt}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expiresAt: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingCoupon(null)}>
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
