import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  // Simple Request Logger
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:5100',
      'http://localhost:5101',
      'http://localhost:5173',
      'http://127.0.0.1:5100',
      'http://127.0.0.1:5101',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  });

  // Security middleware
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('v1');

  const port = configService.get<number>('port') || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 TabletTap API is running on: http://localhost:${port}/v1`);
}
bootstrap();
