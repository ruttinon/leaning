import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'

describe('Auth integration', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )
    await app.init()

    prisma = app.get(PrismaService)

    await prisma.user.deleteMany({ where: { email: 'integration@test.com' } })
    await prisma.user.create({
      data: {
        email: 'integration@test.com',
        password: await bcrypt.hash('Test1234', 10),
        firstName: 'Integration',
        lastName: 'Test',
        role: 'STUDENT',
        studentProfile: { create: {} },
      },
    })
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'integration@test.com' } })
    await app.close()
  })

  it('GET /health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('POST /auth/login returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'integration@test.com', password: 'Test1234' })

    expect([200, 201]).toContain(res.status)
    expect(res.body.access_token).toBeDefined()
    expect(res.body.refresh_token).toBeDefined()
    expect(res.body.user.email).toBe('integration@test.com')
  })

  it('POST /auth/refresh rotates tokens', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'integration@test.com', password: 'Test1234' })

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: login.body.refresh_token })

    expect([200, 201]).toContain(res.status)
    expect(res.body.access_token).toBeDefined()
    expect(res.body.refresh_token).toBeDefined()
    expect(res.body.refresh_token).not.toBe(login.body.refresh_token)
  })

  it('rejects weak registration password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register/student')
      .send({
        email: 'weak@test.com',
        password: '123',
        firstName: 'A',
        lastName: 'B',
      })

    expect(res.status).toBe(400)
  })
})
