import { PrismaService } from '../../prisma/prisma.service'

export async function updateEnrollmentProgress(
  prisma: PrismaService,
  studentId: string,
  courseId: string,
) {
  const totalLessons = await prisma.lesson.count({
    where: { chapter: { courseId } },
  })

  if (totalLessons === 0) return

  const completedLessons = await prisma.progressLog.count({
    where: {
      studentId,
      isCompleted: true,
      lesson: { chapter: { courseId } },
    },
  })

  const progress = Math.round((completedLessons / totalLessons) * 100)

  await prisma.enrollment.updateMany({
    where: { studentId, courseId },
    data: {
      progress,
      completedAt: progress >= 100 ? new Date() : null,
    },
  })
}
