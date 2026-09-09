export class AppError extends Error {
  constructor(message: string, public code: string = 'UNAUTHENTICATED') {
    super(message)
    this.name = 'AppError'
  }
}
