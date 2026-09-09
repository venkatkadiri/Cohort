# ==============================================================================
# Video Hub Microservice Dockerfile
# Video Transcoding, FFmpeg HLS Chunks & Video Vault (HTTP :8005, gRPC :50055)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat ffmpeg

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY observability ./observability
COPY hubs/video-hub ./hubs/video-hub

RUN pnpm --filter @cohort/video-hub... install --frozen-lockfile
RUN pnpm --filter @cohort/video-hub build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8005

RUN apk add --no-cache ffmpeg
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/hubs/video-hub/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/hubs/video-hub/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/hubs/video-hub/node_modules ./hubs/video-hub/node_modules

USER nodejs

EXPOSE 8005 50055
CMD ["node", "dist/index.js"]
