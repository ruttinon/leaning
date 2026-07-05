import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production')) {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  });
  app.use(helmet());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'dist'));

  app.use((req, res, next) => {
    if (
      !req.path.startsWith('/auth') &&
      !req.path.startsWith('/public') &&
      !req.path.startsWith('/student') &&
      !req.path.startsWith('/teacher') &&
      !req.path.startsWith('/admin') &&
      !req.path.startsWith('/uploads') &&
      req.path.includes('.') === false
    ) {
      res.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
    } else {
      next();
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
