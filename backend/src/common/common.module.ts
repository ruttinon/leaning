import { Global, Module } from '@nestjs/common'
import { NotificationService } from './services/notification.service'
import { AdminLogService } from './services/admin-log.service'
import { PrismaModule } from '../prisma/prisma.module'

@Global()
@Module({
  imports: [PrismaModule],
  providers: [NotificationService, AdminLogService],
  exports: [NotificationService, AdminLogService],
})
export class CommonModule {}
