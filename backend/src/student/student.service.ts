import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import Stripe from 'stripe'
import {
  calculatePaymentAmount,
  canDirectlyEnrollInCourse,
  canUseClientPaymentConfirmation,
} from '../common/utils/payment'
import { SubmitAssignmentDto } from './dto/submit-assignment.dto'
import { prepareQuizForStudent } from '../common/utils/quiz'
import { updateEnrollmentProgress } from '../common/utils/enrollment-progress'
import { NotificationService } from '../common/services/notification.service'

type PaymentRecord = Prisma.PaymentGetPayload<{
  include: { course: true }
}>

const ACTIVE_STRIPE_PAYMENT_STATUSES = new Set<Stripe.PaymentIntent.Status>([
  'processing',
  'requires_action',
  'requires_capture',
  'requires_confirmation',
  'requires_payment_method',
])

@Injectable()
export class StudentService {
  private stripe: Stripe | null = null

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {
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

    const completedPayment = await this.prisma.payment.findFirst({
      where: {
        studentId: studentProfile.id,
        courseId,
        status: 'COMPLETED',
      },
    })

    if (!canDirectlyEnrollInCourse(Number(course.price), !!completedPayment)) {
      throw new BadRequestException('Paid courses must be purchased before enrollment')
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

    const enrollment = await this.prisma.enrollment.create({
      data: {
        courseId,
        studentId: studentProfile.id,
      },
      include: {
        course: {
          include: {
            teacher: { include: { user: true } },
          },
        },
      },
    })

    if (enrollment.course.teacher?.userId) {
      await this.notificationService.notifyUser(
        enrollment.course.teacher.userId,
        'มีนักเรียนลงทะเบียนใหม่',
        `นักเรียนลงทะเบียนคอร์ส "${enrollment.course.title}"`,
        'NEW_ENROLLMENT',
        `/teacher/courses/${courseId}`,
      )
    }

    return enrollment
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

  async getMaterial(userId: string, materialId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
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

    if (!material) {
      throw new NotFoundException('Material not found')
    }

    if (material.lesson.chapter.course.enrollments.length === 0) {
      throw new ForbiddenException('Not enrolled in this course')
    }

    return material
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
      const result = await this.prisma.progressLog.update({
        where: { id: existingProgress.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
      await updateEnrollmentProgress(
        this.prisma,
        studentProfile.id,
        lesson.chapter.course.id,
      );
      return result;
    }

    const result = await this.prisma.progressLog.create({
      data: {
        studentId: studentProfile.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
    await updateEnrollmentProgress(
      this.prisma,
      studentProfile.id,
      lesson.chapter.course.id,
    );
    return result;
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

    return prepareQuizForStudent(quiz)
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

    const revealAnswers = !!attempt.completedAt && attempt.quiz.showAnswers
    return {
      ...attempt,
      quiz: prepareQuizForStudent(attempt.quiz, { revealAnswers }),
    }
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

  async submitAssignment(userId: string, assignmentId: string, data: SubmitAssignmentDto) {
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

    if (!data.textAnswer?.trim() && !data.fileUrl) {
      throw new BadRequestException('textAnswer or fileUrl is required')
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
        textAnswer: data.textAnswer?.trim() || null,
        fileUrl: data.fileUrl,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
      update: {
        textAnswer: data.textAnswer?.trim() || null,
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

  async getPayment(userId: string, paymentId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const payment = await this.getPaymentRecord(paymentId)

    if (!payment) {
      throw new NotFoundException('Payment not found')
    }

    if (payment.studentId !== studentProfile.id) {
      throw new ForbiddenException('Not authorized to view this payment')
    }

    return this.buildPaymentCheckoutResponse(payment)
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
    let appliedCouponCode: string | undefined
    if (couponCode) {
      const coupon = await this.applyCoupon(couponCode)
      discount = Number(coupon.discount)
      appliedCouponCode = coupon.code
    }

    const price = Number(course.price)
    const { amount, amountInSmallestUnit } = calculatePaymentAmount(price, discount)
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        studentId: studentProfile.id,
        courseId,
        status: 'PENDING',
      },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    })

    for (const pendingPayment of pendingPayments) {
      const checkoutResponse = await this.buildPaymentCheckoutResponse(pendingPayment)

      if (checkoutResponse.payment.status === 'COMPLETED') {
        return checkoutResponse
      }

      if (
        checkoutResponse.payment.status === 'PENDING' &&
        checkoutResponse.clientSecret &&
        Number(checkoutResponse.payment.amount) === amount
      ) {
        return checkoutResponse
      }
    }

    await this.retirePendingPayments(studentProfile.id, courseId)

    // Create payment record first
    const payment = await this.prisma.payment.create({
      data: {
        studentId: studentProfile.id,
        courseId,
        amount,
        paymentMethod: this.stripe ? 'stripe' : 'mock',
        couponCode: appliedCouponCode,
      },
    })

    // If price is 0, mark as completed and enroll directly
    if (amount <= 0) {
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
        include: { course: true },
      })

      const enrollment = await this.prisma.enrollment.create({
        data: {
          courseId,
          studentId: studentProfile.id,
        },
        include: { course: true },
      })

      return {
        clientSecret: null,
        payment: updatedPayment,
        paymentIntentStatus: 'succeeded',
        checkoutMode: 'mock',
        enrollment,
      }
    }

    if (!this.stripe) {
      if (process.env.NODE_ENV === 'production') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        })
        throw new BadRequestException('Stripe payment is not configured for this environment')
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
        include: { course: true },
      })

      const enrollment = await this.prisma.enrollment.create({
        data: {
          courseId,
          studentId: studentProfile.id,
        },
        include: { course: true },
      })

      return {
        clientSecret: 'mock_secret_' + payment.id,
        payment: updatedPayment,
        paymentIntentStatus: 'succeeded',
        checkoutMode: 'mock',
        enrollment,
      }
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

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: paymentIntent.id,
      },
      include: { course: true },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      payment: updatedPayment,
      paymentIntentStatus: paymentIntent.status,
      checkoutMode: 'stripe',
    }
  }

  async confirmPayment(userId: string, paymentId: string, transactionId: string) {
    if (!canUseClientPaymentConfirmation(!!this.stripe)) {
      throw new BadRequestException('Client-side payment confirmation is disabled when Stripe is configured')
    }

    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    })

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found')
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { student: true, course: true },
    })

    if (!payment) {
      throw new NotFoundException('Payment not found')
    }

    if (payment.studentId !== studentProfile.id) {
      throw new ForbiddenException('Not authorized to confirm this payment')
    }

    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Payment already completed')
    }

    return this.finalizePayment(paymentId, transactionId)
  }

  async handlePaymentWebhook(body: { paymentId?: string; transactionId?: string; type?: string }) {
    if (!body.paymentId) {
      throw new BadRequestException('paymentId is required')
    }

    if (body.type && body.type !== 'payment.succeeded') {
      return { received: true, status: 'ignored' }
    }

    try {
      return await this.finalizePayment(
        body.paymentId,
        body.transactionId || `webhook-${body.paymentId}`,
      )
    } catch (error) {
      if (this.isNotCompletablePaymentError(error)) {
        return { received: true, status: 'ignored' }
      }
      throw error
    }
  }

  async handleStripeWebhook(signature: string | undefined, rawBody: Buffer) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured for this environment')
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured')
    }

    if (!signature) {
      throw new BadRequestException('Stripe signature header is required')
    }

    let event: Stripe.Event
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature')
    }

    return this.handleStripeWebhookEvent(event)
  }

  private async handleStripeWebhookEvent(event: Stripe.Event) {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const paymentId = paymentIntent.metadata?.paymentId
      if (!paymentId) {
        throw new BadRequestException('Stripe payment intent metadata.paymentId is required')
      }

      try {
        return await this.finalizePayment(paymentId, paymentIntent.id)
      } catch (error) {
        if (this.isNotCompletablePaymentError(error)) {
          return { received: true, status: 'ignored' }
        }
        throw error
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const paymentId = paymentIntent.metadata?.paymentId
      if (paymentId) {
        await this.prisma.payment.updateMany({
          where: { id: paymentId, status: 'PENDING' },
          data: {
            status: 'FAILED',
            transactionId: paymentIntent.id,
          },
        })
      }

      return { received: true, status: 'failed_recorded' }
    }

    return { received: true, status: 'ignored', type: event.type }
  }

  private async getPaymentRecord(paymentId: string) {
    return this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { course: true },
    })
  }

  private async buildPaymentCheckoutResponse(payment: PaymentRecord) {
    if (payment.status !== 'PENDING' || !this.stripe) {
      return {
        payment,
        clientSecret: null,
        paymentIntentStatus: payment.status === 'COMPLETED' ? 'succeeded' : null,
        checkoutMode: this.stripe ? 'history' : 'mock',
      }
    }

    if (!payment.transactionId) {
      await this.markPaymentFailed(payment.id)
      const failedPayment = await this.getPaymentRecord(payment.id)

      return {
        payment: failedPayment ?? payment,
        clientSecret: null,
        paymentIntentStatus: null,
        checkoutMode: 'stripe',
      }
    }

    let paymentIntent: Stripe.PaymentIntent
    try {
      paymentIntent = await this.stripe.paymentIntents.retrieve(payment.transactionId)
    } catch {
      await this.markPaymentFailed(payment.id, payment.transactionId)
      const failedPayment = await this.getPaymentRecord(payment.id)

      return {
        payment: failedPayment ?? payment,
        clientSecret: null,
        paymentIntentStatus: null,
        checkoutMode: 'stripe',
      }
    }

    if (paymentIntent.status === 'succeeded') {
      const finalized = await this.finalizePayment(payment.id, paymentIntent.id)
      const completedPayment = await this.getPaymentRecord(payment.id)

      return {
        payment: completedPayment ?? payment,
        clientSecret: null,
        paymentIntentStatus: paymentIntent.status,
        checkoutMode: 'stripe',
        enrollment: finalized.enrollment,
      }
    }

    if (ACTIVE_STRIPE_PAYMENT_STATUSES.has(paymentIntent.status)) {
      return {
        payment,
        clientSecret: paymentIntent.client_secret,
        paymentIntentStatus: paymentIntent.status,
        checkoutMode: 'stripe',
      }
    }

    await this.markPaymentFailed(payment.id, paymentIntent.id)
    const failedPayment = await this.getPaymentRecord(payment.id)

    return {
      payment: failedPayment ?? payment,
      clientSecret: null,
      paymentIntentStatus: paymentIntent.status,
      checkoutMode: 'stripe',
    }
  }

  private async retirePendingPayments(studentId: string, courseId: string) {
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        studentId,
        courseId,
        status: 'PENDING',
      },
    })

    if (pendingPayments.length === 0) {
      return
    }

    const idsToFail: string[] = []

    for (const pendingPayment of pendingPayments) {
      if (!this.stripe || !pendingPayment.transactionId) {
        idsToFail.push(pendingPayment.id)
        continue
      }

      let paymentIntent: Stripe.PaymentIntent
      try {
        paymentIntent = await this.stripe.paymentIntents.retrieve(pendingPayment.transactionId)
      } catch {
        idsToFail.push(pendingPayment.id)
        continue
      }

      if (paymentIntent.status === 'succeeded') {
        continue
      }

      if (ACTIVE_STRIPE_PAYMENT_STATUSES.has(paymentIntent.status)) {
        try {
          await this.stripe.paymentIntents.cancel(pendingPayment.transactionId)
          idsToFail.push(pendingPayment.id)
        } catch {
          continue
        }
        continue
      }

      idsToFail.push(pendingPayment.id)
    }

    if (idsToFail.length > 0) {
      await this.prisma.payment.updateMany({
        where: {
          id: { in: idsToFail },
          status: 'PENDING',
        },
        data: { status: 'FAILED' },
      })
    }
  }

  private async markPaymentFailed(paymentId: string, transactionId?: string | null) {
    return this.prisma.payment.updateMany({
      where: {
        id: paymentId,
        status: 'PENDING',
      },
      data: {
        status: 'FAILED',
        ...(transactionId ? { transactionId } : {}),
      },
    })
  }

  private isNotCompletablePaymentError(error: unknown) {
    return (
      error instanceof BadRequestException &&
      error.message === 'Payment is not in a completable state'
    )
  }

  private async finalizePayment(paymentId: string, transactionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      })

      if (!payment) {
        throw new NotFoundException('Payment not found')
      }

      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          courseId_studentId: {
            courseId: payment.courseId,
            studentId: payment.studentId,
          },
        },
        include: { course: true },
      })

      if (payment.status === 'COMPLETED') {
        if (existingEnrollment) {
          return { payment, enrollment: existingEnrollment }
        }

        const enrollment = await tx.enrollment.create({
          data: {
            courseId: payment.courseId,
            studentId: payment.studentId,
          },
          include: { course: true },
        })

        return { payment, enrollment }
      }

      if (payment.status !== 'PENDING') {
        throw new BadRequestException('Payment is not in a completable state')
      }

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          transactionId,
        },
      })

      if (payment.couponCode) {
        await tx.coupon.updateMany({
          where: { code: payment.couponCode },
          data: { usedCount: { increment: 1 } },
        })
      }

      if (existingEnrollment) {
        return { payment: updatedPayment, enrollment: existingEnrollment }
      }

      const enrollment = await tx.enrollment.create({
        data: {
          courseId: payment.courseId,
          studentId: payment.studentId,
        },
        include: { course: true },
      })

      return { payment: updatedPayment, enrollment }
    })
  }

  async getLiveClasses(userId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({ where: { userId } })
    if (!studentProfile) throw new NotFoundException('Student profile not found')

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: studentProfile.id },
      select: { courseId: true },
    })

    const courseIds = enrollments.map((e) => e.courseId)
    if (courseIds.length === 0) return []

    return this.prisma.liveClass.findMany({
      where: {
        courseId: { in: courseIds },
        status: { not: 'CANCELLED' },
        scheduledAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: {
        course: { include: { subject: true } },
        teacher: { include: { user: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })
  }
}
