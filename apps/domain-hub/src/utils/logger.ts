export interface LogContext {
  [key: string]: unknown
}

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const GREEN = '\x1b[32m'
const BLUE = '\x1b[34m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const MAGENTA = '\x1b[35m'

export class Logger {
  constructor(private name: string = 'Domain-Service') {}

  child(contextName: string): Logger {
    return new Logger(`${this.name}:${contextName}`)
  }

  private format(level: string, color: string, message: string, ctx?: LogContext): string {
    const timestamp = new Date().toISOString()
    const ctxStr = ctx && Object.keys(ctx).length > 0 ? ` ${JSON.stringify(ctx)}` : ''
    return `${color}${BOLD}[${timestamp}] [${level}] [${this.name}]${RESET} ${message}${ctxStr}`
  }

  info(message: string, ctx?: LogContext): void {
    console.log(this.format('INFO', GREEN, message, ctx))
  }

  debug(message: string, ctx?: LogContext): void {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
      console.log(this.format('DEBUG', CYAN, message, ctx))
    }
  }

  warn(message: string, ctx?: LogContext): void {
    console.warn(this.format('WARN', YELLOW, message, ctx))
  }

  error(message: string, ctx?: LogContext): void {
    console.error(this.format('ERROR', RED, message, ctx))
  }
}

export const logger = new Logger('Domain-Service')
