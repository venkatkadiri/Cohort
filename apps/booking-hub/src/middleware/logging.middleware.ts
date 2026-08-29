import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = performance.now()
  const corrId =
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`

  res.setHeader('X-Correlation-ID', corrId)

  // Log GraphQL query details if present
  const isGraphQL = req.path === '/graphql' && req.method === 'POST'
  const operationName = isGraphQL ? req.body?.operationName || 'Anonymous' : null

  res.on('finish', () => {
    const durationMs = Number((performance.now() - start).toFixed(2))
    const status = res.statusCode

    if (isGraphQL) {
      logger.info(`[GraphQL] ${operationName} ${status} [${durationMs}ms]`, {
        correlationId: corrId,
        operationName,
        status,
        durationMs,
      })
    } else {
      logger.info(`[HTTP] ${req.method} ${req.path} ${status} [${durationMs}ms]`, {
        correlationId: corrId,
        method: req.method,
        path: req.path,
        status,
        durationMs,
      })
    }
  })

  next()
}
