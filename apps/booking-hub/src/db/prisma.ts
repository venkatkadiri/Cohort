import { PrismaClient } from '@prisma/client'
import { config } from '../config/env.js'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: config.DATABASE_URL,
      },
    },
    log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (config.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
