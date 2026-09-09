# ==============================================================================
# Notification Hub Microservice Dockerfile
# Push Notifications, SSE Events & Drop Alerts (HTTP :8001, gRPC :50052)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY observability ./observability
COPY apps/notification-hub ./apps/notification-hub

RUN pnpm --filter @cohort/notification-hub... install --frozen-lockfile
RUN pnpm --filter @cohort/notification-hub build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/notification-hub/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/notification-hub/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/notification-hub/node_modules ./apps/notification-hub/node_modules

USER nodejs

EXPOSE 8001 50052
CMD ["node", "dist/index.js"]
