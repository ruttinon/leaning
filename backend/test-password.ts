import * as bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  if (!admin) {
    console.log('User not found')
    return
  }
  console.log('User found:', admin.email)
  const isMatch = await bcrypt.compare('admin1234', admin.password)
  console.log('Password match:', isMatch)
}

test().finally(() => prisma.$disconnect())
