import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { TeacherService } from './teacher.service'
import { buildUploadFilename, isAllowedImageUpload } from '../common/utils/file-upload'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER')
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.teacherService.getDashboard(req.user.id)
  }

  @Get('courses')
  async getCourses(@Request() req) {
    return this.teacherService.getCourses(req.user.id)
  }

  @Get('courses/:id')
  async getCourse(@Request() req, @Param('id') courseId: string) {
    return this.teacherService.getCourse(req.user.id, courseId)
  }

  @Post('courses')
  async createCourse(@Request() req, @Body() data: any) {
    return this.teacherService.createCourse(req.user.id, data)
  }

  @Post('courses/:id/thumbnail')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => cb(null, buildUploadFilename(file.originalname)),
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!isAllowedImageUpload(file as Express.Multer.File)) {
        cb(new BadRequestException('Only image uploads are allowed for course thumbnails'), false)
        return
      }
      cb(null, true)
    },
  }))
  async uploadCourseThumbnail(@Request() req, @Param('id') courseId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required')
    }
    return this.teacherService.updateCourseThumbnail(req.user.id, courseId, `/uploads/${file.filename}`)
  }

  @Put('courses/:id')
  async updateCourse(@Request() req, @Param('id') courseId: string, @Body() data: any) {
    return this.teacherService.updateCourse(req.user.id, courseId, data)
  }

  @Post('courses/:id/submit-review')
  async submitCourseForReview(@Request() req, @Param('id') courseId: string) {
    return this.teacherService.submitCourseForReview(req.user.id, courseId)
  }

  @Post('courses/:id/chapters')
  async createChapter(@Request() req, @Param('id') courseId: string, @Body() data: any) {
    return this.teacherService.createChapter(req.user.id, courseId, data)
  }

  @Put('chapters/:id')
  async updateChapter(@Request() req, @Param('id') chapterId: string, @Body() data: any) {
    return this.teacherService.updateChapter(req.user.id, chapterId, data)
  }

  @Delete('chapters/:id')
  async deleteChapter(@Request() req, @Param('id') chapterId: string) {
    return this.teacherService.deleteChapter(req.user.id, chapterId)
  }

  @Get('lessons/:id')
  async getLesson(@Request() req, @Param('id') lessonId: string) {
    return this.teacherService.getLesson(req.user.id, lessonId)
  }

  @Post('chapters/:id/lessons')
  async createLesson(@Request() req, @Param('id') chapterId: string, @Body() data: any) {
    return this.teacherService.createLesson(req.user.id, chapterId, data)
  }

  @Put('lessons/:id')
  async updateLesson(@Request() req, @Param('id') lessonId: string, @Body() data: any) {
    return this.teacherService.updateLesson(req.user.id, lessonId, data)
  }

  @Delete('lessons/:id')
  async deleteLesson(@Request() req, @Param('id') lessonId: string) {
    return this.teacherService.deleteLesson(req.user.id, lessonId)
  }

  @Post('lessons/:id/materials')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, buildUploadFilename(file.originalname))
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!isAllowedUpload(file as Express.Multer.File)) {
        cb(new BadRequestException('Only document/image/video uploads are allowed'), false);
        return;
      }
      cb(null, true);
    },
  }))
  async createMaterial(@Request() req, @Param('id') lessonId: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.teacherService.createMaterial(req.user.id, lessonId, {
      ...body,
      fileUrl: file ? `/uploads/${file.filename}` : body.fileUrl
    })
  }

  @Post('lessons/:id/quizzes')
  async createQuiz(@Request() req, @Param('id') lessonId: string, @Body() data: any) {
    return this.teacherService.createQuiz(req.user.id, lessonId, data)
  }

  @Get('quizzes/:id')
  async getQuiz(@Request() req, @Param('id') quizId: string) {
    return this.teacherService.getQuiz(req.user.id, quizId)
  }

  @Put('quizzes/:id')
  async updateQuiz(@Request() req, @Param('id') quizId: string, @Body() data: any) {
    return this.teacherService.updateQuiz(req.user.id, quizId, data)
  }

  @Delete('quizzes/:id')
  async deleteQuiz(@Request() req, @Param('id') quizId: string) {
    return this.teacherService.deleteQuiz(req.user.id, quizId)
  }

  @Post('quizzes/:id/questions')
  async createQuestion(@Request() req, @Param('id') quizId: string, @Body() data: any) {
    return this.teacherService.createQuestion(req.user.id, quizId, data)
  }

  @Put('questions/:id')
  async updateQuestion(@Request() req, @Param('id') questionId: string, @Body() data: any) {
    return this.teacherService.updateQuestion(req.user.id, questionId, data)
  }

  @Delete('questions/:id')
  async deleteQuestion(@Request() req, @Param('id') questionId: string) {
    return this.teacherService.deleteQuestion(req.user.id, questionId)
  }

  @Post('lessons/:id/assignments')
  async createAssignment(@Request() req, @Param('id') lessonId: string, @Body() data: any) {
    return this.teacherService.createAssignment(req.user.id, lessonId, data)
  }

  @Get('submissions')
  async getSubmissions(@Request() req) {
    return this.teacherService.getSubmissions(req.user.id)
  }

  @Put('submissions/:id/grade')
  async gradeSubmission(@Request() req, @Param('id') submissionId: string, @Body() data: any) {
    return this.teacherService.gradeSubmission(req.user.id, submissionId, data)
  }

  @Get('gradebook/:courseId')
  async getGradebook(@Request() req, @Param('courseId') courseId: string) {
    return this.teacherService.getGradebook(req.user.id, courseId)
  }

  @Get('materials')
  async getMaterials(@Request() req) {
    return this.teacherService.getMaterials(req.user.id)
  }

  @Get('quizzes')
  async getQuizzes(@Request() req) {
    return this.teacherService.getQuizzes(req.user.id)
  }

  @Get('exams')
  async getExams(@Request() req) {
    return this.teacherService.getExams(req.user.id)
  }

  @Get('assignments')
  async getAssignments(@Request() req) {
    return this.teacherService.getAssignments(req.user.id)
  }

  @Get('students')
  async getStudents(@Request() req) {
    return this.teacherService.getStudents(req.user.id)
  }
}
