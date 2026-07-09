import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [StudentModule],
  providers: [PublicService, PrismaService],
  controllers: [PublicController],
  exports: [PublicService],
})
export class PublicModule {}
