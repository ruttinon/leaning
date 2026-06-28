import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import Stripe from 'stripe'

@Injectable()
export class StudentService {
  private stripe: Stripe | null = null

  constructor(private prisma: PrismaService) {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    }
  }

  async getDashboard(userId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                teacher: {
                  include: { user: true },
                },
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
          take: 5,
        },
        progressLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const totalEnrollments = await this.prisma.enrollment.count({
      where: { studentId: studentProfile.id },
    })

    const completedLessons = await this.prisma.progressLog.count({
      where: { studentId: studentProfile.id, isCompleted: true },
    })

    return {
      studentProfile,
      totalEnrollments,
      completedLessons,
    }
  }

  async getMyCourses(userId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    return this.prisma.enrollment.findMany({
      where: { studentId: studentProfile.id },
      include: {
        course: {
          include: {
            teacher: {
              include: { user: true },
            },
            subject: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })
  }

  async enrollCourse(userId: string, courseId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    if (course.status !== 'PUBLISHED') {
      throw new BadRequestException('Course is not available for enrollment')
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: studentProfile.id,
        },
      },
    })

    if (existingEnrollment) {
      throw new BadRequestException('Already enrolled in this course')
    }

    return this.prisma.enrollment.create({
      data: {
        courseId,
        studentId: studentProfile.id,
      },
      include: {
        course: true,
      },
    })
  }

  async getCourseDetail(userId: string, courseId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: studentProfile.id,
        },
      },
      include: {
        course: {
          include: {
            chapters: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                  include: {
                    materials: true,
                    quizzes: true,
                    assignments: {
                      include: {
                        submissions: {
                          where: { studentId: studentProfile.id },
                        },
                      },
                    },
                  },
                },
              },
            },
            teacher: {
              include: { user: true },
            },
            subject: true,
          },
        },
      },
    })

    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this course')
    }

    return enrollment
  }

  async getLessonDetail(userId: string, lessonId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { studentId: studentProfile.id },
                },
              },
            },
          },
        },
        materials: true,
        quizzes: true,
        assignments: {
          include: {
            submissions: {
              where: { studentId: studentProfile.id },
            },
          },
        },
      },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.chapter.course.enrollments.length === 0) {
      throw new ForbiddenException('Not enrolled in this course')
    }

    const progressLog = await this.prisma.progressLog.findFirst({
      where: {
        studentId: studentProfile.id,
        lessonId,
      },
    })

    return {
      lesson,
      isCompleted: progressLog?.isCompleted || false,
    }
  }

  async completeLesson(userId: string, lessonId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { studentId: studentProfile.id },
                },
              },
            },
          },
        },
      },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.chapter.course.enrollments.length === 0) {
      throw new ForbiddenException('Not enrolled in this course')
    }

    // Check if exists first
    const existingProgress = await this.prisma.progressLog.findFirst({
      where: {
        studentId: studentProfile.id,
        lessonId,
      },
    });

    if (existingProgress) {
      return this.prisma.progressLog.update({
        where: { id: existingProgress.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    } else {
      return this.prisma.progressLog.create({
        data: {
          studentId: studentProfile.id,
          lessonId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }
  }

  async getScores(userId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: { studentId: studentProfile.id },
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
      orderBy: { createdAt: 'desc' },
    })

    const assignmentSubmissions = await this.prisma.assignmentSubmission.findMany({
      where: { studentId: studentProfile.id },
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
      orderBy: { createdAt: 'desc' },
    })

    return {
      quizAttempts,
      assignmentSubmissions,
    }
  }

  async getQuiz(userId: string, quizId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                course: {
                  include: {
                    enrollments: {
                      where: { studentId: studentProfile.id },
                    },
                  },
                },
              },
            },
          },
        },
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    if (quiz.lesson.chapter.course.enrollments.length === 0) {
      throw new ForbiddenException('Not enrolled in this course')
    }

    return quiz
  }

  async startQuizAttempt(userId: string, quizId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                course: {
                  include: {
                    enrollments: {
                      where: { studentId: studentProfile.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    if (quiz.lesson.chapter.course.enrollments.length === 0) {
      throw new ForbiddenException('Not enrolled in this course')
    }

    if (quiz.maxAttempts) {
      const existingAttempts = await this.prisma.quizAttempt.count({
        where: { quizId, studentId: studentProfile.id },
      })
      if (existingAttempts >= quiz.maxAttempts) {
        throw new BadRequestException('Maximum attempts reached')
      }
    }

    if (quiz.startDate && new Date() < new Date(quiz.startDate)) {
      throw new BadRequestException('Quiz not yet available')
    }

    if (quiz.endDate && new Date() > new Date(quiz.endDate)) {
      throw new BadRequestException('Quiz has ended')
    }

    return this.prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: studentProfile.id,
      },
    })
  }

  async getQuizAttempt(userId: string, attemptId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
        answers: {
          include: { question: true, selectedOptions: true },
        },
      },
    })

    if (!attempt) {
      throw new NotFoundException('Attempt not found')
    }

    if (attempt.studentId !== studentProfile.id) {
      throw new ForbiddenException('Not authorized to view this attempt')
    }

    return attempt
  }

  async submitQuizAttempt(userId: string, attemptId: string, data: any) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    })

    if (!attempt) {
      throw new NotFoundException('Attempt not found')
    }

    if (attempt.studentId !== studentProfile.id) {
      throw new ForbiddenException('Not authorized to submit this attempt')
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Attempt already submitted')
    }

    let totalScore = 0
    let maxScore = 0

    if (data.answers) {
      for (const answerData of data.answers) {
        const question = attempt.quiz.questions.find(q => q.id === answerData.questionId)
        if (!question) continue

        maxScore += question.points

        let isCorrect = false
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
          const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id)
          const selectedOptionIds = answerData.selectedOptionIds || []
          isCorrect = correctOptions.length === selectedOptionIds.length && 
                     correctOptions.every(id => selectedOptionIds.includes(id))
        }

        const quizAnswer = await this.prisma.quizAnswer.create({
          data: {
            attemptId,
            questionId: question.id,
            textAnswer: answerData.textAnswer,
            isCorrect,
            points: isCorrect ? question.points : 0,
          },
        })

        if (answerData.selectedOptionIds && answerData.selectedOptionIds.length > 0) {
          for (const optionId of answerData.selectedOptionIds) {
            await this.prisma.quizAnswer.update({
              where: { id: quizAnswer.id },
              data: {
                selectedOptions: {
                  connect: { id: optionId },
                },
              },
            })
          }
        }

        if (isCorrect) {
          totalScore += question.points
        }
      }
    }

    return this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        score: totalScore,
        maxScore,
      },
      include: {
        answers: {
          include: { question: true, selectedOptions: true },
        },
      },
    })
  }

  async getAssignment(userId: string, assignmentId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                course: {
                  include: {
                    enrollments: {
                      where: { studentId: studentProfile.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!assignment) {
      throw new NotFoundException('Assignment not found')
    }

    if (assignment.lesson.chapter.course.enrollments.length === 0) {
      throw new ForbiddenException('Not enrolled in this course')
    }

    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: studentProfile.id,
        },
      },
    })

    return {
      assignment,
      submission,
    }
  }

  async submitAssignment(userId: string, assignmentId: string, data: any) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                course: {
                  include: {
                    enrollments: {
                      where: { studentId: studentProfile.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!assignment) {
      throw new NotFoundException('Assignment not found')
    }

    if (assignment.lesson.chapter.course.enrollments.length === 0) {
      throw new ForbiddenException('Not enrolled in this course')
    }

    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      throw new BadRequestException('Assignment is overdue')
    }

    return this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: studentProfile.id,
        },
      },
      create: {
        assignmentId,
        studentId: studentProfile.id,
        textAnswer: data.textAnswer,
        fileUrl: data.fileUrl,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
      update: {
        textAnswer: data.textAnswer,
        fileUrl: data.fileUrl,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
    })
  }

  async getProgress(userId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                chapters: {
                  include: { lessons: true },
                },
              },
            },
          },
        },
        progressLogs: true,
      },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    return studentProfile.enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.chapters.reduce(
        (sum, chapter) => sum + chapter.lessons.length,
        0,
      )
      const lessonIds = enrollment.course.chapters.flatMap(
        (chapter) => chapter.lessons.map((lesson) => lesson.id),
      )
      const completedLessons = studentProfile.progressLogs.filter(
        (log) => lessonIds.includes(log.lessonId) && log.isCompleted,
      ).length
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      return {
        course: enrollment.course,
        totalLessons,
        completedLessons,
        progress,
      }
    })
  }

  async getMyPayments(userId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    return this.prisma.payment.findMany({
      where: { studentId: studentProfile.id },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async applyCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    })

    if (!coupon) {
      throw new BadRequestException('Coupon not found')
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active')
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException('Coupon has expired')
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon has reached maximum uses')
    }

    return coupon
  }

  async createPaymentIntent(userId: string, courseId: string, couponCode?: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    if (course.status !== 'PUBLISHED') {
      throw new BadRequestException('Course is not available for purchase')
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: studentProfile.id,
        },
      },
    })

    if (existingEnrollment) {
      throw new BadRequestException('Already enrolled in this course')
    }

    let discount = 0
    if (couponCode) {
      try {
        const coupon = await this.applyCoupon(couponCode)
        discount = Number(coupon.discount)
      } catch (e) {
        // Ignore coupon if invalid
      }
    }

    const price = Number(course.price)
    const amount = Math.round(price * (100 - discount))
    const amountInSmallestUnit = Math.round(amount * 100) // THB satang

    // Create payment record first
    const payment = await this.prisma.payment.create({
      data: {
        studentId: studentProfile.id,
        courseId,
        amount: price * (1 - discount / 100),
      },
    })

    // If price is 0, mark as completed and enroll directly
    if (price * (1 - discount / 100) <= 0) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      })

      const enrollment = await this.prisma.enrollment.create({
        data: {
          courseId,
          studentId: studentProfile.id,
        },
        include: { course: true },
      })

      return { clientSecret: null, payment, enrollment }
    }

    // Otherwise create Stripe payment intent
    if (!this.stripe) {
      // Mock payment for demo purposes
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      })

      const enrollment = await this.prisma.enrollment.create({
        data: {
          courseId,
          studentId: studentProfile.id,
        },
        include: { course: true },
      })

      return { clientSecret: 'mock_secret_' + payment.id, payment, enrollment }
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: 'thb',
      metadata: {
        paymentId: payment.id,
        courseId,
        studentId: studentProfile.id,
      },
    })

    return { clientSecret: paymentIntent.client_secret, payment }
  }

  async confirmPayment(paymentId: string, transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { student: true, course: true },
    })

    if (!payment) {
      throw new NotFoundException('Payment not found')
    }

    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Payment already completed')
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        transactionId,
      },
    })

    // Enroll the student
    const enrollment = await this.prisma.enrollment.create({
      data: {
        courseId: payment.courseId,
        studentId: payment.studentId,
      },
      include: { course: true },
    })

    return { payment: updatedPayment, enrollment }
  }
}
