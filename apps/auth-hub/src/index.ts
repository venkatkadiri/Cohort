import { createApp } from './app.js'
import { config } from './config/env.js'
import { startAuthGrpcServer } from './grpc/server.js'
import { createLogger } from '@cohort/observability'

const logger = createLogger('auth-service')

async function bootstrap() {
  try {
    const app = await createApp()
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Auth Service running on http://localhost:${config.PORT}/graphql`)
      logger.info(`🩺 Health check at http://localhost:${config.PORT}/health`)
    })

    // Start binary gRPC server on port 50054
    const grpcServer = await startAuthGrpcServer(50054)

    const shutdown = () => {
      logger.info('Shutting down auth-service...')
      grpcServer.forceShutdown()
      server.close(() => {
        logger.info('Auth service stopped.')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('Failed to start Auth Service:', { error })
    process.exit(1)
  }
}

bootstrap()
