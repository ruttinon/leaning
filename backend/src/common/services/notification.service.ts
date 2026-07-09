import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async notifyUser(
    userId: string,
    title: string,
    message: string,
    type: string,
    linkUrl?: string,
  ) {
    return this.prisma.notification.create({
      data: { userId, title, message, type, linkUrl },
    })
  }

  async notifyAdmins(title: string, message: string, type: string, linkUrl?: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    })

    if (admins.length === 0) return []

    return this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title,
        message,
        type,
        linkUrl,
      })),
    })
  }
}
