import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard()
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers()
  }

  @Get('students')
  async getStudents() {
    return this.adminService.getStudents()
  }

  @Get('teachers')
  async getTeachers() {
    return this.adminService.getTeachers()
  }

  @Get('teachers/pending')
  async getPendingTeachers() {
    return this.adminService.getPendingTeachers()
  }

  @Put('teachers/:id/approve')
  async approveTeacher(@Param('id') teacherId: string) {
    return this.adminService.approveTeacher(teacherId)
  }

  @Put('teachers/:id/reject')
  async rejectTeacher(@Param('id') teacherId: string, @Body() body: { rejectionReason: string }) {
    return this.adminService.rejectTeacher(teacherId, body.rejectionReason)
  }

  @Get('courses/pending')
  async getPendingCourses() {
    return this.adminService.getPendingCourses()
  }

  @Put('courses/:id/approve')
  async approveCourse(@Param('id') courseId: string) {
    return this.adminService.approveCourse(courseId)
  }

  @Put('courses/:id/reject')
  async rejectCourse(@Param('id') courseId: string, @Body() body: { rejectionReason: string }) {
    return this.adminService.rejectCourse(courseId, body.rejectionReason)
  }

  @Get('subjects')
  async getSubjects() {
    return this.adminService.getSubjects()
  }

  @Post('subjects')
  async createSubject(@Body() data: any) {
    return this.adminService.createSubject(data)
  }

  @Put('subjects/:id')
  async updateSubject(@Param('id') subjectId: string, @Body() data: any) {
    return this.adminService.updateSubject(subjectId, data)
  }

  @Delete('subjects/:id')
  async deleteSubject(@Param('id') subjectId: string) {
    return this.adminService.deleteSubject(subjectId)
  }

  @Get('coupons')
  async getCoupons() {
    return this.adminService.getCoupons()
  }

  @Post('coupons')
  async createCoupon(@Body() data: any) {
    return this.adminService.createCoupon(data)
  }

  @Put('coupons/:id')
  async updateCoupon(@Param('id') couponId: string, @Body() data: any) {
    return this.adminService.updateCoupon(couponId, data)
  }

  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') couponId: string) {
    return this.adminService.deleteCoupon(couponId)
  }

  @Get('announcements')
  async getAnnouncements() {
    return this.adminService.getAnnouncements()
  }

  @Post('announcements')
  async createAnnouncement(@Body() data: any) {
    return this.adminService.createAnnouncement(data)
  }

  @Put('announcements/:id')
  async updateAnnouncement(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAnnouncement(id, data)
  }

  @Delete('announcements/:id')
  async deleteAnnouncement(@Param('id') id: string) {
    return this.adminService.deleteAnnouncement(id)
  }
}
