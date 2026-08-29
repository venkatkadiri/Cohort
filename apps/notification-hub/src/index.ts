import { createApp } from './app.js'
import { config } from './config/env.js'
import { startNotificationGrpcServer } from './grpc/server.js'
import { createLogger } from '@cohort/observability'

const logger = createLogger('notification-service')

async function bootstrap() {
  try {
    const app = await createApp()
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Notification Service running on http://localhost:${config.PORT}/graphql`)
      logger.info(`🩺 Health check at http://localhost:${config.PORT}/health`)
    })

    // Start binary gRPC server on port 50052
    const grpcServer = await startNotificationGrpcServer(50052)

    const shutdown = () => {
      logger.info('Shutting down notification-service...')
      grpcServer.forceShutdown()
      server.close(() => {
        logger.info('Notification service stopped.')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('Failed to start Notification Service:', { error })
    process.exit(1)
  }
}

bootstrap()
