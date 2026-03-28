import 'reflect-metadata';
import type { Request, Response } from 'express';

// Use require() so esbuild does NOT try to bundle NestJS decorator code.
// NestJS is loaded at runtime from pre-compiled dist/ (built by `nest build`).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const server = express();
let ready = false;

async function bootstrap() {
  if (ready) return;

  // Dynamic requires — esbuild won't touch these; they resolve from dist/ at runtime
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { NestFactory } = require('@nestjs/core');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ExpressAdapter } = require('@nestjs/platform-express');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ValidationPipe } = require('@nestjs/common');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AppModule } = require('../dist/app.module');

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
