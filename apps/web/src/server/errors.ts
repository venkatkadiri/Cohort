export class HttpError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

export function badRequest(message: string) {
  return new HttpError(400, 'BAD_REQUEST', message)
}

export function unauthorized(message: string) {
  return new HttpError(401, 'UNAUTHORIZED', message)
}

export function forbidden(message: string) {
  return new HttpError(403, 'FORBIDDEN', message)
}

export function notFound(message: string) {
  return new HttpError(404, 'NOT_FOUND', message)
}

export function conflict(message: string) {
  return new HttpError(409, 'CONFLICT', message)
}