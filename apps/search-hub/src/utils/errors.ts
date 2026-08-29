export class AppError extends Error {
  constructor(message: string, public code: string = 'BAD_USER_INPUT') {
    super(message)
    this.name = 'AppError'
  }
}
