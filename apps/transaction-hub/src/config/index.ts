export const config = {
  port: Number(process.env.PORT || 8000),
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: 'transaction-hub',
  temporalAddress: process.env.TEMPORAL_ADDRESS || 'temporal:7233',
  logLevel: process.env.LOG_LEVEL || 'info',
}
