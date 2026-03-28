#!/bin/sh
set -e

echo "==> Pushing Prisma schema..."
npx prisma db push --accept-data-loss

echo "==> Running seed..."
npx ts-node --project tsconfig.json src/seed/seed.ts

echo "==> Starting NestJS..."
exec npm run start:dev
