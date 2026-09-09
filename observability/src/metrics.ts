import client, { Registry, Counter, Histogram, Gauge } from 'prom-client'
import { createLogger, type Logger } from './logger.js'

export interface MetricsBundle {
  register: Registry
  httpRequestsTotal: Counter<string>
  httpRequestDuration: Histogram<string>
  activeRequests: Gauge<string>
  logger: Logger
}

const registries = new Map<string, MetricsBundle>()

export function createMetricsRegistry(serviceName: string): MetricsBundle {
  if (registries.has(serviceName)) {
    return registries.get(serviceName)!
  }

  const register = new Registry()
  const logger = createLogger(serviceName)

  // Collect default Node.js system metrics (CPU, Memory, Event Loop)
  client.collectDefaultMetrics({
    register,
    prefix: 'cohort_',
    labels: { service: serviceName },
  })

  // Total HTTP requests counter
  const httpRequestsTotal = new Counter({
    name: 'cohort_http_requests_total',
    help: 'Total number of HTTP requests processed',
    labelNames: ['method', 'path', 'status', 'service'],
    registers: [register],
  })

  // HTTP request duration histogram (in seconds)
  const httpRequestDuration = new Histogram({
    name: 'cohort_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status', 'service'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
  })

  // Active concurrent requests gauge
  const activeRequests = new Gauge({
    name: 'cohort_active_requests',
    help: 'Number of active HTTP requests currently being handled',
    labelNames: ['service'],
    registers: [register],
  })

  const bundle: MetricsBundle = {
    register,
    httpRequestsTotal,
    httpRequestDuration,
    activeRequests,
    logger,
  }

  registries.set(serviceName, bundle)
  return bundle
}

/**
 * Express middleware for automatic HTTP metrics and structured request logging
 */
export function createMetricsMiddleware(serviceName: string) {
  const { httpRequestsTotal, httpRequestDuration, activeRequests, logger } =
    createMetricsRegistry(serviceName)

  return (req: any, res: any, next: any): void => {
    // Ignore internal prometheus scrape requests to prevent metric self-pollution
    if (req.path === '/metrics' || req.path === '/health' || req.path === '/api/v1/health') {
      return next()
    }

    const start = performance.now()
    activeRequests.inc({ service: serviceName })

    const correlationId = req.correlationId || (req.headers && req.headers['x-correlation-id'])

    res.on('finish', () => {
      const durationSec = (performance.now() - start) / 1000
      const durationMs = Number((durationSec * 1000).toFixed(2))
      activeRequests.dec({ service: serviceName })

      // Normalize path (strip query params and high-cardinality IDs)
      const path = req.baseUrl || req.path || '/'
      const status = String(res.statusCode)

      httpRequestsTotal.inc({
        method: req.method,
        path,
        status,
        service: serviceName,
      })

      httpRequestDuration.observe(
        {
          method: req.method,
          path,
          status,
          service: serviceName,
        },
        durationSec
      )

      // Emit structured log for ELK stack ingestion
      const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO'
      logger[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'info'](
        `${req.method} ${path} -> ${status} (${durationMs}ms)`,
        {
          correlationId,
          method: req.method,
          path,
          status: res.statusCode,
          durationMs,
          ip: req.ip,
          userAgent: req.headers ? req.headers['user-agent'] : undefined,
        }
      )
    })

    next()
  }
}

/**
 * Standardized Express handler for GET /metrics
 */
export function createMetricsHandler(serviceName: string) {
  const { register } = createMetricsRegistry(serviceName)

  return async (_req: any, res: any): Promise<void> => {
    try {
      res.setHeader('Content-Type', register.contentType)
      const metrics = await register.metrics()
      res.send(metrics)
    } catch (err: any) {
      res.status(500).send(`Error collecting metrics: ${err.message}`)
    }
  }
}
