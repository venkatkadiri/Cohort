export function healthCheck() {
  return {
    status: 'ok',
    service: 'transaction-hub',
    timestamp: new Date().toISOString(),
  }
}
