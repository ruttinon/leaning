import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const totalUsers = await this.prisma.user.count()
    const totalStudents = await this.prisma.studentProfile.count()
    const totalTeachers = await this.prisma.teacherProfile.count()
    const approvedTeachers = await this.prisma.teacherProfile.count({
      where: { status: 'APPROVED' },
    })
    const pendingTeachers = await this.prisma.teacherProfile.count({
      where: { status: 'PENDING_REVIEW' },
    })
    const totalCourses = await this.prisma.course.count()
    const publishedCourses = await this.prisma.course.count({
      where: { status: 'PUBLISHED' },
    })
    const pendingCourses = await this.prisma.course.count({
      where: { status: 'PENDING_REVIEW' },
    })
    const totalEnrollments = await this.prisma.enrollment.count()

    return {
      totalUsers,
      totalStudents,
      totalTeachers,
      approvedTeachers,
      pendingTeachers,
      totalCourses,
      publishedCourses,
      pendingCourses,
      totalEnrollments,
    }
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getStudents() {
    return this.prisma.studentProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getTeachers() {
    return this.prisma.teacherProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getPendingTeachers() {
    return this.prisma.teacherProfile.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async approveTeacher(teacherId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    })

    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    return this.prisma.teacherProfile.update({
      where: { id: teacherId },
      data: { status: 'APPROVED' },
      include: { user: true },
    })
  }

  async rejectTeacher(teacherId: string, rejectionReason: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    })

    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    return this.prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
      include: { user: true },
    })
  }

  async getPendingCourses() {
    return this.prisma.course.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        teacher: {
          include: { user: true },
        },
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async approveCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        teacher: {
          include: { user: true },
        },
        subject: true,
      },
    })
  }

  async rejectCourse(courseId: string, rejectionReason: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
      include: {
        teacher: {
          include: { user: true },
        },
        subject: true,
      },
    })
  }

  async getSubjects() {
    return this.prisma.subject.findMany({
      orderBy: { order: 'asc' },
    })
  }

  async createSubject(data: any) {
    return this.prisma.subject.create({
      data,
    })
  }

  async updateSubject(subjectId: string, data: any) {
    return this.prisma.subject.update({
      where: { id: subjectId },
      data,
    })
  }

  async deleteSubject(subjectId: string) {
    return this.prisma.subject.delete({
      where: { id: subjectId },
    })
  }

  async getCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async createCoupon(data: any) {
    return this.prisma.coupon.create({
      data,
    })
  }

  async updateCoupon(couponId: string, data: any) {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data,
    })
  }

  async deleteCoupon(couponId: string) {
    return this.prisma.coupon.delete({
      where: { id: couponId },
    })
  }

  async getAnnouncements() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async createAnnouncement(data: any) {
    return this.prisma.announcement.create({
      data,
    })
  }

  async updateAnnouncement(announcementId: string, data: any) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    })
    if (!announcement) {
      throw new NotFoundException('Announcement not found')
    }
    return this.prisma.announcement.update({
      where: { id: announcementId },
      data,
    })
  }

  async deleteAnnouncement(announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    })
    if (!announcement) {
      throw new NotFoundException('Announcement not found')
    }
    return this.prisma.announcement.delete({
      where: { id: announcementId },
    })
  }
}
