# Optional: Selbsthosting statt Vercel (Web-App + Worker aus einem Image).
# Build:  docker compose build
FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* werden beim Bauen eingebaut. Auf dem Server liegen sie in build-public.env (vom Admin-Panel gepflegt).
RUN set -a; [ -f build-public.env ] && . ./build-public.env; set +a; npx prisma generate && npx next build

# ─── Web (Next.js standalone) ───
FROM node:24-alpine AS web
WORKDIR /app
RUN apk add --no-cache openssl && addgroup -S nodejs && adduser -S nextjs -G nodejs
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# ─── Worker (Discord-Gateway, Outbox, Löschfristen) + Setup-Tasks ───
FROM node:24-alpine AS worker
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=builder /app ./
CMD ["npx", "tsx", "--conditions=react-server", "worker/index.ts"]
