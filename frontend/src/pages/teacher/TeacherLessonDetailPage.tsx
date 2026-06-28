import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, FileText, BookOpen, Video, ClipboardList } from 'lucide-react'
import { api } from '@/lib/api'

export function TeacherLessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['teacher-lesson', lessonId],
    queryFn: async () => api.get<any>(`/teacher/lessons/${lessonId}`),
  })

  const createMaterialMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('title', materialTitle)
      formData.append('type', materialType)
      if (materialFile) {
        formData.append('file', materialFile)
      } else if (materialUrl) {
        formData.append('fileUrl', materialUrl)
      }
      return api.post(`/teacher/lessons/${lessonId}/materials`, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson', lessonId] })
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
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson', lessonId] })
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
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson', lessonId] })
      setShowAddAssignment(false)
      setAssignmentTitle('')
      setAssignmentDescription('')
      setAssignmentMaxPoints(100)
      setAssignmentDueDate('')
    },
  })

  if (isLoading) return <div className="text-center py-12">กำลังโหลด...</div>
  if (!lesson) return <div className="text-center py-12">ไม่พบหัวข้อเรียน</div>

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" onClick={() => navigate(-1)}>← กลับ</Button>
        <h1 className="text-2xl font-bold mt-2">{lesson.title}</h1>
        <p className="text-gray-600">{lesson.description}</p>
      </div>

      {/* Materials Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>เอกสารและสื่อการสอน</CardTitle>
          <Button size="sm" onClick={() => setShowAddMaterial(true)}>
            <Plus className="h-4 w-4 mr-2" />เพิ่มเอกสาร
          </Button>
        </CardHeader>
        <CardContent>
          {lesson.materials?.map((material: any) => (
            <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-2">
              <div className="flex items-center gap-3">
                {material.type === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                {material.type === 'video' && <Video className="h-5 w-5 text-blue-500" />}
                <span>{material.title}</span>
              </div>
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
          <Button size="sm" onClick={() => setShowAddQuiz(true)}>
            <Plus className="h-4 w-4 mr-2" />เพิ่มแบบฝึกหัด
          </Button>
        </CardHeader>
        <CardContent>
          {lesson.quizzes?.map((quiz: any) => (
            <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-2">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-yellow-500" />
                <span>{quiz.title}</span>
                <span className="text-sm text-gray-500">({quiz.type === 'EXAM' ? 'ข้อสอบ' : 'แบบฝึกหัด'})</span>
              </div>
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
        <CardContent>
          {lesson.assignments?.map((assignment: any) => (
            <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-2">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-blue-500" />
                <span>{assignment.title}</span>
                {assignment.dueDate && (
                  <span className="text-sm text-gray-500">
                    (ส่งก่อน: {new Date(assignment.dueDate).toLocaleDateString('th-TH')})
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-600">{assignment.maxPoints} คะแนน</span>
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
