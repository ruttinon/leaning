import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, FileText, BookOpen, Video, ClipboardList, Eye, Pencil, Trash2, ExternalLink, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import { confirm } from '@/store/confirm-store'
import { resolveFileUrl, toAbsoluteFileUrl, uploadLessonMaterial } from '@/lib/storage'

export function TeacherLessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const queryClient = useQueryClient()

  const refreshLessonAndLists = () => {
    queryClient.invalidateQueries({ queryKey: ['teacher-lesson', lessonId] })
    queryClient.invalidateQueries({ queryKey: ['teacher-quizzes'] })
    queryClient.invalidateQueries({ queryKey: ['teacher-exams'] })
    queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] })
    queryClient.invalidateQueries({ queryKey: ['teacher-materials'] })
  }

  const [viewingMaterialId, setViewingMaterialId] = useState<string | null>(null)
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null)
  const [editMaterialTitle, setEditMaterialTitle] = useState('')
  const [editMaterialType, setEditMaterialType] = useState('pdf')

  const [viewingQuizId, setViewingQuizId] = useState<string | null>(null)
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [editQuizTitle, setEditQuizTitle] = useState('')
  const [editQuizType, setEditQuizType] = useState<'QUIZ' | 'EXAM'>('QUIZ')

  const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null)
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null)
  const [editAssignmentTitle, setEditAssignmentTitle] = useState('')
  const [editAssignmentDescription, setEditAssignmentDescription] = useState('')
  const [editAssignmentMaxPoints, setEditAssignmentMaxPoints] = useState<number | ''>(100)
  const [editAssignmentDueDate, setEditAssignmentDueDate] = useState('')

  // States for adding material
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialType, setMaterialType] = useState('pdf')
  const [materialFile, setMaterialFile] = useState<File | null>(null)
  const [materialUrl, setMaterialUrl] = useState('')

  // States for adding quiz
  const [showAddQuiz, setShowAddQuiz] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizType, setQuizType] = useState<'QUIZ' | 'EXAM'>('QUIZ')
  const [quizQuestions, setQuizQuestions] = useState([{
    type: 'MULTIPLE_CHOICE',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  }])
  const [quizTimeLimit, setQuizTimeLimit] = useState<number | ''>('')
  const [quizMaxAttempts, setQuizMaxAttempts] = useState<number | ''>('')
  const [quizStartDate, setQuizStartDate] = useState('')
  const [quizEndDate, setQuizEndDate] = useState('')

  // States for adding assignment
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  const [assignmentMaxPoints, setAssignmentMaxPoints] = useState<number | ''>(100)
  const [assignmentDueDate, setAssignmentDueDate] = useState('')

  const [quickMaterialTitle, setQuickMaterialTitle] = useState('')
  const [quickMaterialFile, setQuickMaterialFile] = useState<File | null>(null)
  const [quickQuizQuestion, setQuickQuizQuestion] = useState('')
  const [quickOptionA, setQuickOptionA] = useState('')
  const [quickOptionB, setQuickOptionB] = useState('')
  const [quickCorrect, setQuickCorrect] = useState<'A' | 'B'>('A')
  const [quickHomeworkTitle, setQuickHomeworkTitle] = useState('')
  const [quickMessage, setQuickMessage] = useState('')

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['teacher-lesson', lessonId],
    queryFn: async () => api.get<any>(`/teacher/lessons/${lessonId}`),
  })

  const quickMaterialMutation = useMutation({
    mutationFn: async () => {
      const ext = quickMaterialFile?.name.split('.').pop()?.toLowerCase()
      const type = ext === 'mp4' || ext === 'webm' ? 'video' : ext === 'pdf' ? 'pdf' : 'document'
      return uploadLessonMaterial({
        lessonId: lessonId!,
        title: quickMaterialTitle || quickMaterialFile?.name || 'เอกสาร',
        type,
        file: quickMaterialFile,
      })
    },
    onSuccess: () => {
      refreshLessonAndLists()
      setQuickMaterialTitle('')
      setQuickMaterialFile(null)
      setQuickMessage('อัปโหลดเอกสารเรียบร้อยแล้ว')
    },
    onError: (err: any) => setQuickMessage(err?.message || 'อัปโหลดไม่สำเร็จ'),
  })

  const quickQuizMutation = useMutation({
    mutationFn: async () => api.post(`/teacher/lessons/${lessonId}/quizzes`, {
      title: quickQuizQuestion.slice(0, 50) || 'แบบฝึกหัด',
      type: 'QUIZ',
      questions: [{
        type: 'MULTIPLE_CHOICE',
        question: quickQuizQuestion,
        options: [quickOptionA, quickOptionB],
        correctAnswer: quickCorrect === 'A' ? quickOptionA : quickOptionB,
      }],
    }),
    onSuccess: () => {
      refreshLessonAndLists()
      setQuickQuizQuestion('')
      setQuickOptionA('')
      setQuickOptionB('')
      setQuickMessage('สร้างแบบฝึกหัดเรียบร้อยแล้ว')
    },
    onError: (err: any) => setQuickMessage(err?.message || 'สร้างแบบฝึกหัดไม่สำเร็จ'),
  })

  const quickHomeworkMutation = useMutation({
    mutationFn: async () => api.post(`/teacher/lessons/${lessonId}/assignments`, {
      title: quickHomeworkTitle,
      description: 'แบบฝึกหัดส่งงาน',
      maxPoints: 10,
    }),
    onSuccess: () => {
      refreshLessonAndLists()
      setQuickHomeworkTitle('')
      setQuickMessage('สร้างการบ้านเรียบร้อยแล้ว')
    },
    onError: (err: any) => setQuickMessage(err?.message || 'สร้างการบ้านไม่สำเร็จ'),
  })

  const createMaterialMutation = useMutation({
    mutationFn: async () => uploadLessonMaterial({
      lessonId: lessonId!,
      title: materialTitle,
      type: materialType,
      file: materialFile,
      fileUrl: materialUrl || undefined,
    }),
    onSuccess: () => {
      refreshLessonAndLists()
      setShowAddMaterial(false)
      setMaterialTitle('')
      setMaterialType('pdf')
      setMaterialFile(null)
      setMaterialUrl('')
    },
  })

  const createQuizMutation = useMutation({
    mutationFn: async () => api.post(`/teacher/lessons/${lessonId}/quizzes`, {
      title: quizTitle,
      type: quizType,
      timeLimit: quizTimeLimit || null,
      maxAttempts: quizMaxAttempts || null,
      startDate: quizStartDate || null,
      endDate: quizEndDate || null,
      questions: quizQuestions
    }),
    onSuccess: () => {
      refreshLessonAndLists()
      setShowAddQuiz(false)
      setQuizTitle('')
      setQuizType('QUIZ')
      setQuizQuestions([{
        type: 'MULTIPLE_CHOICE',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      }])
      setQuizTimeLimit('')
      setQuizMaxAttempts('')
      setQuizStartDate('')
      setQuizEndDate('')
    },
  })

  const createAssignmentMutation = useMutation({
    mutationFn: async () => api.post(`/teacher/lessons/${lessonId}/assignments`, {
      title: assignmentTitle,
      description: assignmentDescription,
      maxPoints: assignmentMaxPoints,
      dueDate: assignmentDueDate || null
    }),
    onSuccess: () => {
      refreshLessonAndLists()
      setShowAddAssignment(false)
      setAssignmentTitle('')
      setAssignmentDescription('')
      setAssignmentMaxPoints(100)
      setAssignmentDueDate('')
    },
  })

  const updateMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => api.put(`/teacher/materials/${materialId}`, {
      title: editMaterialTitle,
      type: editMaterialType,
    }),
    onSuccess: () => {
      refreshLessonAndLists()
      setEditingMaterialId(null)
    },
  })

  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => api.delete(`/teacher/materials/${materialId}`),
    onSuccess: () => {
      refreshLessonAndLists()
      setViewingMaterialId(null)
    },
  })

  const updateQuizMutation = useMutation({
    mutationFn: async (quizId: string) => api.put(`/teacher/quizzes/${quizId}`, {
      title: editQuizTitle,
      type: editQuizType,
    }),
    onSuccess: () => {
      refreshLessonAndLists()
      setEditingQuizId(null)
    },
  })

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => api.delete(`/teacher/quizzes/${quizId}`),
    onSuccess: () => {
      refreshLessonAndLists()
      setViewingQuizId(null)
    },
  })

  const updateAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => api.put(`/teacher/assignments/${assignmentId}`, {
      title: editAssignmentTitle,
      description: editAssignmentDescription,
      maxPoints: editAssignmentMaxPoints,
      dueDate: editAssignmentDueDate || null,
    }),
    onSuccess: () => {
      refreshLessonAndLists()
      setEditingAssignmentId(null)
    },
  })

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => api.delete(`/teacher/assignments/${assignmentId}`),
    onSuccess: () => {
      refreshLessonAndLists()
      setViewingAssignmentId(null)
    },
  })

  const startEditMaterial = (material: any) => {
    setEditingMaterialId(material.id)
    setEditMaterialTitle(material.title)
    setEditMaterialType(material.type)
    setViewingMaterialId(null)
  }

  const startEditQuiz = (quiz: any) => {
    setEditingQuizId(quiz.id)
    setEditQuizTitle(quiz.title)
    setEditQuizType(quiz.type)
    setViewingQuizId(null)
  }

  const startEditAssignment = (assignment: any) => {
    setEditingAssignmentId(assignment.id)
    setEditAssignmentTitle(assignment.title)
    setEditAssignmentDescription(assignment.description || '')
    setEditAssignmentMaxPoints(assignment.maxPoints)
    setEditAssignmentDueDate(assignment.dueDate ? assignment.dueDate.slice(0, 16) : '')
    setViewingAssignmentId(null)
  }

  const getMaterialUrl = (fileUrl: string) => toAbsoluteFileUrl(fileUrl)

  const openMaterial = async (fileUrl: string) => {
    const url = await resolveFileUrl(fileUrl)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) return <div className="text-center py-12">กำลังโหลด...</div>
  if (!lesson) return <div className="text-center py-12">ไม่พบหัวข้อเรียน</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-gray-600">{lesson.description}</p>
      </div>

      {quickMessage && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${quickMessage.includes('เรียบร้อย') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {quickMessage}
        </div>
      )}

      <Card className="border-indigo-200 bg-emerald-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-emerald-700" />
            เพิ่มเนื้อหาแบบง่าย
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (quickMaterialFile) quickMaterialMutation.mutate()
            }}
          >
            <Label>อัปโหลดไฟล์ (PDF / วิดีโอ)</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={quickMaterialTitle}
                onChange={(e) => setQuickMaterialTitle(e.target.value)}
                placeholder="ชื่อเอกสาร (ไม่ใส่ก็ได้)"
                className="bg-white"
              />
              <Input
                type="file"
                accept=".pdf,.mp4,.webm,.doc,.docx"
                className="bg-white"
                onChange={(e) => setQuickMaterialFile(e.target.files?.[0] || null)}
              />
              <Button type="submit" disabled={!quickMaterialFile || quickMaterialMutation.isPending}>
                อัปโหลด
              </Button>
            </div>
          </form>

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (quickQuizQuestion && quickOptionA && quickOptionB) quickQuizMutation.mutate()
            }}
          >
            <Label>แบบฝึกหัดด่วน (1 ข้อ)</Label>
            <Input
              value={quickQuizQuestion}
              onChange={(e) => setQuickQuizQuestion(e.target.value)}
              placeholder="คำถาม เช่น 2 + 3 เท่ากับเท่าไหร่?"
              className="bg-white"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={quickOptionA} onChange={(e) => setQuickOptionA(e.target.value)} placeholder="ตัวเลือก A" className="bg-white" />
              <Input value={quickOptionB} onChange={(e) => setQuickOptionB(e.target.value)} placeholder="ตัวเลือก B" className="bg-white" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={quickCorrect}
                onChange={(e) => setQuickCorrect(e.target.value as 'A' | 'B')}
                className="h-10 rounded-md border bg-white px-3 text-sm"
              >
                <option value="A">คำตอบถูก: A</option>
                <option value="B">คำตอบถูก: B</option>
              </select>
              <Button
                type="submit"
                disabled={!quickQuizQuestion || !quickOptionA || !quickOptionB || quickQuizMutation.isPending}
              >
                สร้างแบบฝึกหัด
              </Button>
            </div>
          </form>

          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              if (quickHomeworkTitle.trim()) quickHomeworkMutation.mutate()
            }}
          >
            <Input
              value={quickHomeworkTitle}
              onChange={(e) => setQuickHomeworkTitle(e.target.value)}
              placeholder="ชื่อการบ้าน เช่น ฝึกทำแบบฝึกหัดหน้า 5"
              className="bg-white"
            />
            <Button type="submit" disabled={!quickHomeworkTitle.trim() || quickHomeworkMutation.isPending}>
              สร้างการบ้าน
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Materials Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>เอกสารและสื่อการสอน</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowAddMaterial(true)}>
            <Plus className="h-4 w-4 mr-2" />เพิ่มแบบละเอียด
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lesson.materials?.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">ยังไม่มีเอกสาร</p>
          )}
          {lesson.materials?.map((material: any) => (
            <div key={material.id} className="rounded-lg border bg-gray-50">
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  {material.type === 'pdf' && <FileText className="h-5 w-5 flex-shrink-0 text-red-500" />}
                  {material.type === 'video' && <Video className="h-5 w-5 flex-shrink-0 text-blue-500" />}
                  {!['pdf', 'video'].includes(material.type) && <FileText className="h-5 w-5 flex-shrink-0 text-gray-500" />}
                  <span className="truncate font-medium">{material.title}</span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingMaterialId(viewingMaterialId === material.id ? null : material.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />ดู
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEditMaterial(material)}>
                    <Pencil className="mr-1 h-4 w-4" />แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      confirm({
                        title: 'ลบวัสดุ',
                        description: `ลบ "${material.title}" ถาวร?`,
                        variant: 'danger',
                        confirmLabel: 'ลบ',
                        onConfirm: () => deleteMaterialMutation.mutate(material.id),
                      })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {viewingMaterialId === material.id && (
                <div className="space-y-2 border-t bg-white p-4 text-sm">
                  <p><span className="font-medium">ประเภท:</span> {material.type}</p>
                  {material.description && <p><span className="font-medium">รายละเอียด:</span> {material.description}</p>}
                  {material.fileUrl && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openMaterial(material.fileUrl)}
                      >
                        <ExternalLink className="mr-1 h-4 w-4" />เปิดไฟล์
                      </Button>
                      {material.type === 'video' && (
                        <video src={getMaterialUrl(material.fileUrl)} controls className="mt-2 w-full max-w-lg rounded-lg" />
                      )}
                      {material.type === 'pdf' && (
                        <iframe src={getMaterialUrl(material.fileUrl)} className="mt-2 h-64 w-full rounded-lg border" title={material.title} />
                      )}
                    </div>
                  )}
                </div>
              )}

              {editingMaterialId === material.id && (
                <div className="space-y-3 border-t bg-white p-4">
                  <div>
                    <Label>ชื่อเอกสาร</Label>
                    <Input value={editMaterialTitle} onChange={(e) => setEditMaterialTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>ประเภท</Label>
                    <select
                      value={editMaterialType}
                      onChange={(e) => setEditMaterialType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="pdf">PDF</option>
                      <option value="video">วิดีโอ</option>
                      <option value="document">เอกสาร</option>
                      <option value="image">รูปภาพ</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => updateMaterialMutation.mutate(material.id)} disabled={updateMaterialMutation.isPending}>
                      บันทึก
                    </Button>
                    <Button variant="outline" onClick={() => setEditingMaterialId(null)}>ยกเลิก</Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddMaterial && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>เพิ่มเอกสาร</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createMaterialMutation.mutateAsync() }} className="space-y-4">
                  <div>
                    <Label>ชื่อเอกสาร</Label>
                    <Input value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} required />
                  </div>
                  <div>
                    <Label>ประเภท</Label>
                    <select
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="pdf">PDF</option>
                      <option value="video">วิดีโอ</option>
                      <option value="document">เอกสาร</option>
                      <option value="image">รูปภาพ</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <Label>อัปโหลดไฟล์</Label>
                    <Input type="file" onChange={(e) => setMaterialFile(e.target.files?.[0] || null)} />
                  </div>
                  <div>
                    <Label>หรือใช้ลิงก์ (URL)</Label>
                    <Input value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} placeholder="กรุณาใส่ URL" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMaterialMutation.isPending}>บันทึก</Button>
                    <Button variant="outline" onClick={() => setShowAddMaterial(false)}>ยกเลิก</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Quizzes Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>แบบฝึกหัดและข้อสอบ</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowAddQuiz(true)}>
            <Plus className="h-4 w-4 mr-2" />เพิ่มแบบละเอียด
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lesson.quizzes?.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">ยังไม่มีแบบฝึกหัด</p>
          )}
          {lesson.quizzes?.map((quiz: any) => (
            <div key={quiz.id} className="rounded-lg border bg-gray-50">
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <BookOpen className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                  <span className="truncate font-medium">{quiz.title}</span>
                  <span className="text-sm text-gray-500">({quiz.type === 'EXAM' ? 'ข้อสอบ' : 'แบบฝึกหัด'})</span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingQuizId(viewingQuizId === quiz.id ? null : quiz.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />ดู
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEditQuiz(quiz)}>
                    <Pencil className="mr-1 h-4 w-4" />แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      confirm({
                        title: 'ลบ Quiz/Exam',
                        description: `ลบ "${quiz.title}" ถาวร?`,
                        variant: 'danger',
                        confirmLabel: 'ลบ',
                        onConfirm: () => deleteQuizMutation.mutate(quiz.id),
                      })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {viewingQuizId === quiz.id && (
                <div className="space-y-3 border-t bg-white p-4 text-sm">
                  {quiz.description && <p>{quiz.description}</p>}
                  <p className="font-medium">จำนวนข้อ: {quiz.questions?.length || 0}</p>
                  {quiz.questions?.map((q: any, idx: number) => (
                    <div key={q.id} className="rounded-md border p-3">
                      <p className="font-medium">ข้อ {idx + 1}: {q.text}</p>
                      <p className="text-gray-500">ประเภท: {q.type} · {q.points} คะแนน</p>
                      {q.options?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {q.options.map((opt: any) => (
                            <li key={opt.id} className={opt.isCorrect ? 'font-medium text-green-600' : ''}>
                              {opt.isCorrect ? '✓ ' : '○ '}{opt.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {editingQuizId === quiz.id && (
                <div className="space-y-3 border-t bg-white p-4">
                  <div>
                    <Label>ชื่อแบบฝึกหัด</Label>
                    <Input value={editQuizTitle} onChange={(e) => setEditQuizTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>ประเภท</Label>
                    <select
                      value={editQuizType}
                      onChange={(e) => setEditQuizType(e.target.value as 'QUIZ' | 'EXAM')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="QUIZ">แบบฝึกหัด</option>
                      <option value="EXAM">ข้อสอบ</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => updateQuizMutation.mutate(quiz.id)} disabled={updateQuizMutation.isPending}>
                      บันทึก
                    </Button>
                    <Button variant="outline" onClick={() => setEditingQuizId(null)}>ยกเลิก</Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddQuiz && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>เพิ่มแบบฝึกหัด</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createQuizMutation.mutateAsync() }} className="space-y-4">
                  <div>
                    <Label>ชื่อแบบฝึกหัด</Label>
                    <Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} required />
                  </div>
                  <div>
                    <Label>ประเภท</Label>
                    <select
                      value={quizType}
                      onChange={(e) => setQuizType(e.target.value as 'QUIZ' | 'EXAM')}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="QUIZ">แบบฝึกหัด</option>
                      <option value="EXAM">ข้อสอบ</option>
                    </select>
                  </div>

                  {quizType === 'EXAM' && (
                    <div className="space-y-4">
                      <div>
                        <Label>เวลาทำข้อสอบ (นาที)</Label>
                        <Input
                          type="number"
                          value={quizTimeLimit}
                          onChange={(e) => setQuizTimeLimit(e.target.value ? Number(e.target.value) : '')}
                          placeholder="เช่น 60"
                        />
                      </div>
                      <div>
                        <Label>จำกัดจำนวนครั้งที่ทำได้</Label>
                        <Input
                          type="number"
                          value={quizMaxAttempts}
                          onChange={(e) => setQuizMaxAttempts(e.target.value ? Number(e.target.value) : '')}
                          placeholder="เช่น 3"
                        />
                      </div>
                      <div>
                        <Label>วันเปิดทำข้อสอบ</Label>
                        <Input
                          type="datetime-local"
                          value={quizStartDate}
                          onChange={(e) => setQuizStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>วันปิดทำข้อสอบ</Label>
                        <Input
                          type="datetime-local"
                          value={quizEndDate}
                          onChange={(e) => setQuizEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>คำถาม</Label>
                    {quizQuestions.map((q, i) => (
                      <div key={i} className="mb-4 p-4 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span>คำถาม {i + 1}</span>
                          <Button type="button" size="sm" variant="outline" onClick={() => setQuizQuestions(quizQuestions.filter((_, idx) => idx !== i))}>ลบ</Button>
                        </div>
                        <div className="mb-2">
                          <Label>ประเภทคำถาม</Label>
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const newQuestions = [...quizQuestions]
                              newQuestions[i] = { ...q, type: e.target.value }
                              setQuizQuestions(newQuestions)
                            }}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="MULTIPLE_CHOICE">ตัวเลือก</option>
                            <option value="TRUE_FALSE">ถูก/ผิด</option>
                            <option value="SHORT_ANSWER">ตอบสั้น</option>
                            <option value="ESSAY">อัตนัย</option>
                          </select>
                        </div>
                        <div className="mb-2">
                          <Label>คำถาม</Label>
                          <Textarea
                            value={q.question}
                            onChange={(e) => {
                              const newQuestions = [...quizQuestions]
                              newQuestions[i] = { ...q, question: e.target.value }
                              setQuizQuestions(newQuestions)
                            }}
                          />
                        </div>
                        {q.type === 'MULTIPLE_CHOICE' && (
                          <div>
                            <Label>ตัวเลือก</Label>
                            {q.options.map((opt, j) => (
                              <Input
                                key={j}
                                value={opt}
                                onChange={(e) => {
                                  const newQuestions = [...quizQuestions]
                                  newQuestions[i].options[j] = e.target.value
                                  setQuizQuestions([...newQuestions])
                                }}
                                className="mb-2"
                                placeholder={`ตัวเลือก ${j + 1}`}
                              />
                            ))}
                            <div>
                              <Label>คำตอบที่ถูกต้อง</Label>
                              <Input
                                value={q.correctAnswer}
                                onChange={(e) => {
                                  const newQuestions = [...quizQuestions]
                                  newQuestions[i].correctAnswer = e.target.value
                                  setQuizQuestions([...newQuestions])
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="outline" onClick={() => setQuizQuestions([...quizQuestions, {
                      type: 'MULTIPLE_CHOICE',
                      question: '',
                      options: ['', '', '', ''],
                      correctAnswer: ''
                    }])}>
                      <Plus className="h-4 w-4 mr-2" />เพิ่มคำถาม
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createQuizMutation.isPending}>บันทึก</Button>
                    <Button variant="outline" onClick={() => setShowAddQuiz(false)}>ยกเลิก</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Assignments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>การบ้าน</CardTitle>
          <Button size="sm" onClick={() => setShowAddAssignment(true)}>
            <Plus className="h-4 w-4 mr-2" />เพิ่มการบ้าน
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lesson.assignments?.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">ยังไม่มีการบ้าน</p>
          )}
          {lesson.assignments?.map((assignment: any) => (
            <div key={assignment.id} className="rounded-lg border bg-gray-50">
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ClipboardList className="h-5 w-5 flex-shrink-0 text-blue-500" />
                  <span className="truncate font-medium">{assignment.title}</span>
                  <span className="text-sm text-gray-500">{assignment.maxPoints} คะแนน</span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingAssignmentId(viewingAssignmentId === assignment.id ? null : assignment.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />ดู
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEditAssignment(assignment)}>
                    <Pencil className="mr-1 h-4 w-4" />แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      confirm({
                        title: 'ลบ Assignment',
                        description: `ลบ "${assignment.title}" ถาวร?`,
                        variant: 'danger',
                        confirmLabel: 'ลบ',
                        onConfirm: () => deleteAssignmentMutation.mutate(assignment.id),
                      })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {viewingAssignmentId === assignment.id && (
                <div className="space-y-2 border-t bg-white p-4 text-sm">
                  {assignment.description && (
                    <p><span className="font-medium">รายละเอียด:</span> {assignment.description}</p>
                  )}
                  <p><span className="font-medium">คะแนนเต็ม:</span> {assignment.maxPoints}</p>
                  {assignment.dueDate && (
                    <p><span className="font-medium">กำหนดส่ง:</span> {new Date(assignment.dueDate).toLocaleString('th-TH')}</p>
                  )}
                </div>
              )}

              {editingAssignmentId === assignment.id && (
                <div className="space-y-3 border-t bg-white p-4">
                  <div>
                    <Label>ชื่อการบ้าน</Label>
                    <Input value={editAssignmentTitle} onChange={(e) => setEditAssignmentTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>รายละเอียด</Label>
                    <Textarea value={editAssignmentDescription} onChange={(e) => setEditAssignmentDescription(e.target.value)} />
                  </div>
                  <div>
                    <Label>คะแนนเต็ม</Label>
                    <Input
                      type="number"
                      value={editAssignmentMaxPoints}
                      onChange={(e) => setEditAssignmentMaxPoints(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                  <div>
                    <Label>วันส่งสุดท้าย</Label>
                    <Input
                      type="datetime-local"
                      value={editAssignmentDueDate}
                      onChange={(e) => setEditAssignmentDueDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => updateAssignmentMutation.mutate(assignment.id)} disabled={updateAssignmentMutation.isPending}>
                      บันทึก
                    </Button>
                    <Button variant="outline" onClick={() => setEditingAssignmentId(null)}>ยกเลิก</Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddAssignment && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>เพิ่มการบ้าน</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createAssignmentMutation.mutateAsync() }} className="space-y-4">
                  <div>
                    <Label>ชื่อการบ้าน</Label>
                    <Input value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} required />
                  </div>
                  <div>
                    <Label>รายละเอียด</Label>
                    <Textarea
                      value={assignmentDescription}
                      onChange={(e) => setAssignmentDescription(e.target.value)}
                      placeholder="อธิบายรายละเอียดการบ้าน"
                    />
                  </div>
                  <div>
                    <Label>คะแนนเต็ม</Label>
                    <Input
                      type="number"
                      value={assignmentMaxPoints}
                      onChange={(e) => setAssignmentMaxPoints(e.target.value ? Number(e.target.value) : '')}
                      required
                    />
                  </div>
                  <div>
                    <Label>วันส่งสุดท้าย (ไม่จำเป็น)</Label>
                    <Input
                      type="datetime-local"
                      value={assignmentDueDate}
                      onChange={(e) => setAssignmentDueDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createAssignmentMutation.isPending}>บันทึก</Button>
                    <Button variant="outline" onClick={() => setShowAddAssignment(false)}>ยกเลิก</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
