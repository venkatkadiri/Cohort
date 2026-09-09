# ==============================================================================
# Domain Hub Microservice Dockerfile
# GraphQL Gateway & Central Domain Service (HTTP :8000, gRPC :50051)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY observability ./observability
COPY apps/domain-hub ./apps/domain-hub

RUN pnpm --filter @cohort/domain-hub... install --frozen-lockfile
RUN pnpm --filter @cohort/domain-hub prisma:generate
RUN pnpm --filter @cohort/domain-hub build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000

RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/domain-hub/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/domain-hub/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/domain-hub/node_modules ./apps/domain-hub/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/domain-hub/prisma ./prisma

USER nodejs

EXPOSE 8000 50051
CMD ["node", "dist/index.js"]
