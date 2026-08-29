export interface LogContext {
  [key: string]: unknown
}

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface StructuredLogEntry {
  '@timestamp': string
  service: string
  level: LogLevel
  message: string
  correlationId?: string
  context?: LogContext
  environment: string
  host?: string
}

export class Logger {
  private isJsonFormat: boolean

  constructor(public readonly serviceName: string = 'Service') {
    this.isJsonFormat =
      process.env.LOG_FORMAT === 'json' || process.env.NODE_ENV === 'production'
  }

  child(contextName: string): Logger {
    return new Logger(`${this.serviceName}:${contextName}`)
  }

  private formatConsole(level: LogLevel, color: string, message: string, ctx?: LogContext): string {
    const timestamp = new Date().toISOString()
    const ctxStr = ctx && Object.keys(ctx).length > 0 ? ` ${JSON.stringify(ctx)}` : ''
    return `${color}${BOLD}[${timestamp}] [${level}] [${this.serviceName}]${RESET} ${message}${ctxStr}`
  }

  private formatJson(level: LogLevel, message: string, ctx?: LogContext): string {
    const correlationId = (ctx?.correlationId as string) || (ctx?.reqId as string) || undefined
    const cleanCtx = ctx ? { ...ctx } : undefined
    if (cleanCtx) {
      delete cleanCtx.correlationId
      delete cleanCtx.reqId
    }

    const entry: StructuredLogEntry = {
      '@timestamp': new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      correlationId,
      context: cleanCtx && Object.keys(cleanCtx).length > 0 ? cleanCtx : undefined,
      environment: process.env.APP_ENV || process.env.NODE_ENV || 'development',
    }

    return JSON.stringify(entry)
  }

  private log(level: LogLevel, color: string, message: string, ctx?: LogContext): void {
    if (this.isJsonFormat) {
      const output = this.formatJson(level, message, ctx)
      if (level === 'ERROR') {
        console.error(output)
      } else if (level === 'WARN') {
        console.warn(output)
      } else {
        console.log(output)
      }
    } else {
      const output = this.formatConsole(level, color, message, ctx)
      if (level === 'ERROR') {
        console.error(output)
      } else if (level === 'WARN') {
        console.warn(output)
      } else {
        console.log(output)
      }
    }
  }

  info(message: string, ctx?: LogContext): void {
    this.log('INFO', GREEN, message, ctx)
  }

  debug(message: string, ctx?: LogContext): void {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG || process.env.LOG_LEVEL === 'debug') {
      this.log('DEBUG', CYAN, message, ctx)
    }
  }

  warn(message: string, ctx?: LogContext): void {
    this.log('WARN', YELLOW, message, ctx)
  }

  error(message: string, ctx?: LogContext): void {
    this.log('ERROR', RED, message, ctx)
  }
}

export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName)
}
