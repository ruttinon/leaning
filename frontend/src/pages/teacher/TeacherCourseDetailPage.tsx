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
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { toast } from '@/store/toast-store'
import { isApiError } from '@/lib/api-error'
import { uploadCourseThumbnail } from '@/lib/storage'
import { PageIntro } from '@/components/PageIntro'

export function TeacherCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // States for adding chapter
  const [showAddChapter, setShowAddChapter] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterDescription, setChapterDescription] = useState('')
  const [quickLessonTitle, setQuickLessonTitle] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  
  // States for adding lesson
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)

  const { data: course, isLoading, isError, refetch } = useQuery({
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

  const submitForReviewMutation = useMutation({
    mutationFn: async () => api.post(`/teacher/courses/${courseId}/submit-review`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] })
      setStatusMessage('ส่งคอร์สเพื่ออนุมัติเรียบร้อยแล้ว')
    },
    onError: (err: any) => {
      setStatusMessage(err?.message || 'ส่งคอร์สไม่สำเร็จ')
    },
  })

  const quickAddLessonMutation = useMutation({
    mutationFn: async (lessonTitle: string) => {
      let chapterId = course?.chapters?.[0]?.id
      if (!chapterId) {
        const chapter = await api.post<any>(`/teacher/courses/${courseId}/chapters`, {
          title: 'เนื้อหาหลัก',
          description: 'บทเรียนในคอร์สนี้',
          order: 1,
        })
        chapterId = chapter.id
      }
      const order = (course?.chapters?.[0]?.lessons?.length || 0) + 1
      return api.post(`/teacher/chapters/${chapterId}/lessons`, {
        title: lessonTitle,
        order,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', courseId] })
      setQuickLessonTitle('')
      setStatusMessage('เพิ่มบทเรียนเรียบร้อยแล้ว')
    },
    onError: (err: any) => {
      setStatusMessage(err?.message || 'เพิ่มบทเรียนไม่สำเร็จ')
    },
  })

  const uploadThumbnailMutation = useMutation({
    mutationFn: async () => {
      if (!selectedThumbnail) {
        throw new Error('กรุณาเลือกไฟล์ภาพก่อนอัปโหลด')
      }
      return uploadCourseThumbnail(courseId!, selectedThumbnail)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] })
      setSelectedThumbnail(null)
      setStatusMessage('อัปโหลดภาพปกคอร์สสำเร็จแล้ว')
    },
    onError: (err: any) => {
      setStatusMessage(err?.message || 'อัปโหลดภาพปกคอร์สไม่สำเร็จ')
    },
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (!course) return <div className="text-center py-12">ไม่พบคอร์ส</div>

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="คอร์ส"
        title={course.title}
        description={course.description}
        actions={
        <div className="flex flex-wrap gap-2">
          <Link to={`/teacher/gradebook/${courseId}`}>
            <Button variant="outline"><Award className="h-4 w-4 mr-2" />ดูสมุดคะแนน</Button>
          </Link>
          <Button variant="secondary" onClick={() => submitForReviewMutation.mutate()} disabled={submitForReviewMutation.isPending || course.status === 'PENDING_REVIEW' || course.status === 'PUBLISHED'}>
            {submitForReviewMutation.isPending ? 'กำลังส่ง...' : 'ส่งให้ตรวจสอบ'}
          </Button>
          <Button className="rounded-sm" onClick={() => setShowAddChapter(true)}><Plus className="h-4 w-4 mr-2" />เพิ่มบท (ขั้นสูง)</Button>
        </div>
        }
      />

      {statusMessage && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${statusMessage.includes('สำเร็จ') || statusMessage.includes('เรียบร้อย') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {statusMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">เพิ่มบทเรียนด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-slate-600">พิมพ์ชื่อแล้วกดเพิ่มได้เลย ไม่ต้องสร้างบทแยก</p>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              if (quickLessonTitle.trim()) {
                quickAddLessonMutation.mutate(quickLessonTitle.trim())
              }
            }}
          >
            <Input
              value={quickLessonTitle}
              onChange={(e) => setQuickLessonTitle(e.target.value)}
              placeholder="เช่น บทที่ 1 การนับเลข 1-10"
              className="bg-white"
            />
            <Button type="submit" disabled={!quickLessonTitle.trim() || quickAddLessonMutation.isPending}>
              {quickAddLessonMutation.isPending ? 'กำลังเพิ่ม...' : 'เพิ่มบทเรียน'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ภาพปกคอร์ส</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-40 w-full rounded-sm object-cover"
              onError={(event) => {
                const target = event.currentTarget
                target.onerror = null
                target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
              }}
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-sm border border-dashed border-[var(--border)] bg-[var(--bg-tertiary)] text-sm text-[var(--text-muted)]">
              ยังไม่มีภาพปกคอร์ส
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input type="file" accept="image/*" onChange={(e) => setSelectedThumbnail(e.target.files?.[0] || null)} />
            <Button onClick={() => uploadThumbnailMutation.mutate()} disabled={!selectedThumbnail || uploadThumbnailMutation.isPending}>
              {uploadThumbnailMutation.isPending ? 'กำลังอัปโหลด...' : 'อัปโหลดภาพปก'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                    <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/lessons/${lesson.id}`)}>
                      เพิ่มเนื้อหา/ข้อสอบ
                    </Button>
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
