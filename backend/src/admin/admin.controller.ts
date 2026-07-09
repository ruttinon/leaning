import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { PaginationQueryDto } from '../common/dto/pagination.dto'

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
  async getUsers(@Query() query: PaginationQueryDto) {
    return this.adminService.getUsers(query.page, query.limit)
  }

  @Get('students')
  async getStudents(@Query() query: PaginationQueryDto) {
    return this.adminService.getStudents(query.page, query.limit)
  }

  @Get('teachers')
  async getTeachers(@Query() query: PaginationQueryDto) {
    return this.adminService.getTeachers(query.page, query.limit)
  }

  @Get('teachers/pending')
  async getPendingTeachers() {
    return this.adminService.getPendingTeachers()
  }

  @Put('teachers/:id/approve')
  async approveTeacher(@Request() req, @Param('id') teacherId: string) {
    return this.adminService.approveTeacher(teacherId, req.user.id)
  }

  @Put('teachers/:id/reject')
  async rejectTeacher(
    @Request() req,
    @Param('id') teacherId: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.adminService.rejectTeacher(teacherId, body.rejectionReason, req.user.id)
  }

  @Get('courses/pending')
  async getPendingCourses() {
    return this.adminService.getPendingCourses()
  }

  @Put('courses/:id/approve')
  async approveCourse(@Request() req, @Param('id') courseId: string) {
    return this.adminService.approveCourse(courseId, req.user.id)
  }

  @Put('courses/:id/reject')
  async rejectCourse(
    @Request() req,
    @Param('id') courseId: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.adminService.rejectCourse(courseId, body.rejectionReason, req.user.id)
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

  @Get('contacts')
  async getContactInquiries(@Query() query: PaginationQueryDto) {
    return this.adminService.getContactInquiries(query.page, query.limit)
  }
}
