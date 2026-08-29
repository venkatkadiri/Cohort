export interface AuthUserModel {
  id: string
  email: string
  name: string
  role: 'TEACHER' | 'STUDENT' | 'ADMIN'
  passwordHash: string
  createdAt: string
  avatarUrl?: string
}

export interface SessionModel {
  token: string
  userId: string
  role: string
  expiresAt: string
  createdAt: string
}

// =========================================================================
// AUTH REPOSITORY (STUB)
// Persistence logic to be implemented later (e.g. Prisma / Postgres / JWT verification)
// =========================================================================
export class AuthRepository {
  async findByEmail(_email: string): Promise<AuthUserModel | null> {
    return null
  }

  async findById(id: string): Promise<AuthUserModel | null> {
    return {
      id,
      email: 'stub@cohort.dev',
      name: 'Stub User',
      role: 'TEACHER',
      passwordHash: 'stub_hash',
      createdAt: new Date().toISOString(),
    }
  }

  async create(data: Omit<AuthUserModel, 'id' | 'createdAt'>): Promise<AuthUserModel> {
    return {
      ...data,
      id: `stub-user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
  }

  async saveSession(_session: SessionModel): Promise<void> {}

  async findSession(token: string): Promise<SessionModel | null> {
    return {
      token,
      userId: '1',
      role: 'TEACHER',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    }
  }

  async deleteSession(_token: string): Promise<boolean> {
    return true
  }
}

export const authRepository = new AuthRepository()
