import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, ClipboardList, ExternalLink, FileText, Paperclip, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { resolveStudentFileUrl, uploadStudentAssignment } from '@/lib/storage'

export function StudentCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
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
      queryClient.invalidateQueries({ queryKey: ['student-lesson', selectedLessonId] })
      queryClient.invalidateQueries({ queryKey: ['student-progress'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
  })

  const submitAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) =>
      uploadStudentAssignment({
        assignmentId,
        textAnswer: submissionText,
        file: submissionFile,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['student-lesson', selectedLessonId] })
      setShowSubmitAssignment(null)
      setSubmissionText('')
      setSubmissionFile(null)
    },
  })

  const openFile = async (fileUrl?: string | null) => {
    const url = await resolveStudentFileUrl(fileUrl)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const canSubmitAssignment = submissionText.trim().length > 0 || !!submissionFile

  if (isLoading) {
    return <div className="py-12 text-center text-gray-600">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{course?.title}</h1>
        <p className="text-gray-600">{course?.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                    {chapter.lessons?.map((chapterLesson: any) => (
                      <button
                        key={chapterLesson.id}
                        onClick={() => setSelectedLessonId(chapterLesson.id)}
                        className={`w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                          selectedLessonId === chapterLesson.id
                            ? 'bg-emerald-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {chapterLesson.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!selectedLessonId ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">กรุณาเลือกบทเรียนเพื่อดูเนื้อหา</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{lesson?.lesson?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{lesson?.lesson?.description}</p>
                  {!lesson?.isCompleted ? (
                    <div className="mt-4">
                      <Button
                        onClick={() => completeLessonMutation.mutate(selectedLessonId)}
                        disabled={completeLessonMutation.isPending}
                      >
                        {completeLessonMutation.isPending
                          ? 'กำลังบันทึก...'
                          : 'ทำเครื่องหมายว่าเรียนแล้ว'}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 text-green-600">เรียนแล้ว</div>
                  )}
                </CardContent>
              </Card>

              {lesson?.lesson?.materials?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>เอกสารและสื่อการสอน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lesson.lesson.materials.map((material: any) => (
                        material.type === 'pdf' ? (
                          <Link
                            key={material.id}
                            to={`/student/materials/${material.id}`}
                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                          >
                            <FileText className="h-5 w-5 text-red-500" />
                            <span>{material.title}</span>
                          </Link>
                        ) : (
                          <button
                            key={material.id}
                            type="button"
                            onClick={() => openFile(material.fileUrl)}
                            className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
                          >
                            {material.type === 'video' ? (
                              <Video className="h-5 w-5 text-blue-500" />
                            ) : (
                              <FileText className="h-5 w-5 text-gray-500" />
                            )}
                            <span>{material.title}</span>
                            <ExternalLink className="ml-auto h-4 w-4 text-gray-400" />
                          </button>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {lesson?.lesson?.quizzes?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>แบบฝึกหัดและข้อสอบ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lesson.lesson.quizzes.map((quiz: any) => (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-yellow-500" />
                            <span>{quiz.title}</span>
                          </div>
                          <Link to={`/student/quizzes/${quiz.id}`}>
                            <Button variant="outline" size="sm">
                              ทำแบบฝึกหัด
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {lesson?.lesson?.assignments?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>การบ้าน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lesson.lesson.assignments.map((assignment: any) => {
                        const submission = assignment.submissions?.[0]

                        return (
                          <div key={assignment.id} className="rounded-lg bg-gray-50 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ClipboardList className="h-5 w-5 text-blue-500" />
                                <span>{assignment.title}</span>
                                {assignment.dueDate && (
                                  <span className="text-sm text-gray-500">
                                    (ส่งก่อน: {new Date(assignment.dueDate).toLocaleDateString('th-TH')})
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                {assignment.maxPoints} คะแนน
                              </span>
                            </div>

                            {assignment.description && (
                              <p className="mb-2 text-sm text-gray-600">{assignment.description}</p>
                            )}

                            {submission ? (
                              <div className="mt-2 rounded border bg-white p-3">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <span className="text-sm font-medium">
                                    ส่งแล้ว ({new Date(submission.submittedAt).toLocaleDateString('th-TH')})
                                  </span>
                                  {submission.status === 'GRADED' && (
                                    <span className="text-sm font-bold text-green-600">
                                      {submission.grade}/{assignment.maxPoints} คะแนน
                                    </span>
                                  )}
                                </div>
                                {submission.textAnswer && (
                                  <p className="text-sm text-gray-600">{submission.textAnswer}</p>
                                )}
                                {submission.fileUrl && (
                                  <button
                                    type="button"
                                    onClick={() => openFile(submission.fileUrl)}
                                    className="mt-2 inline-flex items-center gap-2 text-sm text-emerald-700 hover:underline"
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    เปิดไฟล์แนบที่ส่ง
                                  </button>
                                )}
                                {submission.feedback && (
                                  <p className="mt-1 text-sm text-emerald-700">
                                    ความคิดเห็น: {submission.feedback}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2">
                                {showSubmitAssignment === assignment.id ? (
                                  <Card>
                                    <CardContent className="space-y-4 pt-4">
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
                                        {submissionFile && (
                                          <p className="mt-2 text-sm text-gray-500">
                                            เลือกไฟล์: {submissionFile.name}
                                          </p>
                                        )}
                                      </div>
                                      {submitAssignmentMutation.error instanceof Error && (
                                        <p className="text-sm text-red-600">
                                          {submitAssignmentMutation.error.message}
                                        </p>
                                      )}
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => submitAssignmentMutation.mutate(assignment.id)}
                                          disabled={
                                            submitAssignmentMutation.isPending || !canSubmitAssignment
                                          }
                                        >
                                          {submitAssignmentMutation.isPending
                                            ? 'กำลังส่ง...'
                                            : 'ส่งการบ้าน'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setShowSubmitAssignment(null)
                                            setSubmissionText('')
                                            setSubmissionFile(null)
                                          }}
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
