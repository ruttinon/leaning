import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

interface TeacherResourceActionsProps {
  lessonId?: string
  onEdit: () => void
  onDelete: () => void
  viewLabel?: string
}

export function TeacherResourceActions({
  lessonId,
  onEdit,
  onDelete,
  viewLabel = 'จัดการในบทเรียน',
}: TeacherResourceActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
      {lessonId && (
        <Link to={`/teacher/lessons/${lessonId}`}>
          <Button size="sm" variant="outline" type="button">
            <Eye className="mr-1 h-4 w-4" />
            {viewLabel}
          </Button>
        </Link>
      )}
      <Button size="sm" variant="outline" type="button" onClick={onEdit}>
        <Pencil className="mr-1 h-4 w-4" />
        แก้ไข
      </Button>
      <Button
        size="sm"
        variant="outline"
        type="button"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={onDelete}
      >
        <Trash2 className="mr-1 h-4 w-4" />
        ลบ
      </Button>
    </div>
  )
}
