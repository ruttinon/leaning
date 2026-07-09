import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/services/notification.service';
import { sendContactEmail } from '../common/utils/mailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async getSubjects() {
    return this.prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getSubjectById(id: string) {
    return this.prisma.subject.findUnique({
      where: { id, isActive: true },
      include: {
        courses: {
          where: { status: 'PUBLISHED' },
          include: {
            teacher: {
              include: { user: true },
            },
          },
        },
      },
    });
  }

  async getCourses() {
    return this.prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        subject: true,
        teacher: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseById(id: string) {
    return this.prisma.course.findUnique({
      where: { id, status: 'PUBLISHED' },
      include: {
        subject: true,
        teacher: {
          include: { user: true },
        },
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  async getTeachers() {
    return this.prisma.teacherProfile.findMany({
      where: { status: 'APPROVED' },
      include: { user: true },
    });
  }

  async getTeacherById(id: string) {
    return this.prisma.teacherProfile.findUnique({
      where: { id, status: 'APPROVED' },
      include: {
        user: true,
        courses: {
          where: { status: 'PUBLISHED' },
        },
      },
    });
  }

  async getAnnouncements() {
    return this.prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFeaturedCourses(limit = 6) {
    return this.prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async submitContact(dto: ContactDto) {
    const inquiry = await this.prisma.contactInquiry.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      },
    });

    await sendContactEmail(dto);
    await this.notificationService.notifyAdmins(
      'ข้อความติดต่อใหม่',
      `${dto.name}: ${dto.subject}`,
      'CONTACT',
      '/admin/contacts',
    );

    return { message: 'ข้อความของคุณถูกส่งเรียบร้อยแล้ว', id: inquiry.id };
  }
}
