import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // اذا بدي اضيف اكثر من url
  const frontendUrls = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3001);

  // Render and other container platforms require the server to accept traffic
  // from outside the container, not only from localhost.
  await app.listen(port, '0.0.0.0');

  console.log(`API running on http://localhost:${port}`);
}

void bootstrap();
