import 'reflect-metadata';
import type { Request, Response } from 'express';

// Use require() so esbuild does not try to transform NestJS decorator code.
// dist/ is copied into api/dist/ during the build step (cp -r dist api/dist)
// so it lives in the same directory as this function and is auto-bundled by Vercel.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const server = express();
let ready = false;

async function bootstrap() {
  if (ready) return;

  /* eslint-disable @typescript-eslint/no-var-requires */
  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { ValidationPipe } = require('@nestjs/common');
  // ./dist resolves to api/dist/ — co-located with this file
  const { AppModule } = require('./dist/app.module');
  /* eslint-enable @typescript-eslint/no-var-requires */

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.init();
  ready = true;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  server(req, res);
}
