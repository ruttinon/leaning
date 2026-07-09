import { Controller, Post, Body, Get, Put, UseGuards, Request, UseInterceptors, UploadedFile, Param, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { isAllowedImageUpload } from '../common/utils/file-upload';
import { StorageService } from '../storage/storage.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
  ) {}

  @Post('register/student')
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('register/teacher')
  async registerTeacher(@Body() dto: RegisterTeacherDto) {
    return this.authService.registerTeacher(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body() data: any) {
    return this.authService.updateProfile(req.user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!isAllowedImageUpload(file as Express.Multer.File)) {
        cb(new BadRequestException('Only image uploads are allowed'), false);
        return;
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const avatarUrl = await this.storageService.uploadMulterFile(file, 'avatars')

    return this.authService.updateProfile(req.user.id, {
      avatarUrl
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/password')
  async changePassword(@Request() req, @Body() body: { currentPassword: string, newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/notifications')
  async getNotifications(@Request() req) {
    return this.authService.getNotifications(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/notifications/:id/read')
  async markNotificationAsRead(@Param('id') id: string, @Request() req) {
    return this.authService.markNotificationAsRead(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/notifications/read-all')
  async markAllNotificationsAsRead(@Request() req) {
    return this.authService.markAllNotificationsAsRead(req.user.id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
