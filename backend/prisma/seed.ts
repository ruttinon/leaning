import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Delete existing demo users if exist
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@example.com', 'teacher@example.com', 'student@example.com'],
      },
    },
  })

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin1234', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  // Create teacher user
  const hashedTeacherPassword = await bcrypt.hash('teacher1234', 10)
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: hashedTeacherPassword,
      firstName: 'Ajarn',
      lastName: 'Demo',
      role: 'TEACHER',
    },
  })

  const teacher = await prisma.teacherProfile.create({
    data: {
      userId: teacherUser.id,
      bio: 'ครูสอนวิชาคณิตศาสตร์และวิทยาศาสตร์',
      qualifications: 'ปริญญาโท คณะศึกษาศาสตร์',
      status: 'APPROVED',
    },
  })

  // Create student user
  const hashedStudentPassword = await bcrypt.hash('student1234', 10)
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: hashedStudentPassword,
      firstName: 'Nong',
      lastName: 'Demo',
      role: 'STUDENT',
    },
  })

  const student = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      bio: 'นักเรียนชั้นมัธยมศึกษาปีที่ 5',
    },
  })

  // Create some sample subjects
  const existingSubjects = await prisma.subject.findMany()
  if (existingSubjects.length === 0) {
    await prisma.subject.createMany({
      data: [
        { name: 'คณิตศาสตร์', description: 'วิชาคณิตศาสตร์' },
        { name: 'วิทยาศาสตร์', description: 'วิชาวิทยาศาสตร์' },
        { name: 'ภาษาไทย', description: 'วิชาภาษาไทย' },
        { name: 'English', description: 'English subject' },
      ],
    })
  }

  const subjects = await prisma.subject.findMany()

  // Create sample course for teacher
  await prisma.course.create({
    data: {
      title: 'คณิตศาสตร์ ม.5 เทอม 1',
      description: 'คอร์สเรียนคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 5 เทอมที่ 1',
      subjectId: subjects[0].id,
      teacherId: teacher.id,
      price: 0,
      status: 'PUBLISHED',
    },
  })

  console.log({ admin, teacher, student })
  console.log('✅ Seed data created successfully!')
  console.log('')
  console.log('📝 Demo Accounts:')
  console.log('  Admin   : admin@example.com / admin1234')
  console.log('  Teacher : teacher@example.com / teacher1234')
  console.log('  Student : student@example.com / student1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
