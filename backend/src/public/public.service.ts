import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

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
}
