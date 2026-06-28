import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { PublicModule } from './public/public.module'
import { StudentModule } from './student/student.module'
import { TeacherModule } from './teacher/teacher.module'
import { AdminModule } from './admin/admin.module'

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    PublicModule,
    StudentModule,
    TeacherModule,
    AdminModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      serveRoot: '/',
      exclude: ['/api*', '/auth*', '/public*', '/student*', '/teacher*', '/admin*', '/uploads*'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
