import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common'
import { StudentService } from './student.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.studentService.getDashboard(req.user.id)
  }

  @Get('courses')
  async getMyCourses(@Request() req) {
    return this.studentService.getMyCourses(req.user.id)
  }

  @Post('courses/:id/enroll')
  async enrollCourse(@Request() req, @Param('id') courseId: string) {
    return this.studentService.enrollCourse(req.user.id, courseId)
  }

  @Get('courses/:id')
  async getCourseDetail(@Request() req, @Param('id') courseId: string) {
    return this.studentService.getCourseDetail(req.user.id, courseId)
  }

  @Get('lessons/:id')
  async getLessonDetail(@Request() req, @Param('id') lessonId: string) {
    return this.studentService.getLessonDetail(req.user.id, lessonId)
  }

  @Post('lessons/:id/complete')
  async completeLesson(@Request() req, @Param('id') lessonId: string) {
    return this.studentService.completeLesson(req.user.id, lessonId)
  }

  @Get('quizzes/:id')
  async getQuiz(@Request() req, @Param('id') quizId: string) {
    return this.studentService.getQuiz(req.user.id, quizId)
  }

  @Post('quizzes/:id/attempts')
  async startQuizAttempt(@Request() req, @Param('id') quizId: string) {
    return this.studentService.startQuizAttempt(req.user.id, quizId)
  }

  @Get('quiz-attempts/:id')
  async getQuizAttempt(@Request() req, @Param('id') attemptId: string) {
    return this.studentService.getQuizAttempt(req.user.id, attemptId)
  }

  @Post('quiz-attempts/:id/submit')
  async submitQuizAttempt(@Request() req, @Param('id') attemptId: string, @Body() data: any) {
    return this.studentService.submitQuizAttempt(req.user.id, attemptId, data)
  }

  @Get('assignments/:id')
  async getAssignment(@Request() req, @Param('id') assignmentId: string) {
    return this.studentService.getAssignment(req.user.id, assignmentId)
  }

  @Post('assignments/:id/submit')
  async submitAssignment(@Request() req, @Param('id') assignmentId: string, @Body() data: any) {
    return this.studentService.submitAssignment(req.user.id, assignmentId, data)
  }

  @Get('scores')
  async getScores(@Request() req) {
    return this.studentService.getScores(req.user.id)
  }

  @Get('progress')
  async getProgress(@Request() req) {
    return this.studentService.getProgress(req.user.id)
  }

  @Get('payments')
  async getMyPayments(@Request() req) {
    return this.studentService.getMyPayments(req.user.id)
  }

  @Post('courses/:id/payment-intent')
  async createPaymentIntent(
    @Request() req,
    @Param('id') courseId: string,
    @Body() body: { couponCode?: string },
  ) {
    return this.studentService.createPaymentIntent(req.user.id, courseId, body.couponCode)
  }

  @Post('payments/:id/confirm')
  async confirmPayment(@Request() req, @Param('id') paymentId: string, @Body() body: { transactionId: string }) {
    return this.studentService.confirmPayment(req.user.id, paymentId, body.transactionId)
  }

  @Post('payments/webhook')
  async handlePaymentWebhook(@Body() body: { paymentId?: string; transactionId?: string; type?: string }) {
    return this.studentService.handlePaymentWebhook(body)
  }
}
