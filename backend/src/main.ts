import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { metricsStore } from './common/metrics/metrics.store';
import { initErrorTracking, logStructured } from './common/observability/error-tracking';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT || 5000);
  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 300);

  if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production')) {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }

  await initErrorTracking();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.set('trust proxy', 1);

  const corsOrigins = [
    ...(process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || [
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:8080',
    ]),
    process.env.APP_URL,
    process.env.RENDER_EXTERNAL_URL,
  ].filter(Boolean) as string[]

  app.enableCors({
    origin: [...new Set(corsOrigins)],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/health') || req.path.startsWith('/uploads'),
  }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: isProduction,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduPro API')
    .setDescription('Online Learning & Tutor Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.use((req, res, next) => {
    const startedAt = Date.now();
    const incomingRequestId = req.headers['x-request-id'];
    const requestId = typeof incomingRequestId === 'string' && incomingRequestId.length > 0
      ? incomingRequestId
      : randomUUID();

    res.setHeader('x-request-id', requestId);
    ;(req as any).requestId = requestId;

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const path = req.originalUrl || req.url;

      if (!path.startsWith('/health')) {
        metricsStore.recordHttp(req.method, path, res.statusCode, durationMs);
      }

      logStructured('info', 'http_request', {
        requestId,
        method: req.method,
        path,
        statusCode: res.statusCode,
        durationMs,
      });
    });

    next();
  });

  const frontendDistCandidates = [
    join(process.cwd(), 'frontend', 'dist'),
    join(process.cwd(), '..', 'frontend', 'dist'),
    join(__dirname, '..', '..', 'frontend', 'dist'),
    join(__dirname, '..', '..', '..', 'frontend', 'dist'),
    join(__dirname, '..', '..', '..', '..', 'frontend', 'dist'),
  ];
  const frontendDist = frontendDistCandidates.find((dir) => existsSync(join(dir, 'index.html')))
    ?? frontendDistCandidates[0];

  app.useStaticAssets(frontendDist, {
    index: false,
  });

  app.use((req, res, next) => {
    if (
      !req.path.startsWith('/auth') &&
      !req.path.startsWith('/public') &&
      !req.path.startsWith('/student') &&
      !req.path.startsWith('/teacher') &&
      !req.path.startsWith('/admin') &&
      !req.path.startsWith('/uploads') &&
      !req.path.startsWith('/health') &&
      !req.path.startsWith('/api/docs') &&
      req.path.includes('.') === false
    ) {
      res.sendFile(join(frontendDist, 'index.html'));
    } else {
      next();
    }
  });

  await app.listen(port);
  logStructured('info', 'application_started', { port });
}

bootstrap();
