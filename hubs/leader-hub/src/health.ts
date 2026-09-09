export function healthCheck() {
  return {
    status: 'ok',
    service: 'leader-hub',
    timestamp: new Date().toISOString(),
  }
}
