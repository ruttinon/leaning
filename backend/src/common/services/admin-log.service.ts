import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AdminLogService {
  constructor(private prisma: PrismaService) {}

  async log(
    adminId: string,
    action: string,
    target?: string,
    targetId?: string,
    details?: string,
  ) {
    return this.prisma.adminLog.create({
      data: { adminId, action, target, targetId, details },
    })
  }
}
