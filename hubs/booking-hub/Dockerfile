# ==============================================================================
# Booking Hub Microservice Dockerfile
# Scheduling, Slot Generation & Temporal Engine (HTTP :8004, gRPC :50051)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY observability ./observability
COPY hubs/booking-hub ./hubs/booking-hub

RUN pnpm --filter @cohort/booking-hub... install --frozen-lockfile
RUN pnpm --filter @cohort/booking-hub prisma:generate
RUN pnpm --filter @cohort/booking-hub build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8004

RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/hubs/booking-hub/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/hubs/booking-hub/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/hubs/booking-hub/node_modules ./hubs/booking-hub/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/hubs/booking-hub/prisma ./prisma

USER nodejs

EXPOSE 8004 50051
CMD ["node", "dist/index.js"]
