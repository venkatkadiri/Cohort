# ==============================================================================
# Auth Hub Microservice Dockerfile
# Authentication, JWT Sessions & Role Gating (HTTP :8003, gRPC :50054)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY observability ./observability
COPY hubs/auth-hub ./hubs/auth-hub

RUN pnpm --filter @cohort/auth-hub... install --frozen-lockfile
RUN pnpm --filter @cohort/auth-hub build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8003

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/hubs/auth-hub/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/hubs/auth-hub/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/hubs/auth-hub/node_modules ./hubs/auth-hub/node_modules

USER nodejs

EXPOSE 8003 50054
CMD ["node", "dist/index.js"]
