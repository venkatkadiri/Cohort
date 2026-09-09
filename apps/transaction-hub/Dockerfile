# ==============================================================================
# Transaction Hub Microservice Dockerfile
# Payment & Token Ledger Engine (HTTP :8008)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY observability ./observability
COPY apps/transaction-hub ./apps/transaction-hub

RUN pnpm --filter @cohort/transaction-hub... install --frozen-lockfile
RUN pnpm --filter @cohort/transaction-hub build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8008

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/transaction-hub/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/transaction-hub/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/transaction-hub/node_modules ./apps/transaction-hub/node_modules

USER nodejs

EXPOSE 8008
CMD ["node", "dist/index.js"]
