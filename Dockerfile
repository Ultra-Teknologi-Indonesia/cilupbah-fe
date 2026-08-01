# syntax=docker/dockerfile:1
#
# Menghasilkan image `cilupbah-frontend` yang siap jalan tanpa build ulang di
# VPS. Dipakai oleh ci-cd-staging.yml (build & push) — image yang sama juga
# dipromosikan ke production lewat deploy-production.yml (tanpa build ulang).

# ── deps: install semua dependency (termasuk devDependencies untuk build) ──
FROM node:20-slim AS deps
WORKDIR /app
RUN npm install -g pnpm@9
# Puppeteer cuma dev-dependency (build/test script) — skip download Chromium-nya,
# node:20-slim juga tidak punya `unzip` yang dibutuhkan installer-nya.
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ── builder: compile Next.js production bundle ──
FROM node:20-slim AS builder
WORKDIR /app
RUN npm install -g pnpm@9
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* di-inline ke bundle saat build, jadi harus ada SEBELUM
# `pnpm build`. Kode ini juga membaca `API_URL` (tanpa prefix NEXT_PUBLIC_)
# di runtime untuk panggilan server-side — lihat src/app/api/app/[...path]/route.ts.
# Itu artinya URL backend per-environment (staging/production) sebenarnya
# disuplai lewat env `API_URL` di docker-compose saat container jalan, BUKAN
# lewat build-arg ini — jadi image yang sama bisa dipakai di semua environment.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Versi rilis untuk ditampilkan di UI. .git di-exclude via .dockerignore, jadi
# tidak bisa `git describe` di sini — CI menyuplai tag rilis lewat build-arg
# ini (lihat ci-cd-staging.yml). Kosong -> next.config.ts fallback ke package.json.
ARG NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}

RUN pnpm run build

# ── runner: image production minimal (Next.js standalone output) ──
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
