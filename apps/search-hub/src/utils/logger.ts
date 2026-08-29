export const logger = {
  info: (msg: string, meta?: any) => console.log(`[Search-Service] INFO: ${msg}`, meta ?? ''),
  error: (msg: string, meta?: any) => console.error(`[Search-Service] ERROR: ${msg}`, meta ?? ''),
  warn: (msg: string, meta?: any) => console.warn(`[Search-Service] WARN: ${msg}`, meta ?? ''),
  debug: (msg: string, meta?: any) => console.debug(`[Search-Service] DEBUG: ${msg}`, meta ?? ''),
}

export class AppError extends Error {
  constructor(message: string, public code: string = 'BAD_USER_INPUT') {
    super(message)
    this.name = 'AppError'
  }
}
