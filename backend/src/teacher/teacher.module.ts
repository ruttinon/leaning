import { Module } from '@nestjs/common'
import { TeacherController } from './teacher.controller'
import { TeacherService } from './teacher.service'
import { PrismaModule } from '../prisma/prisma.module'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
