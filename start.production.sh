#!/bin/bash
set -e

# Proyek ini memakai pnpm (pnpm-lock.yaml + .npmrc). package-lock.json usang,
# jadi `npm ci` gagal. Pakai pnpm via corepack/npm.
echo "==> Installing pnpm..."
npm install -g pnpm

echo "==> Installing dependencies (pnpm)..."
pnpm install --frozen-lockfile || pnpm install

# NEXT_PUBLIC_* vars di-inline ke bundle saat BUILD, jadi NEXT_PUBLIC_API_URL
# harus ada di environment SEBELUM build (disuplai docker-compose.production.yml).
echo "==> Building Next.js production bundle (API: ${NEXT_PUBLIC_API_URL:-<unset>})..."
pnpm run build

echo "==> Starting Next.js..."
exec pnpm run start -- --hostname 0.0.0.0 --port 3000
