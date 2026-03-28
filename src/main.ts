import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins });

  if (process.env.SWAGGER_USER && process.env.SWAGGER_PASSWORD) {
    app.use(
      '/openapi',
      basicAuth({
        users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD },
        challenge: true,
      }),
    );
  }

  const specPath = join(process.cwd(), 'openapi', 'openapi.yaml');
  const document = yaml.load(readFileSync(specPath, 'utf8')) as OpenAPIObject;
  SwaggerModule.setup('openapi', app, document);

  const port = Number(process.env.PORT) || 6969;
  await app.listen(port);
  console.log(`Server listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/openapi`);
}
bootstrap();
