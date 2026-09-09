import { createApp } from './app.js'
import { config } from './config/env.js'
import { startVideoGrpcServer } from './grpc/server.js'
import { createLogger } from '@cohort/observability'

const logger = createLogger('video-service')

async function bootstrap() {
  try {
    const app = await createApp()
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Video Service running on http://localhost:${config.PORT}/graphql`)
      logger.info(`🎥 Video REST API & HLS Streaming at http://localhost:${config.PORT}/api/videos`)
      logger.info(`🩺 Health check at http://localhost:${config.PORT}/health`)
    })

    // Start binary gRPC server on port 50055
    const grpcServer = await startVideoGrpcServer(50055)

    const shutdown = () => {
      logger.info('Shutting down video-service...')
      grpcServer.forceShutdown()
      server.close(() => {
        logger.info('Video service stopped.')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('Failed to start Video Service:', { error })
    process.exit(1)
  }
}

bootstrap()
