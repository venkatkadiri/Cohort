import { authRepository, AuthUserModel, SessionModel } from '../repositories/auth.repository.js'
import { logger } from '../utils/logger.js'

// =========================================================================
// AUTH SERVICE (STUB)
// Business logic to be implemented later
// =========================================================================
export class AuthService {
  async login(email: string, role: string): Promise<{ token: string; user: AuthUserModel }> {
    logger.debug(`[Stub] login called for ${email} (${role})`)
    const user = (await authRepository.findByEmail(email)) || (await authRepository.create({
      email,
      name: email.split('@')[0],
      role: role.toUpperCase() === 'TEACHER' ? 'TEACHER' : 'STUDENT',
      passwordHash: 'stub_hash',
    }))

    const token = `stub_token_${Date.now()}`
    return { token, user }
  }

  async validateToken(token: string): Promise<SessionModel | null> {
    logger.debug(`[Stub] validateToken called for ${token}`)
    return authRepository.findSession(token)
  }

  async getUser(id: string): Promise<AuthUserModel | null> {
    logger.debug(`[Stub] getUser called for ${id}`)
    return authRepository.findById(id)
  }

  async logout(token: string): Promise<boolean> {
    logger.debug(`[Stub] logout called for ${token}`)
    return authRepository.deleteSession(token)
  }
}

export const authService = new AuthService()
