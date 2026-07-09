import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { StudentService } from './student.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'
import { ConfirmPaymentDto } from './dto/confirm-payment.dto'
import { PaymentWebhookDto } from './dto/payment-webhook.dto'
import { SubmitAssignmentDto } from './dto/submit-assignment.dto'
import { StudentSignedUploadDto } from './dto/student-signed-upload.dto'
import { isAllowedUpload } from '../common/utils/file-upload'
import { StorageService } from '../storage/storage.service'

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
export class StudentController {
  constructor(
    private studentService: StudentService,
    private storageService: StorageService,
  ) {}

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

  @Get('materials/:id')
  async getMaterial(@Request() req, @Param('id') materialId: string) {
    return this.studentService.getMaterial(req.user.id, materialId)
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
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file) {
        cb(null, true)
        return
      }
      if (!isAllowedUpload(file as Express.Multer.File)) {
        cb(new BadRequestException('Only document/image/video uploads are allowed'), false)
        return
      }
      cb(null, true)
    },
  }))
  async submitAssignment(
    @Request() req,
    @Param('id') assignmentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SubmitAssignmentDto,
  ) {
    let fileUrl = body.fileUrl
    if (file) {
      fileUrl = await this.storageService.uploadMulterFile(file, 'submissions')
    }

    if (!body.textAnswer?.trim() && !fileUrl) {
      throw new BadRequestException('textAnswer or file is required')
    }

    const payload: SubmitAssignmentDto = {
      textAnswer: body.textAnswer?.trim() || undefined,
      fileUrl,
    }

    return this.studentService.submitAssignment(req.user.id, assignmentId, payload)
  }

  @Post('storage/signed-upload')
  async createSignedUpload(@Body() body: StudentSignedUploadDto) {
    if (body.folder && body.folder !== 'submissions') {
      throw new BadRequestException('Invalid upload folder')
    }

    return this.storageService.createUploadSignedUrl(
      'submissions',
      body.fileName,
      body.contentType || 'application/octet-stream',
    )
  }

  @Post('storage/signed-download')
  async createSignedDownload(@Body() body: { fileUrl?: string }) {
    if (!body.fileUrl) {
      throw new BadRequestException('fileUrl is required')
    }
    return this.storageService.createDownloadSignedUrl(body.fileUrl)
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

  @Get('payments/:id')
  async getPayment(@Request() req, @Param('id') paymentId: string) {
    return this.studentService.getPayment(req.user.id, paymentId)
  }

  @Post('courses/:id/payment-intent')
  async createPaymentIntent(
    @Request() req,
    @Param('id') courseId: string,
    @Body() body: CreatePaymentIntentDto,
  ) {
    return this.studentService.createPaymentIntent(req.user.id, courseId, body.couponCode)
  }

  @Post('payments/:id/confirm')
  async confirmPayment(@Request() req, @Param('id') paymentId: string, @Body() body: ConfirmPaymentDto) {
    return this.studentService.confirmPayment(req.user.id, paymentId, body.transactionId)
  }

  @Post('payments/webhook')
  async handlePaymentWebhook(@Body() body: PaymentWebhookDto) {
    return this.studentService.handlePaymentWebhook(body)
  }
}
