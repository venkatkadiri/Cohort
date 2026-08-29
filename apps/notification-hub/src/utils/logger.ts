export const logger = {
  info: (msg: string, meta?: any) => console.log(`[Notification-Service] INFO: ${msg}`, meta ?? ''),
  error: (msg: string, meta?: any) => console.error(`[Notification-Service] ERROR: ${msg}`, meta ?? ''),
  warn: (msg: string, meta?: any) => console.warn(`[Notification-Service] WARN: ${msg}`, meta ?? ''),
  debug: (msg: string, meta?: any) => console.debug(`[Notification-Service] DEBUG: ${msg}`, meta ?? ''),
}

export class AppError extends Error {
  constructor(message: string, public code: string = 'BAD_USER_INPUT') {
    super(message)
    this.name = 'AppError'
  }
}
