import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/services/notification.service';
import { sendPasswordResetEmail } from '../common/utils/mailer';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  async registerStudent(dto: RegisterStudentDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'STUDENT',
        studentProfile: {
          create: {
            phone: dto.phone,
            school: dto.school,
            grade: dto.grade,
          },
        },
      },
      include: { studentProfile: true },
    });

    return this.issueAuthResponse(user);
  }

  async registerTeacher(dto: RegisterTeacherDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'TEACHER',
        teacherProfile: {
          create: {
            bio: dto.bio,
            phone: dto.phone,
            qualifications: dto.qualifications,
            experience: dto.experience,
            specialization: dto.specialization,
          },
        },
      },
      include: { teacherProfile: true },
    });

    await this.notificationService.notifyAdmins(
      'ครูใหม่สมัครสมาชิก',
      `${user.firstName} ${user.lastName} สมัครเป็นครูและรอการอนุมัติ`,
      'TEACHER_REGISTRATION',
      '/admin/teacher-approvals',
    );

    return this.issueAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueAuthResponse(user);
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: { studentProfile: true, teacherProfile: true },
        },
      },
    });

    if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueAuthResponse(stored.user);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return { message: 'Logged out successfully' };
  }

  private async issueAuthResponse(user: any) {
    const tokens = await this.createTokenPair(user.id, user.email, user.role);
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  private async createTokenPair(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = randomBytes(48).toString('hex');
    const refreshDays = Number(process.env.REFRESH_TOKEN_DAYS || 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refresh_token,
        expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token, refresh_token };
  }

  private async revokeUserRefreshTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });
  }

  async updateProfile(userId: string, data: any) {
    // Check if username is being updated and is unique
    if (data.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId },
        },
      });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    // Separate user data and profile data
    const userData: any = {};
    const studentProfileData: any = {};
    const teacherProfileData: any = {};

    if (data.firstName) userData.firstName = data.firstName;
    if (data.lastName) userData.lastName = data.lastName;
    if (data.username) userData.username = data.username;

    if (data.bio) studentProfileData.bio = data.bio;
    if (data.phone) studentProfileData.phone = data.phone;
    if (data.address) studentProfileData.address = data.address;
    if (data.school) studentProfileData.school = data.school;
    if (data.grade) studentProfileData.grade = data.grade;
    if (data.avatarUrl) studentProfileData.avatarUrl = data.avatarUrl;

    if (data.bio) teacherProfileData.bio = data.bio;
    if (data.phone) teacherProfileData.phone = data.phone;
    if (data.address) teacherProfileData.address = data.address;
    if (data.qualifications) teacherProfileData.qualifications = data.qualifications;
    if (data.experience) teacherProfileData.experience = data.experience;
    if (data.specialization) teacherProfileData.specialization = data.specialization;
    if (data.avatarUrl) teacherProfileData.avatarUrl = data.avatarUrl;

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: userData,
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    // Update profile based on role
    if (updatedUser.role === 'STUDENT' && Object.keys(studentProfileData).length > 0) {
      await this.prisma.studentProfile.update({
        where: { userId },
        data: studentProfileData,
      });
    }

    if (updatedUser.role === 'TEACHER' && Object.keys(teacherProfileData).length > 0) {
      await this.prisma.teacherProfile.update({
        where: { userId },
        data: teacherProfileData,
      });
    }

    // Refetch to get updated data
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    await this.revokeUserRefreshTokens(userId);

    return { message: 'Password updated successfully' };
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return { message: 'If the email exists, a password reset link has been sent.' };
    }
    const token = randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 3600000),
      },
    });

    const resetUrl = `${process.env.APP_URL || 'http://localhost:8080'}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    await this.revokeUserRefreshTokens(user.id);
    return { message: 'Password updated successfully' };
  }
}
