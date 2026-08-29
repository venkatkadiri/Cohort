export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `req_${timestamp}_${random}`
}

export function createCorrelationMiddleware(headerName: string = 'X-Correlation-ID') {
  return (req: any, res: any, next: any): void => {
    const existingId =
      (req.headers && req.headers[headerName.toLowerCase()]) ||
      (req.headers && req.headers['x-request-id'])

    const correlationId = existingId || generateCorrelationId()

    // Attach to request object & outgoing response headers
    req.correlationId = correlationId
    if (res && res.setHeader) {
      res.setHeader(headerName, correlationId)
    }

    next()
  }
}
