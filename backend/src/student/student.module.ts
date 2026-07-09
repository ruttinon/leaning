import { Module } from '@nestjs/common'
import { StudentController } from './student.controller'
import { StudentService } from './student.service'
import { PrismaModule } from '../prisma/prisma.module'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
