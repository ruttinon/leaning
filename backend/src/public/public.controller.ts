import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

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
}
