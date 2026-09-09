import client from 'prom-client'

export const register = client.register
client.collectDefaultMetrics({ register })

export const serviceRequestsTotal = new client.Counter({
  name: 'leader_hub_requests_total',
  help: 'Total requests handled by the service',
  labelNames: ['route', 'method', 'status'],
})
