import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationService } from '../common/services/notification.service'
import { AdminLogService } from '../common/services/admin-log.service'
import { paginate, paginationArgs } from '../common/dto/pagination.dto'

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private adminLogService: AdminLogService,
  ) {}

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
    const newContacts = await this.prisma.contactInquiry.count({
      where: { status: 'NEW' },
    })

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
      newContacts,
    }
  }

  async getUsers(page = 1, limit = 20) {
    const { skip, take, page: p, limit: l } = paginationArgs(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        include: { studentProfile: true, teacherProfile: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count(),
    ])
    return paginate(data, total, p, l)
  }

  async getStudents(page = 1, limit = 20) {
    const { skip, take, page: p, limit: l } = paginationArgs(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.studentProfile.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.studentProfile.count(),
    ])
    return paginate(data, total, p, l)
  }

  async getTeachers(page = 1, limit = 20) {
    const { skip, take, page: p, limit: l } = paginationArgs(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.teacherProfile.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.teacherProfile.count(),
    ])
    return paginate(data, total, p, l)
  }

  async getPendingTeachers() {
    return this.prisma.teacherProfile.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async approveTeacher(teacherId: string, adminId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: { user: true },
    })

    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    const updated = await this.prisma.teacherProfile.update({
      where: { id: teacherId },
      data: { status: 'APPROVED' },
      include: { user: true },
    })

    await this.notificationService.notifyUser(
      teacher.userId,
      'บัญชีครูได้รับการอนุมัติ',
      'ยินดีด้วย! คุณสามารถสร้างและจัดการคอร์สได้แล้ว',
      'TEACHER_APPROVED',
      '/teacher/dashboard',
    )

    await this.adminLogService.log(
      adminId,
      'APPROVE_TEACHER',
      'TeacherProfile',
      teacherId,
      teacher.user.email,
    )

    return updated
  }

  async rejectTeacher(teacherId: string, rejectionReason: string, adminId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: { user: true },
    })

    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    const updated = await this.prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
      include: { user: true },
    })

    await this.notificationService.notifyUser(
      teacher.userId,
      'บัญชีครูไม่ได้รับการอนุมัติ',
      rejectionReason || 'กรุณาติดต่อผู้ดูแลระบบเพื่อสอบถามรายละเอียด',
      'TEACHER_REJECTED',
      '/teacher/profile',
    )

    await this.adminLogService.log(
      adminId,
      'REJECT_TEACHER',
      'TeacherProfile',
      teacherId,
      rejectionReason,
    )

    return updated
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

  async approveCourse(courseId: string, adminId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { teacher: { include: { user: true } } },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    const updated = await this.prisma.course.update({
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

    await this.notificationService.notifyUser(
      course.teacher.userId,
      'คอร์สได้รับการอนุมัติ',
      `คอร์ส "${course.title}" ถูกเผยแพร่แล้ว`,
      'COURSE_APPROVED',
      `/teacher/courses/${courseId}`,
    )

    await this.adminLogService.log(
      adminId,
      'APPROVE_COURSE',
      'Course',
      courseId,
      course.title,
    )

    return updated
  }

  async rejectCourse(courseId: string, rejectionReason: string, adminId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { teacher: { include: { user: true } } },
    })

    if (!course) {
      throw new NotFoundException('Course not found')
    }

    const updated = await this.prisma.course.update({
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

    await this.notificationService.notifyUser(
      course.teacher.userId,
      'คอร์สไม่ได้รับการอนุมัติ',
      rejectionReason || `คอร์ส "${course.title}" ต้องแก้ไขก่อนส่งอนุมัติอีกครั้ง`,
      'COURSE_REJECTED',
      `/teacher/courses/${courseId}`,
    )

    await this.adminLogService.log(
      adminId,
      'REJECT_COURSE',
      'Course',
      courseId,
      rejectionReason,
    )

    return updated
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

  async getContactInquiries(page = 1, limit = 20) {
    const { skip, take, page: p, limit: l } = paginationArgs(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.contactInquiry.count(),
    ])
    return paginate(data, total, p, l)
  }
}
