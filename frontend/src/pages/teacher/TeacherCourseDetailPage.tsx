import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, BookOpen, Award } from 'lucide-react'
import { api } from '@/lib/api'

export function TeacherCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // States for adding chapter
  const [showAddChapter, setShowAddChapter] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterDescription, setChapterDescription] = useState('')
  
  // States for adding lesson
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')

  const { data: course, isLoading } = useQuery({
    queryKey: ['teacher-course', courseId],
    queryFn: async () => api.get<any>(`/teacher/courses/${courseId}`),
  })

  const createChapterMutation = useMutation({
    mutationFn: async () => api.post(`/teacher/courses/${courseId}/chapters`, {
      title: chapterTitle,
      description: chapterDescription,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', courseId] })
      setShowAddChapter(false)
      setChapterTitle('')
      setChapterDescription('')
    },
  })

  const createLessonMutation = useMutation({
    mutationFn: async () => api.post(`/teacher/chapters/${selectedChapterId}/lessons`, {
      title: lessonTitle,
      description: lessonDescription,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', courseId] })
      setShowAddLesson(false)
      setSelectedChapterId(null)
      setLessonTitle('')
      setLessonDescription('')
    },
  })

  if (isLoading) return <div className="text-center py-12">กำลังโหลด...</div>
  if (!course) return <div className="text-center py-12">ไม่พบคอร์ส</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => navigate(-1)}>← กลับ</Button>
          <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/teacher/gradebook/${courseId}`}>
            <Button variant="outline"><Award className="h-4 w-4 mr-2" />ดูสมุดคะแนน</Button>
          </Link>
          <Button onClick={() => setShowAddChapter(true)}><Plus className="h-4 w-4 mr-2" />เพิ่มบทเรียน</Button>
        </div>
      </div>

      {/* Add Chapter Modal */}
      {showAddChapter && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มบทเรียน</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); createChapterMutation.mutateAsync() }} className="space-y-4">
              <div>
                <Label>ชื่อบท</Label>
                <Input value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} required />
              </div>
              <div>
                <Label>คำอธิบาย</Label>
                <Textarea value={chapterDescription} onChange={(e) => setChapterDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createChapterMutation.isPending}>บันทึก</Button>
                <Button variant="outline" onClick={() => setShowAddChapter(false)}>ยกเลิก</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Chapters List */}
      {course.chapters?.map((chapter: any) => (
        <Card key={chapter.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{chapter.title}</CardTitle>
            <Button size="sm" onClick={() => { setSelectedChapterId(chapter.id); setShowAddLesson(true) }}>
              <Plus className="h-4 w-4 mr-2" />เพิ่มหัวข้อเรียน
            </Button>
          </CardHeader>
          <CardContent>
            {chapter.description && <p className="text-gray-600 mb-4">{chapter.description}</p>}
            
            {/* Lessons List */}
            <div className="space-y-2">
              {chapter.lessons?.map((lesson: any) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                    <span>{lesson.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/lessons/${lesson.id}`)}>จัดการเนื้อหา</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Lesson Modal */}
            {showAddLesson && selectedChapterId === chapter.id && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>เพิ่มหัวข้อเรียน</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); createLessonMutation.mutateAsync() }} className="space-y-4">
                    <div>
                      <Label>ชื่อหัวข้อเรียน</Label>
                      <Input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} required />
                    </div>
                    <div>
                      <Label>คำอธิบาย</Label>
                      <Textarea value={lessonDescription} onChange={(e) => setLessonDescription(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={createLessonMutation.isPending}>บันทึก</Button>
                      <Button variant="outline" onClick={() => { setShowAddLesson(false); setSelectedChapterId(null) }}>ยกเลิก</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
