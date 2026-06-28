import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Video, FileText, ClipboardList } from 'lucide-react'
import { api } from '@/lib/api'

export function StudentCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [showSubmitAssignment, setShowSubmitAssignment] = useState<string | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)

  const { data: course, isLoading } = useQuery({
    queryKey: ['student-course', courseId],
    queryFn: async () => api.get<any>(`/student/courses/${courseId}`),
  })

  const { data: lesson } = useQuery({
    queryKey: ['student-lesson', selectedLessonId],
    queryFn: async () => {
      if (!selectedLessonId) return null
      return api.get<any>(`/student/lessons/${selectedLessonId}`)
    },
    enabled: !!selectedLessonId,
  })

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => api.post(`/student/lessons/${lessonId}/complete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['student-progress'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
  })

  const submitAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const formData = new FormData()
      formData.append('textAnswer', submissionText)
      if (submissionFile) {
        formData.append('file', submissionFile)
      }
      return api.post(`/student/assignments/${assignmentId}/submit`, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-course', courseId] })
      setShowSubmitAssignment(null)
      setSubmissionText('')
      setSubmissionFile(null)
    },
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" onClick={() => navigate(-1)}>← กลับ</Button>
        <h1 className="text-2xl font-bold mt-2">{course?.title}</h1>
        <p className="text-gray-600">{course?.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Outline */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>เนื้อหาในคอร์ส</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course?.chapters?.map((chapter: any) => (
                <div key={chapter.id} className="space-y-2">
                  <h3 className="font-semibold">{chapter.title}</h3>
                  <div className="space-y-2">
                    {chapter.lessons?.map((lesson: any) => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                          selectedLessonId === lesson.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        {lesson.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-2">
          {!selectedLessonId ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">กรุณาเลือกบทเรียนเพื่อดูเนื้อหา</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Lesson Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{lesson?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{lesson?.description}</p>
                  {!lesson?.isCompleted && (
                    <div className="mt-4">
                      <Button
                        onClick={() => completeLessonMutation.mutate(selectedLessonId)}
                        disabled={completeLessonMutation.isPending}
                      >
                        {completeLessonMutation.isPending ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าเรียนแล้ว'}
                      </Button>
                    </div>
                  )}
                  {lesson?.isCompleted && (
                    <div className="mt-4 text-green-600">
                      ✓ เรียนแล้ว
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Materials */}
              {lesson?.materials?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>เอกสารและสื่อการสอน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lesson.materials.map((material: any) => (
                        material.type === 'pdf' ? (
                          <Link
                            key={material.id}
                            to={`/student/materials/${material.id}`}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FileText className="h-5 w-5 text-red-500" />
                            <span>{material.title}</span>
                          </Link>
                        ) : (
                          <a
                            key={material.id}
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {material.type === 'video' && <Video className="h-5 w-5 text-blue-500" />}
                            {material.type !== 'pdf' && material.type !== 'video' && <FileText className="h-5 w-5 text-gray-500" />}
                            <span>{material.title}</span>
                          </a>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quizzes */}
              {lesson?.quizzes?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>แบบฝึกหัดและข้อสอบ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lesson.quizzes.map((quiz: any) => (
                        <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-yellow-500" />
                            <span>{quiz.title}</span>
                          </div>
                          <Link to={`/student/quizzes/${quiz.id}`}>
                            <Button variant="outline" size="sm">ทำแบบฝึกหัด</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assignments */}
              {lesson?.assignments?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>การบ้าน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lesson.assignments.map((assignment: any) => {
                        const submission = assignment.submissions?.[0]
                        return (
                          <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
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
                            {assignment.description && (
                              <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                            )}
                            {submission && (
                              <div className="mt-2 p-2 bg-white rounded border">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">
                                    ส่งแล้ว ({new Date(submission.submittedAt).toLocaleDateString('th-TH')})
                                  </span>
                                  {submission.status === 'GRADED' && (
                                    <span className="text-sm font-bold text-green-600">
                                      {submission.grade}/{assignment.maxPoints} คะแนน
                                    </span>
                                  )}
                                </div>
                                {submission.textAnswer && <p className="text-sm text-gray-600">{submission.textAnswer}</p>}
                                {submission.feedback && (
                                  <p className="text-sm text-blue-600 mt-1">ความคิดเห็น: {submission.feedback}</p>
                                )}
                              </div>
                            )}
                            {!submission && (
                              <div className="mt-2">
                                {showSubmitAssignment === assignment.id ? (
                                  <Card>
                                    <CardContent className="pt-4 space-y-4">
                                      <div>
                                        <Label>คำตอบ</Label>
                                        <Textarea
                                          value={submissionText}
                                          onChange={(e) => setSubmissionText(e.target.value)}
                                          placeholder="เขียนคำตอบของคุณ"
                                        />
                                      </div>
                                      <div>
                                        <Label>ไฟล์แนบ (ไม่จำเป็น)</Label>
                                        <Input
                                          type="file"
                                          onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => submitAssignmentMutation.mutate(assignment.id)}
                                          disabled={submitAssignmentMutation.isPending}
                                        >
                                          ส่งการบ้าน
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setShowSubmitAssignment(null)}
                                        >
                                          ยกเลิก
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => setShowSubmitAssignment(assignment.id)}
                                  >
                                    ส่งการบ้าน
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
