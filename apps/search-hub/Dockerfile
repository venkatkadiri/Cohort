# ==============================================================================
# Search Hub Microservice Dockerfile
# Search, Autocomplete & Directory Catalog (HTTP :8002, gRPC :50053)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages ./packages
COPY apps/search-hub ./apps/search-hub

RUN pnpm --filter @cohort/search-hub... install --frozen-lockfile
RUN pnpm --filter @cohort/search-hub build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8002

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/search-hub/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/search-hub/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/search-hub/node_modules ./apps/search-hub/node_modules

USER nodejs

EXPOSE 8002 50053
CMD ["node", "dist/index.js"]
