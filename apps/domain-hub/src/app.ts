import express from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { schema } from './graphql/schema.js'
import { config } from './config/env.js'
import {
  createLogger,
  createCorrelationMiddleware,
  createMetricsMiddleware,
  createMetricsHandler,
} from '@cohort/observability'

const logger = createLogger('domain-hub')

export async function createApp() {
  const app = express()

  // Observability: Correlation Tracing & Prometheus Metrics
  app.use(createCorrelationMiddleware())
  app.use(createMetricsMiddleware('domain-hub'))

  app.use(
    cors({
      origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN,
      credentials: true,
    })
  )
  app.use(express.json())

  // Prometheus Metrics endpoint
  app.get('/metrics', createMetricsHandler('domain-hub'))

  // Health and version checks
  const healthHandler = (_req: any, res: any) => {
    res.json({
      status: 'ok',
      version: '1.0.0',
      role: 'Hub (Domain Orchestrator)',
      hub: '@cohort/domain-hub',
      spokes: {
        booking: config.SPOKES.BOOKING_URL,
        notification: config.SPOKES.NOTIFICATION_URL,
        search: config.SPOKES.SEARCH_URL,
        auth: config.SPOKES.AUTH_URL,
        video: config.SPOKES.VIDEO_URL,
        config: config.SPOKES.CONFIG_URL,
      },
      timestamp: new Date().toISOString(),
    })
  }

  app.get('/health', healthHandler)
  app.get('/api/v1/health', healthHandler)

  // Initialize Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    formatError: (formattedError, error) => {
      logger.error(`[GraphQL Error] ${formattedError.message}`, {
        path: formattedError.path,
        locations: formattedError.locations,
        originalError: error,
      })
      return formattedError
    },
  })

  await apolloServer.start()

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        req,
        correlationId: req.headers['x-correlation-id'],
      }),
    })
  )

  return app
}
