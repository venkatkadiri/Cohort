import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

export const config = {
  PORT: Number(process.env.PORT || 8000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://temporal:temporal@localhost:5433/temporal',
  SLOT_GENERATION_DAYS: Number(process.env.SLOT_GENERATION_DAYS || 30),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  SPOKES: {
    BOOKING_URL: process.env.BOOKING_SERVICE_URL || 'http://127.0.0.1:8004/graphql',
    NOTIFICATION_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:8001/graphql',
    SEARCH_URL: process.env.SEARCH_SERVICE_URL || 'http://127.0.0.1:8002/graphql',
    AUTH_URL: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:8003/graphql',
    VIDEO_URL: process.env.VIDEO_SERVICE_URL || 'http://127.0.0.1:8005/graphql',
    CONFIG_URL: process.env.CONFIG_SERVICE_URL || 'http://127.0.0.1:8006/graphql',
  },
}
