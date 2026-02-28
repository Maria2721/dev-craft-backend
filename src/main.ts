import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({ origin: corsOrigin });
  const port = Number(process.env.PORT) || 6969;
  await app.listen(port);
  console.log(`Server listening on port ${port}`);
}
bootstrap();
