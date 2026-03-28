import 'reflect-metadata';
import type { Request, Response } from 'express';

// dist/ is committed to git and included via vercel.json "includeFiles": "dist/**"
// Using require() so esbuild does not attempt to bundle NestJS decorator code.
/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');

const server = express();
let ready = false;

async function bootstrap() {
  if (ready) return;

  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { ValidationPipe } = require('@nestjs/common');
  const { AppModule } = require('../dist/src/app.module');
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
