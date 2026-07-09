import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Query, Req } from '@nestjs/common';
import { PublicService } from './public.service';
import { StudentService } from '../student/student.service';
import { ContactDto } from './dto/contact.dto';

@Controller('public')
export class PublicController {
  constructor(
    private publicService: PublicService,
    private studentService: StudentService,
  ) {}

  @Get('subjects')
  async getSubjects() {
    return this.publicService.getSubjects();
  }

  @Get('subjects/:id')
  async getSubjectById(@Param('id') id: string) {
    return this.publicService.getSubjectById(id);
  }

  @Get('courses')
  async getCourses() {
    return this.publicService.getCourses();
  }

  @Get('courses/:id')
  async getCourseById(@Param('id') id: string) {
    return this.publicService.getCourseById(id);
  }

  @Get('teachers')
  async getTeachers() {
    return this.publicService.getTeachers();
  }

  @Get('teachers/:id')
  async getTeacherById(@Param('id') id: string) {
    return this.publicService.getTeacherById(id);
  }

  @Get('announcements')
  async getAnnouncements() {
    return this.publicService.getAnnouncements();
  }

  @Get('courses/featured')
  async getFeaturedCourses(@Query('limit') limit?: string) {
    const parsed = limit ? Number(limit) : 6;
    return this.publicService.getFeaturedCourses(Number.isFinite(parsed) ? parsed : 6);
  }

  @Post('contact')
  async submitContact(@Body() dto: ContactDto) {
    return this.publicService.submitContact(dto);
  }

  @Post('payments/webhook/stripe')
  async handleStripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature?: string,
  ) {
    const rawBody = req.rawBody as Buffer | undefined
    if (!rawBody || rawBody.length === 0) {
      throw new BadRequestException('Stripe webhook requires raw request body')
    }

    return this.studentService.handleStripeWebhook(signature, rawBody)
  }
}
