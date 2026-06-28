import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Serve static files from uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Serve frontend static files
  app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'dist'));
  
  // SPA fallback
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
      res.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'))
    } else {
      next()
    }
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
