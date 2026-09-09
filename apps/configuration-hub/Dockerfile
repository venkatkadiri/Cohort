# ==============================================================================
# Configuration Hub Microservice Dockerfile
# Feature Flags, Role Simulations & Dynamic Config (HTTP :8006, gRPC :50056)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages ./packages
COPY apps/configuration-hub ./apps/configuration-hub

RUN pnpm --filter @cohort/configuration-hub... install --frozen-lockfile
RUN pnpm --filter @cohort/configuration-hub build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8006

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/configuration-hub/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/configuration-hub/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/configuration-hub/node_modules ./apps/configuration-hub/node_modules

USER nodejs

EXPOSE 8006 50056
CMD ["node", "dist/index.js"]
