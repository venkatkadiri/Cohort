import { createApp } from './app.js'
import { config } from './config/env.js'
import { startSearchGrpcServer } from './grpc/server.js'
import { createLogger } from '@cohort/observability'

const logger = createLogger('search-service')

async function bootstrap() {
  try {
    const app = await createApp()
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Search Service running on http://localhost:${config.PORT}/graphql`)
      logger.info(`🩺 Health check at http://localhost:${config.PORT}/health`)
    })

    // Start binary gRPC server on port 50053
    const grpcServer = await startSearchGrpcServer(50053)

    const shutdown = () => {
      logger.info('Shutting down search-service...')
      grpcServer.forceShutdown()
      server.close(() => {
        logger.info('Search service stopped.')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('Failed to start Search Service:', { error })
    process.exit(1)
  }
}

bootstrap()
