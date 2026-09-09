import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

const rootDir = process.cwd()

export const config = {
  PORT: Number(process.env.VIDEO_SERVICE_PORT || 8005),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  STORAGE_DIR: process.env.MEDIA_ROOT || path.resolve(rootDir, 'storage/videos'),
  UPLOADS_DIR: path.resolve(rootDir, 'storage/uploads'),
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB || 500),
}
