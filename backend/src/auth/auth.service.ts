import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { access_token: accessToken, user };
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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { access_token: accessToken, user };
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

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { access_token: accessToken, user };
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
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters')
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
    // Generate a simple reset token
    const token = randomBytes(32).toString('hex');
    // Save the token with 1 hour expiry
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
      },
    });
    // In a real app, send an email here!
    console.log(`Password reset token for ${email}: ${token}`);
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
    return { message: 'Password updated successfully' };
  }
}
