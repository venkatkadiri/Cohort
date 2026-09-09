import { createApp } from './app.js'
import { config } from './config/env.js'
import { startBookingGrpcServer } from './grpc/server.js'
import { createLogger } from '@cohort/observability'

const logger = createLogger('booking-service')

async function bootstrap() {
  try {
    const app = await createApp()
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 [Booking Service] Listening on http://localhost:${config.PORT}`)
      logger.info(`⚡ [GraphQL Endpoint] http://localhost:${config.PORT}/graphql`)
      logger.info(`🩺 [Health Check] http://localhost:${config.PORT}/health`)
    })

    // Start binary gRPC server on port 50051
    const grpcServer = await startBookingGrpcServer(50051)

    const shutdown = () => {
      logger.info('Shutting down booking-service...')
      grpcServer.forceShutdown()
      server.close(() => {
        logger.info('Booking service stopped gracefully.')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('Failed to start booking service:', { error })
    process.exit(1)
  }
}

bootstrap()
