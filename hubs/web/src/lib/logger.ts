/**
 * Structured Logger for BFF (apps/web)
 * Compatible with Grafana Loki / CloudWatch / Datadog structured log ingestion.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.LOG_FORMAT === 'json';

// ANSI color codes for pretty console logs
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  purple: '\x1b[35m',
  gray: '\x1b[90m',
};

export interface LogContext {
  module?: string;
  service?: string;
  reqId?: string;
  userId?: number | string;
  durationMs?: number;
  method?: string;
  status?: string | number;
  [key: string]: any;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = {
      service: 'cohort-bff',
      ...context,
    };
  }

  public child(extraContext: LogContext): Logger {
    return new Logger({ ...this.context, ...extraContext });
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const mergedContext = { ...this.context, ...meta };

    if (IS_PRODUCTION) {
      // JSON format for Loki / ELK / CloudWatch ingestion
      const jsonLog = {
        timestamp,
        level: level.toUpperCase(),
        message,
        ...mergedContext,
      };
      const output = JSON.stringify(jsonLog);
      if (level === 'error') {
        console.error(output);
      } else if (level === 'warn') {
        console.warn(output);
      } else {
        console.log(output);
      }
      return;
    }

    // Colorized Pretty Console Format for Development
    const levelColor = COLORS[level] || COLORS.reset;
    const levelTag = `${levelColor}${level.toUpperCase().padEnd(5)}${COLORS.reset}`;
    const moduleTag = mergedContext.module
      ? `${COLORS.purple}[${mergedContext.module}]${COLORS.reset}`
      : `${COLORS.purple}[BFF]${COLORS.reset}`;
    const reqTag = mergedContext.reqId ? `${COLORS.gray}(req_id=${mergedContext.reqId})${COLORS.reset} ` : '';
    const durationTag =
      mergedContext.durationMs !== undefined
        ? ` ${COLORS.dim}+${mergedContext.durationMs.toFixed(1)}ms${COLORS.reset}`
        : '';

    const cleanMeta = { ...mergedContext };
    delete cleanMeta.service;
    delete cleanMeta.module;
    delete cleanMeta.reqId;
    delete cleanMeta.durationMs;

    const hasMeta = Object.keys(cleanMeta).length > 0;
    const metaStr = hasMeta ? ` ${COLORS.dim}${JSON.stringify(cleanMeta)}${COLORS.reset}` : '';

    const line = `${COLORS.dim}${timestamp}${COLORS.reset} ${levelTag} ${moduleTag} ${reqTag}${message}${durationTag}${metaStr}`;

    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  public debug(message: string, meta?: Record<string, any>): void {
    this.formatMessage('debug', message, meta);
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.formatMessage('info', message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.formatMessage('warn', message, meta);
  }

  public error(message: string, errorOrMeta?: Error | Record<string, any>, meta?: Record<string, any>): void {
    let errorMeta: Record<string, any> = {};

    if (errorOrMeta instanceof Error) {
      errorMeta = {
        errorName: errorOrMeta.name,
        errorMessage: errorOrMeta.message,
        stack: errorOrMeta.stack,
        ...meta,
      };
    } else if (errorOrMeta) {
      errorMeta = { ...errorOrMeta, ...meta };
    }

    this.formatMessage('error', message, errorMeta);
  }

  /**
   * Helper to time async operations
   */
  public async time<T>(
    operationName: string,
    fn: () => Promise<T>,
    meta?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    try {
      this.debug(`-> Starting ${operationName}`, meta);
      const result = await fn();
      const durationMs = performance.now() - start;
      this.info(`<- Finished ${operationName}`, { durationMs, ...meta });
      return result;
    } catch (err: any) {
      const durationMs = performance.now() - start;
      this.error(`❌ Failed ${operationName}`, err, { durationMs, ...meta });
      throw err;
    }
  }
}

// Default singleton logger
export const logger = new Logger();

// Helper to create random short correlation IDs
export function generateCorrelationId(): string {
  return Math.random().toString(36).substring(2, 10);
}
