export const logger = {
  info: (msg: string, meta?: any) => console.log(`[Auth-Service] INFO: ${msg}`, meta ?? ''),
  error: (msg: string, meta?: any) => console.error(`[Auth-Service] ERROR: ${msg}`, meta ?? ''),
  warn: (msg: string, meta?: any) => console.warn(`[Auth-Service] WARN: ${msg}`, meta ?? ''),
  debug: (msg: string, meta?: any) => console.debug(`[Auth-Service] DEBUG: ${msg}`, meta ?? ''),
}

export class AppError extends Error {
  constructor(message: string, public code: string = 'UNAUTHENTICATED') {
    super(message)
    this.name = 'AppError'
  }
}
