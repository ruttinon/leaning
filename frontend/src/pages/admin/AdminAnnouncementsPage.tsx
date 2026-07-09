import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Bell, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminAnnouncementsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [addForm, setAddForm] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    isActive: true,
  });
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    isActive: true,
  });
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => api.get<Announcement[]>('/admin/announcements'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => api.post('/admin/announcements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setIsAddOpen(false);
      setAddForm({
        title: '',
        content: '',
        type: 'GENERAL',
        isActive: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      api.put(`/admin/announcements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setEditingAnnouncement(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
  });

  const handleAdd = () => {
    createMutation.mutate(addForm);
  };

  const handleEdit = () => {
    if (!editingAnnouncement) return;
    updateMutation.mutate({
      id: editingAnnouncement.id,
      data: editForm,
    });
  };

  const handleEditClick = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isActive: announcement.isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการประกาศ</h1>
          <p className="text-gray-600">สร้างและจัดการประกาศให้ผู้ใช้ทุกคน</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มประกาศใหม่
        </Button>
      </div>

      {!announcements || announcements.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีประกาศ</p>
            <Button onClick={() => setIsAddOpen(true)}>
              เพิ่มประกาศแรกของคุณ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      announcement.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {announcement.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {announcement.content}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(announcement.createdAt).toLocaleDateString('th-TH')}
                  </span>
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-blue-700 rounded-full">
                    {announcement.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(announcement)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate(announcement.id)}
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
            <DialogTitle>เพิ่มประกาศใหม่</DialogTitle>
            <DialogDescription>
              สร้างประกาศที่จะแสดงให้ผู้ใช้ทุกคนเห็น
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-title">หัวข้อประกาศ</Label>
              <Input
                id="add-title"
                value={addForm.title}
                onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                placeholder="หัวข้อประกาศ"
              />
            </div>
            <div>
              <Label htmlFor="add-content">เนื้อหา</Label>
              <Textarea
                id="add-content"
                value={addForm.content}
                onChange={(e) => setAddForm({ ...addForm, content: e.target.value })}
                placeholder="เนื้อหาในประกาศ"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="add-type">ประเภท</Label>
              <select
                id="add-type"
                value={addForm.type}
                onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="GENERAL">ทั่วไป</option>
                <option value="IMPORTANT">สำคัญ</option>
                <option value="MAINTENANCE">บำรุงรักษา</option>
                <option value="PROMOTION">โปรโมชั่น</option>
              </select>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'กำลังเพิ่ม...' : 'เพิ่มประกาศ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingAnnouncement} onOpenChange={(open) => !open && setEditingAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขประกาศ</DialogTitle>
            <DialogDescription>
              แก้ไขประกาศ {editingAnnouncement?.title}
            </DialogDescription>
          </DialogHeader>
          {editingAnnouncement && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">หัวข้อประกาศ</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">เนื้อหา</Label>
                <Textarea
                  id="edit-content"
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">ประเภท</Label>
                <select
                  id="edit-type"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="GENERAL">ทั่วไป</option>
                  <option value="IMPORTANT">สำคัญ</option>
                  <option value="MAINTENANCE">บำรุงรักษา</option>
                  <option value="PROMOTION">โปรโมชั่น</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                />
                <Label htmlFor="edit-is-active">เปิดใช้งานประกาศ</Label>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
