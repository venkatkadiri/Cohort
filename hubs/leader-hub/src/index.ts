import { config } from './config/index.js'
import { logger } from './logger.js'
import { createApp } from './app.js'

const app = createApp()

app.listen(config.port, () => {
  logger.info('service started', { port: config.port, service: config.serviceName })
})
