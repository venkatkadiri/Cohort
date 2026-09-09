import { createApp } from './app.js'
import { config } from './config/env.js'
import { logger } from './utils/logger.js'

async function bootstrap() {
  try {
    const app = await createApp()
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 [Domain Service] Listening on http://localhost:${config.PORT}`)
      logger.info(`⚡ [GraphQL Endpoint] http://localhost:${config.PORT}/graphql`)
      logger.info(`🩺 [Health Check] http://localhost:${config.PORT}/health`)
    })

    const shutdown = () => {
      logger.info('Shutting down server...')
      server.close(() => {
        logger.info('Server stopped gracefully.')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('Failed to start domain service:', { error })
    process.exit(1)
  }
}

bootstrap()
