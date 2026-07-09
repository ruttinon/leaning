import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const isProduction = process.env.NODE_ENV === 'production'
const seedDemo = process.env.SEED_DEMO_ACCOUNTS !== 'false'

async function main() {
  if (isProduction && !seedDemo) {
    console.log('Skipping demo seed in production (set SEED_DEMO_ACCOUNTS=true to override)')
    return
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || (isProduction ? 'ChangeMe!Admin2026' : 'admin1234')
  const teacherPassword = process.env.SEED_TEACHER_PASSWORD || (isProduction ? 'ChangeMe!Teacher2026' : 'teacher1234')
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || (isProduction ? 'ChangeMe!Student2026' : 'student1234')

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@example.com', 'teacher@example.com', 'student@example.com'],
      },
    },
  })

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  const hashedTeacherPassword = await bcrypt.hash(teacherPassword, 10)
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

  const hashedStudentPassword = await bcrypt.hash(studentPassword, 10)
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

  const demoCourses = [
    {
      title: 'คณิตศาสตร์ ม.5 เทอม 1',
      description: 'คอร์สเรียนคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 5 เทอมที่ 1',
      subjectId: subjects[0]?.id,
      price: 0,
    },
    {
      title: 'วิทยาศาสตร์ ม.4 เทอม 2',
      description: 'ทบทวนและฝึกโจทย์วิทยาศาสตร์ ม.4 ครบทุกบทสำคัญ',
      subjectId: subjects[1]?.id ?? subjects[0]?.id,
      price: 990,
    },
    {
      title: 'ภาษาไทย การอ่านจับใจความ',
      description: 'เทคนิคการอ่านจับใจความและการเขียนเรียงความ',
      subjectId: subjects[2]?.id ?? subjects[0]?.id,
      price: 0,
    },
    {
      title: 'English Conversation Basics',
      description: 'พูดอังกฤษในชีวิตประจำวัน พร้อมแบบฝึกหัด',
      subjectId: subjects[3]?.id ?? subjects[0]?.id,
      price: 1290,
    },
  ]

  for (const course of demoCourses) {
    if (!course.subjectId) continue
    const exists = await prisma.course.findFirst({
      where: { teacherId: teacher.id, title: course.title },
    })
    if (!exists) {
      await prisma.course.create({
        data: {
          title: course.title,
          description: course.description,
          subjectId: course.subjectId,
          teacherId: teacher.id,
          price: course.price,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          level: 'BEGINNER',
        },
      })
    }
  }

  const primaryCourse = await prisma.course.findFirst({
    where: { teacherId: teacher.id, title: 'คณิตศาสตร์ ม.5 เทอม 1' },
  })

  if (primaryCourse) {
    let chapter = await prisma.chapter.findFirst({
      where: { courseId: primaryCourse.id, title: 'บทที่ 1 พื้นฐาน' },
    })
    if (!chapter) {
      chapter = await prisma.chapter.create({
        data: {
          courseId: primaryCourse.id,
          title: 'บทที่ 1 พื้นฐาน',
          description: 'แนะนำเนื้อหาและแบบฝึกหัด',
          order: 1,
        },
      })
    }

    let lesson = await prisma.lesson.findFirst({
      where: { chapterId: chapter.id, title: 'บทเรียนที่ 1' },
    })
    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          chapterId: chapter.id,
          title: 'บทเรียนที่ 1',
          description: 'เนื้อหาและแบบฝึกหัดสำหรับนักเรียน',
          order: 1,
        },
      })
    }

    const quizExists = await prisma.quiz.findFirst({
      where: { lessonId: lesson.id, title: 'แบบฝึกหัดด่วน', type: 'QUIZ' },
    })
    if (!quizExists) {
      await prisma.quiz.create({
        data: {
          lessonId: lesson.id,
          title: 'แบบฝึกหัดด่วน',
          description: 'ทดสอบความเข้าใจเบื้องต้น',
          type: 'QUIZ',
          showAnswers: true,
          questions: {
            create: [
              {
                text: '2 + 2 เท่ากับเท่าไร?',
                type: 'MULTIPLE_CHOICE',
                points: 1,
                order: 1,
                options: {
                  create: [
                    { text: '3', isCorrect: false, order: 1 },
                    { text: '4', isCorrect: true, order: 2 },
                    { text: '5', isCorrect: false, order: 3 },
                  ],
                },
              },
            ],
          },
        },
      })
    }

    const examExists = await prisma.quiz.findFirst({
      where: { lessonId: lesson.id, title: 'ข้อสอบกลางภาค', type: 'EXAM' },
    })
    if (!examExists) {
      await prisma.quiz.create({
        data: {
          lessonId: lesson.id,
          title: 'ข้อสอบกลางภาค',
          description: 'ข้อสอบวัดผลรายบท',
          type: 'EXAM',
          timeLimit: 45,
          maxAttempts: 2,
          showAnswers: false,
        },
      })
    }

    const assignmentExists = await prisma.assignment.findFirst({
      where: { lessonId: lesson.id, title: 'ทำการบ้านหน้า 1' },
    })
    if (!assignmentExists) {
      await prisma.assignment.create({
        data: {
          lessonId: lesson.id,
          title: 'ทำการบ้านหน้า 1',
          description: 'ส่งภาพงานหรือไฟล์งาน',
          maxPoints: 10,
        },
      })
    }

    const materialExists = await prisma.material.findFirst({
      where: { lessonId: lesson.id, title: 'เอกสารประกอบ' },
    })
    if (!materialExists) {
      await prisma.material.create({
        data: {
          lessonId: lesson.id,
          title: 'เอกสารประกอบ',
          description: 'สรุปเนื้อหาบทเรียน',
          type: 'pdf',
          fileUrl: '/uploads/demo-lesson.pdf',
        },
      })
    }

    const enrollmentExists = await prisma.enrollment.findFirst({
      where: { courseId: primaryCourse.id, studentId: student.id },
    })
    if (!enrollmentExists) {
      await prisma.enrollment.create({
        data: { courseId: primaryCourse.id, studentId: student.id, progress: 10 },
      })
    }

    const demoQuiz = await prisma.quiz.findFirst({
      where: { lessonId: lesson.id, title: 'แบบฝึกหัดด่วน', type: 'QUIZ' },
    })
    if (demoQuiz) {
      const attemptExists = await prisma.quizAttempt.findFirst({
        where: { quizId: demoQuiz.id, studentId: student.id },
      })
      if (!attemptExists) {
        await prisma.quizAttempt.create({
          data: {
            quizId: demoQuiz.id,
            studentId: student.id,
            completedAt: new Date(),
            score: 1,
            maxScore: 1,
          },
        })
      }
    }

    const demoAssignment = await prisma.assignment.findFirst({
      where: { lessonId: lesson.id, title: 'ทำการบ้านหน้า 1' },
    })
    if (demoAssignment) {
      const submissionExists = await prisma.assignmentSubmission.findFirst({
        where: { assignmentId: demoAssignment.id, studentId: student.id },
      })
      if (!submissionExists) {
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: demoAssignment.id,
            studentId: student.id,
            textAnswer: 'ส่งงานตัวอย่างจากนักเรียน demo',
            submittedAt: new Date(),
            status: 'SUBMITTED',
          },
        })
      }
    }
  }

  console.log({ admin, teacher, student })

  await prisma.coupon.upsert({
    where: { code: 'DEMO10' },
    update: { discount: 10, isActive: true, maxUses: 100 },
    create: {
      code: 'DEMO10',
      discount: 10,
      isActive: true,
      maxUses: 100,
    },
  })

  console.log('✅ Seed data created successfully!')
  if (!isProduction) {
    console.log('')
    console.log('📝 Demo Accounts (development only):')
    console.log('  Admin   : admin@example.com')
    console.log('  Teacher : teacher@example.com')
    console.log('  Student : student@example.com')
    console.log('  Passwords are set via SEED_*_PASSWORD env vars or defaults in seed.ts')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
