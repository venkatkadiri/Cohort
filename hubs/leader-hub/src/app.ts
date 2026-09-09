import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import { logger } from './logger.js'
import { healthCheck } from './health.js'
import { register, serviceRequestsTotal } from './metrics.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json(healthCheck())
  })

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  })

  app.get('/api/health', (_req, res) => {
    serviceRequestsTotal.inc({ route: '/api/health', method: 'GET', status: '200' })
    res.json({ service: 'leader-hub', ok: true })
  })

  return app
}
