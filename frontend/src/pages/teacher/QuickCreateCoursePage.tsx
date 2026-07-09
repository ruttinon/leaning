import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { uploadLessonMaterial } from '@/lib/storage'
import { Plus, Trash2, Sparkles, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'

interface LessonDraft {
  key: string
  title: string
  file: File | null
  quizQuestion: string
  optionA: string
  optionB: string
  correctAnswer: 'A' | 'B'
  homeworkTitle: string
}

const emptyLesson = (): LessonDraft => ({
  key: crypto.randomUUID(),
  title: '',
  file: null,
  quizQuestion: '',
  optionA: '',
  optionB: '',
  correctAnswer: 'A',
  homeworkTitle: '',
})

export function QuickCreateCoursePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [price, setPrice] = useState(0)
  const [lessons, setLessons] = useState<LessonDraft[]>([emptyLesson()])

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => api.get<Array<any>>('/public/subjects'),
  })

  const updateLesson = (key: string, patch: Partial<LessonDraft>) => {
    setLessons((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  const handleSubmit = async () => {
    setError('')
    setIsSubmitting(true)
    try {
      const course = await api.post<any>('/teacher/courses', {
        title,
        description: description || `คอร์ส ${title}`,
        subjectId,
        level: 'BEGINNER',
        price,
      })

      const chapter = await api.post<any>(`/teacher/courses/${course.id}/chapters`, {
        title: 'เนื้อหาหลัก',
        description: 'บทเรียนในคอร์สนี้',
        order: 1,
      })

      for (let i = 0; i < lessons.length; i++) {
        const draft = lessons[i]
        if (!draft.title.trim()) continue

        const lesson = await api.post<any>(`/teacher/chapters/${chapter.id}/lessons`, {
          title: draft.title.trim(),
          order: i + 1,
        })

        if (draft.file) {
          await uploadLessonMaterial({
            lessonId: lesson.id,
            title: draft.title.trim(),
            type: draft.file.type.startsWith('video/') ? 'video' : 'pdf',
            file: draft.file,
          })
        }

        if (draft.quizQuestion.trim() && draft.optionA.trim() && draft.optionB.trim()) {
          await api.post(`/teacher/lessons/${lesson.id}/quizzes`, {
            title: `แบบฝึกหัด: ${draft.title.trim()}`,
            type: 'QUIZ',
            questions: [{
              question: draft.quizQuestion.trim(),
              type: 'MULTIPLE_CHOICE',
              points: 1,
              options: [draft.optionA.trim(), draft.optionB.trim()],
              correctAnswer: draft.correctAnswer === 'A' ? draft.optionA.trim() : draft.optionB.trim(),
            }],
          })
        }

        if (draft.homeworkTitle.trim()) {
          await api.post(`/teacher/lessons/${lesson.id}/assignments`, {
            title: draft.homeworkTitle.trim(),
            maxPoints: 10,
          })
        }
      }

      navigate(`/teacher/courses/${course.id}`)
    } catch (err: any) {
      setError(err?.message || 'สร้างคอร์สไม่สำเร็จ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canGoStep2 = title.trim() && subjectId
  const canSubmit = lessons.some((l) => l.title.trim())

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
        <div className="mb-2 flex items-center gap-2 text-indigo-700">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">สร้างคอร์สแบบง่าย</span>
        </div>
        <p className="text-sm text-slate-600">
          ทำครบในหน้าเดียว — ไม่ต้องแยกสร้างบท → หัวข้อ → เอกสาร → ข้อสอบทีละหน้า
        </p>
        <div className="mt-4 flex gap-2 text-sm">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`rounded-full px-3 py-1 ${step === n ? 'bg-indigo-600 text-white' : step > n ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500'}`}
            >
              {n}. {n === 1 ? 'ข้อมูลคอร์ส' : n === 2 ? 'บทเรียน' : 'ยืนยัน'}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>ขั้นที่ 1 — ข้อมูลคอร์ส</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>ชื่อคอร์ส *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น คณิตศาสตร์ ป.1 นับเลข 1-10" />
            </div>
            <div>
              <Label>วิชา *</Label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">เลือกวิชา</option>
                {subjects?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>ราคา (บาท)</Label>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label>คำอธิบาย (ไม่บังคับ)</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="อธิบายสั้นๆ ว่าคอร์สนี้สอนอะไร" />
            </div>
            <Button onClick={() => setStep(2)} disabled={!canGoStep2}>
              ถัดไป <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ขั้นที่ 2 — เพิ่มบทเรียน</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setLessons([...lessons, emptyLesson()])}>
              <Plus className="mr-1 h-4 w-4" />เพิ่มบทเรียน
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">กรอกเฉพาะชื่อบทเรียนก็พอ ส่วนไฟล์/แบบฝึกหัด/การบ้านเป็น optional</p>

            {lessons.map((lesson, index) => (
              <div key={lesson.key} className="space-y-3 rounded-xl border bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">บทเรียนที่ {index + 1}</span>
                  {lessons.length > 1 && (
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setLessons(lessons.filter((l) => l.key !== lesson.key))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label>ชื่อบทเรียน *</Label>
                  <Input
                    value={lesson.title}
                    onChange={(e) => updateLesson(lesson.key, { title: e.target.value })}
                    placeholder="เช่น บทที่ 1 การนับเลข"
                  />
                </div>
                <div>
                  <Label>แนบไฟล์/วิดีโอ (ไม่บังคับ)</Label>
                  <Input type="file" accept=".pdf,.mp4,.jpg,.jpeg,.png" onChange={(e) => updateLesson(lesson.key, { file: e.target.files?.[0] || null })} />
                </div>
                <details className="rounded-lg border bg-white p-3">
                  <summary className="cursor-pointer text-sm font-medium text-indigo-600">+ เพิ่มแบบฝึกหัดง่ายๆ (ไม่บังคับ)</summary>
                  <div className="mt-3 space-y-2">
                    <Input
                      value={lesson.quizQuestion}
                      onChange={(e) => updateLesson(lesson.key, { quizQuestion: e.target.value })}
                      placeholder="คำถาม เช่น 2 + 3 = ?"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={lesson.optionA} onChange={(e) => updateLesson(lesson.key, { optionA: e.target.value })} placeholder="ตัวเลือก A" />
                      <Input value={lesson.optionB} onChange={(e) => updateLesson(lesson.key, { optionB: e.target.value })} placeholder="ตัวเลือก B" />
                    </div>
                    <select
                      value={lesson.correctAnswer}
                      onChange={(e) => updateLesson(lesson.key, { correctAnswer: e.target.value as 'A' | 'B' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="A">เฉลย: ตัวเลือก A</option>
                      <option value="B">เฉลย: ตัวเลือก B</option>
                    </select>
                  </div>
                </details>
                <div>
                  <Label>การบ้าน (ไม่บังคับ)</Label>
                  <Input
                    value={lesson.homeworkTitle}
                    onChange={(e) => updateLesson(lesson.key, { homeworkTitle: e.target.value })}
                    placeholder="เช่น ฝึกเขียนเลข 1-10"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />ย้อนกลับ
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canSubmit}>
                ถัดไป <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>ขั้นที่ 3 — ยืนยันและสร้าง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-4 text-sm space-y-1">
              <p><strong>คอร์ส:</strong> {title}</p>
              <p><strong>วิชา:</strong> {subjects?.find((s: any) => s.id === subjectId)?.name}</p>
              <p><strong>ราคา:</strong> {price === 0 ? 'ฟรี' : `${price} บาท`}</p>
              <p><strong>บทเรียน:</strong> {lessons.filter((l) => l.title.trim()).length} บท</p>
            </div>
            <ul className="space-y-2 text-sm">
              {lessons.filter((l) => l.title.trim()).map((l, i) => (
                <li key={l.key} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>
                    {i + 1}. {l.title}
                    {l.file && ' · มีไฟล์'}
                    {l.quizQuestion && ' · มีแบบฝึกหัด'}
                    {l.homeworkTitle && ' · มีการบ้าน'}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" />ย้อนกลับ
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'กำลังสร้าง...' : 'สร้างคอร์สเลย'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
