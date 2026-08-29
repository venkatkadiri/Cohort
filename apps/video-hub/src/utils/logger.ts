export const logger = {
  info: (msg: string, meta?: any) => console.log(`[Video-Service] INFO: ${msg}`, meta ?? ''),
  error: (msg: string, meta?: any) => console.error(`[Video-Service] ERROR: ${msg}`, meta ?? ''),
  warn: (msg: string, meta?: any) => console.warn(`[Video-Service] WARN: ${msg}`, meta ?? ''),
  debug: (msg: string, meta?: any) => console.debug(`[Video-Service] DEBUG: ${msg}`, meta ?? ''),
}
