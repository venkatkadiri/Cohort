import { createApp } from './app.js'
import { config } from './config/env.js'
import { startConfigGrpcServer } from './grpc/server.js'
import { createLogger } from '@cohort/observability'

const logger = createLogger('configuration-hub')

async function bootstrap() {
  try {
    const app = await createApp()
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Configuration Hub running on http://localhost:${config.PORT}/graphql`)
      logger.info(`⚙️ Feature Flag REST API at http://localhost:${config.PORT}/api/config`)
      logger.info(`🩺 Health check at http://localhost:${config.PORT}/health`)
    })

    // Start binary gRPC server on port 50056
    const grpcServer = await startConfigGrpcServer(50056)

    const shutdown = () => {
      logger.info('Shutting down configuration-hub...')
      grpcServer.forceShutdown()
      server.close(() => {
        logger.info('Configuration Hub stopped.')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('Failed to start Configuration Hub:', { error })
    process.exit(1)
  }
}

bootstrap()
