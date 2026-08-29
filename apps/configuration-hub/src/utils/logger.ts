export const logger = {
  info: (msg: string, meta?: any) => console.log(`[Config-Hub] INFO: ${msg}`, meta ?? ''),
  error: (msg: string, meta?: any) => console.error(`[Config-Hub] ERROR: ${msg}`, meta ?? ''),
  warn: (msg: string, meta?: any) => console.warn(`[Config-Hub] WARN: ${msg}`, meta ?? ''),
  debug: (msg: string, meta?: any) => console.debug(`[Config-Hub] DEBUG: ${msg}`, meta ?? ''),
}
