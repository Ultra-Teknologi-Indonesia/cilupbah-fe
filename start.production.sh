#!/bin/bash
set -e

echo "==> Installing dependencies..."
npm ci

# NEXT_PUBLIC_* vars are inlined into the client bundle at BUILD time, so the
# production API URL must be present in the environment BEFORE `npm run build`.
# It is supplied via docker-compose.production.yml (environment: NEXT_PUBLIC_API_URL).
echo "==> Building Next.js production bundle (API: ${NEXT_PUBLIC_API_URL:-<unset>})..."
npm run build

echo "==> Starting Next.js..."
exec npm run start -- --hostname 0.0.0.0 --port 3000
