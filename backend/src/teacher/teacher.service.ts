import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async getDashboard(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        courses: true,
      },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const totalCourses = teacherProfile.courses.length
    const publishedCourses = teacherProfile.courses.filter(
      (course) => course.status === 'PUBLISHED',
    ).length
    const totalEnrollments = await this.prisma.enrollment.count({
      where: {
        course: {
          teacherId: teacherProfile.id,
        },
      },
    })

    return {
      teacherProfile,
      totalCourses,
      publishedCourses,
      totalEnrollments,
    }
  }

  async getCourse(userId: string, courseId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subject: true,
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    if (course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to view this course')
    }

    return course
  }

  async getCourses(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    return this.prisma.course.findMany({
      where: { teacherId: teacherProfile.id },
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createCourse(userId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    return this.prisma.course.create({
      data: {
        ...data,
        teacherId: teacherProfile.id,
      },
      include: { subject: true },
    })
  }

  async updateCourse(userId: string, courseId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    if (course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this course')
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data,
      include: { subject: true },
    })
  }

  async updateCourseThumbnail(userId: string, courseId: string, thumbnailUrl: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({ where: { userId } })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const course = await this.prisma.course.findUnique({ where: { id: courseId } })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    if (course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this course')
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { thumbnailUrl },
      include: { subject: true },
    })
  }

  async submitCourseForReview(userId: string, courseId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    if (course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to submit this course')
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: 'PENDING_REVIEW' },
      include: { subject: true },
    })
  }

  async createChapter(userId: string, courseId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    if (course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this course')
    }

    return this.prisma.chapter.create({
      data: {
        ...data,
        courseId,
      },
    })
  }

  async getLesson(userId: string, lessonId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: { include: { course: true } },
        materials: true,
        quizzes: {
          include: {
            questions: {
              include: { options: true }
            }
          }
        },
        assignments: true,
      },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to view this lesson')
    }

    return lesson
  }

  async createLesson(userId: string, chapterId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    })

    if (!chapter) {
      throw new NotFoundException('Chapter not found')
    }

    if (chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this course')
    }

    return this.prisma.lesson.create({
      data: {
        ...data,
        chapterId,
      },
    })
  }

  async createMaterial(userId: string, lessonId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this course')
    }

    return this.prisma.material.create({
      data: {
        ...data,
        lessonId,
      },
    })
  }

  async createQuiz(userId: string, lessonId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this course')
    }

    const quiz = await this.prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type || 'QUIZ',
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts,
        showAnswers: data.showAnswers ?? true,
        shuffleQuestions: data.shuffleQuestions ?? false,
        shuffleOptions: data.shuffleOptions ?? false,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        lessonId,
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    })

    if (data.questions && data.questions.length > 0) {
      for (const questionData of data.questions) {
        const createdQuestion = await this.prisma.question.create({
          data: {
            text: questionData.question, // from frontend's "question" field to schema's "text"
            type: questionData.type,
            points: questionData.points || 1,
            quizId: quiz.id,
          },
        })

        if (questionData.options && questionData.options.length > 0) {
          for (let i = 0; i < questionData.options.length; i++) {
            const optionText = questionData.options[i]
            const isCorrect = optionText === questionData.correctAnswer
            await this.prisma.questionOption.create({
              data: {
                text: optionText, // schema uses "text", not "optionText"
                isCorrect: isCorrect,
                order: i,
                questionId: createdQuestion.id,
              },
            })
          }
        }
      }
    }

    // Re-fetch the quiz with all relations to return
    return this.prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        questions: {
          include: { options: true },
        },
      },
    })
  }

  async createAssignment(userId: string, lessonId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this course')
    }

    return this.prisma.assignment.create({
      data: {
        ...data,
        lessonId,
      },
    })
  }

  async updateMaterial(userId: string, materialId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { lesson: { include: { chapter: { include: { course: true } } } } },
    })

    if (!material) {
      throw new NotFoundException('Material not found')
    }

    if (material.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this material')
    }

    return this.prisma.material.update({
      where: { id: materialId },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
      },
    })
  }

  async deleteMaterial(userId: string, materialId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { lesson: { include: { chapter: { include: { course: true } } } } },
    })

    if (!material) {
      throw new NotFoundException('Material not found')
    }

    if (material.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to delete this material')
    }

    await this.storageService.deleteByFileUrl(material.fileUrl)

    return this.prisma.material.delete({
      where: { id: materialId },
    })
  }

  async updateAssignment(userId: string, assignmentId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: { include: { chapter: { include: { course: true } } } } },
    })

    if (!assignment) {
      throw new NotFoundException('Assignment not found')
    }

    if (assignment.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this assignment')
    }

    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title: data.title,
        description: data.description,
        maxPoints: data.maxPoints,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    })
  }

  async deleteAssignment(userId: string, assignmentId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: { include: { chapter: { include: { course: true } } } } },
    })

    if (!assignment) {
      throw new NotFoundException('Assignment not found')
    }

    if (assignment.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to delete this assignment')
    }

    return this.prisma.assignment.delete({
      where: { id: assignmentId },
    })
  }

  async getSubmissions(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    return this.prisma.assignmentSubmission.findMany({
      where: {
        assignment: {
          lesson: {
            chapter: {
              course: {
                teacherId: teacherProfile.id,
              },
            },
          },
        },
      },
      include: {
        assignment: {
          include: {
            lesson: {
              include: {
                chapter: {
                  include: { course: true },
                },
              },
            },
          },
        },
        student: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateChapter(userId: string, chapterId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    })

    if (!chapter) {
      throw new NotFoundException('Chapter not found')
    }

    if (chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this chapter')
    }

    return this.prisma.chapter.update({
      where: { id: chapterId },
      data,
    })
  }

  async deleteChapter(userId: string, chapterId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    })

    if (!chapter) {
      throw new NotFoundException('Chapter not found')
    }

    if (chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to delete this chapter')
    }

    return this.prisma.chapter.delete({
      where: { id: chapterId },
    })
  }

  async updateLesson(userId: string, lessonId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this lesson')
    }

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data,
    })
  }

  async deleteLesson(userId: string, lessonId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to delete this lesson')
    }

    return this.prisma.lesson.delete({
      where: { id: lessonId },
    })
  }

  async getQuiz(userId: string, quizId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: { course: true },
            },
          },
        },
        questions: {
          include: { options: true },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    if (quiz.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to view this quiz')
    }

    return quiz
  }

  async updateQuiz(userId: string, quizId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
      lesson: {
        include: {
          chapter: {
            include: { course: true },
          },
        },
      },
    },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    if (quiz.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this quiz')
    }

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        questions: { include: { options: true } },
      },
    })
  }

  async deleteQuiz(userId: string, quizId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
      lesson: {
        include: {
          chapter: {
            include: { course: true },
          },
        },
      },
    },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    if (quiz.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to delete this quiz')
    }

    return this.prisma.quiz.delete({
      where: { id: quizId },
    })
  }

  async createQuestion(userId: string, quizId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
      lesson: {
        include: {
          chapter: {
            include: { course: true },
          },
        },
      },
    },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    if (quiz.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this quiz')
    }

    const question = await this.prisma.question.create({
      data: {
        text: data.question || data.text,
        type: data.type,
        points: data.points || 1,
        quizId,
      },
    })

    if (data.options && data.options.length > 0) {
      for (let i = 0; i < data.options.length; i++) {
        const optionData = data.options[i]
        const text = typeof optionData === 'string' ? optionData : optionData.text
        const isCorrect = typeof optionData === 'string' ? text === data.correctAnswer : optionData.isCorrect
        await this.prisma.questionOption.create({
          data: {
            text,
            isCorrect: isCorrect || false,
            order: i,
            questionId: question.id,
          },
        })
      }
    }

    return this.prisma.question.findUnique({
      where: { id: question.id },
      include: { options: true },
    })
  }

  async updateQuestion(userId: string, questionId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            lesson: {
              include: {
                chapter: {
                  include: { course: true },
                },
              },
            },
          },
        },
      },
    })

    if (!question) {
      throw new NotFoundException('Question not found')
    }

    if (question.quiz.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to update this question')
    }

    const updatedQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        text: data.question || data.text || undefined,
        type: data.type || undefined,
        points: data.points || undefined,
      },
    })

    if (data.options && data.options.length > 0) {
      await this.prisma.questionOption.deleteMany({
        where: { questionId },
      })

      for (let i = 0; i < data.options.length; i++) {
        const optionData = data.options[i]
        const text = typeof optionData === 'string' ? optionData : optionData.text
        const isCorrect = typeof optionData === 'string' ? text === data.correctAnswer : optionData.isCorrect
        await this.prisma.questionOption.create({
          data: {
            text,
            isCorrect: isCorrect || false,
            order: i,
            questionId,
          },
        })
      }
    }

    return this.prisma.question.findUnique({
      where: { id: updatedQuestion.id },
      include: { options: true },
    })
  }

  async deleteQuestion(userId: string, questionId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            lesson: {
              include: {
                chapter: {
                  include: { course: true },
                },
              },
            },
          },
        },
      },
    })

    if (!question) {
      throw new NotFoundException('Question not found')
    }

    if (question.quiz.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to delete this question')
    }

    return this.prisma.question.delete({
      where: { id: questionId },
    })
  }

  async getGradebook(userId: string, courseId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            lessons: {
              include: {
                quizzes: true,
                assignments: true,
              },
            },
          },
        },
        enrollments: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    if (course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to view this gradebook')
    }

    const enrollments = course.enrollments.map(async (enrollment) => {
      const quizAttempts = await this.prisma.quizAttempt.findMany({
        where: {
          quiz: {
            lesson: {
              chapter: {
                courseId,
              },
            },
          },
          studentId: enrollment.studentId,
        },
        include: { quiz: true },
      })

      const assignmentSubmissions = await this.prisma.assignmentSubmission.findMany({
        where: {
          assignment: {
            lesson: {
              chapter: {
                courseId,
              },
            },
          },
          studentId: enrollment.studentId,
        },
        include: { assignment: true },
      })

      const totalQuizScore = quizAttempts.reduce((sum, attempt) => sum + Number(attempt.score || 0), 0)
      const totalQuizMaxScore = quizAttempts.reduce((sum, attempt) => sum + Number(attempt.maxScore || 0), 0)

      const totalAssignmentScore = assignmentSubmissions.reduce((sum, submission) => sum + Number(submission.grade || 0), 0)
      const totalAssignmentMaxScore = assignmentSubmissions.reduce((sum, submission) => sum + Number(submission.assignment.maxPoints || 0), 0)

      const totalScore = totalQuizScore + totalAssignmentScore
      const totalMaxScore = totalQuizMaxScore + totalAssignmentMaxScore

      return {
        student: enrollment.student,
        quizAttempts,
        assignmentSubmissions,
        totalScore,
        totalMaxScore,
      }
    })

    return Promise.all(enrollments)
  }

  async gradeSubmission(userId: string, submissionId: string, data: any) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            lesson: {
              include: {
                chapter: {
                  include: { course: true },
                },
              },
            },
          },
        },
      },
    })

    if (!submission) {
      throw new NotFoundException('Submission not found')
    }

    if (submission.assignment.lesson.chapter.course.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Not authorized to grade this submission')
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: data.grade,
        feedback: data.feedback,
        gradedAt: new Date(),
        status: 'GRADED',
      },
    })
  }

  async getMaterials(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    return this.prisma.material.findMany({
      where: {
        lesson: {
          chapter: {
            course: {
              teacherId: teacherProfile.id,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getQuizzes(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    return this.prisma.quiz.findMany({
      where: {
        type: 'QUIZ',
        lesson: {
          chapter: {
            course: {
              teacherId: teacherProfile.id,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getExams(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    return this.prisma.quiz.findMany({
      where: {
        type: 'EXAM',
        lesson: {
          chapter: {
            course: {
              teacherId: teacherProfile.id,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getAssignments(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    return this.prisma.assignment.findMany({
      where: {
        lesson: {
          chapter: {
            course: {
              teacherId: teacherProfile.id,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getStudents(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    })

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found')
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        course: {
          teacherId: teacherProfile.id,
        },
      },
      include: {
        student: {
          include: { user: true },
        },
      },
      distinct: ['studentId'],
    })

    return enrollments.map((e) => ({
      ...e.student.user,
      enrollments: enrollments.filter((enr) => enr.studentId === e.studentId).length,
    }))
  }
}
