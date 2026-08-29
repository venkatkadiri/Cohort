import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

export const config = {
  PORT: Number(process.env.BOOKING_SERVICE_PORT || 8004),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://temporal:temporal@localhost:5433/temporal',
  SLOT_GENERATION_DAYS: Number(process.env.SLOT_GENERATION_DAYS || 30),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
}
