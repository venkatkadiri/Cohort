import express, { Express } from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { schema } from './graphql/schema.js'
import { config } from './config/env.js'
import configRoutes from './api/routes/config.routes.js'
import {
  createLogger,
  createCorrelationMiddleware,
  createMetricsMiddleware,
  createMetricsHandler,
} from '@cohort/observability'

const logger = createLogger('configuration-hub')

export async function createApp(): Promise<Express> {
  const app = express()

  // Observability: Correlation Tracing & Prometheus Metrics
  app.use(createCorrelationMiddleware())
  app.use(createMetricsMiddleware('configuration-hub'))

  // Inject API Version header
  app.use((_req, res, next) => {
    res.setHeader('X-API-Version', '1.0.0')
    next()
  })

  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    })
  )
  app.use(express.json())

  // Prometheus Metrics endpoint
  app.get('/metrics', createMetricsHandler('configuration-hub'))

  // Health and version endpoints
  const healthHandler = (_req: any, res: any) => {
    res.status(200).json({
      status: 'healthy',
      version: '1.0.0',
      service: '@cohort/configuration-hub (Feature Flag Control Plane)',
      port: config.PORT,
      timestamp: new Date().toISOString(),
    })
  }

  app.get('/health', healthHandler)
  app.get('/api/v1/health', healthHandler)

  // REST API routes (Canonical v1 + Root Alias)
  app.use('/api/v1/config', configRoutes)
  app.use('/api/config', configRoutes)

  // Apollo GraphQL setup
  const server = new ApolloServer({
    schema,
  })

  await server.start()

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({
        correlationId: (req as any).correlationId || req.headers['x-correlation-id'] || 'unknown',
      }),
    })
  )

  logger.info('Configuration Hub Express application initialized with full observability & metrics')
  return app
}
