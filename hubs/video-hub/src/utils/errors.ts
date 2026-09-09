export class AppError extends Error {
  constructor(message: string, public statusCode: number = 400, public code: string = 'BAD_REQUEST') {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}
