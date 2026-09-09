import { getSessionFn } from '../functions/auth.fn'

export interface TRPCContext {
  session: {
    userId?: string
    email?: string
    name?: string
  } | null
  user: {
    id?: string
    email?: string
    name?: string
    role?: 'ROOT' | 'ADMIN' | 'TEACHER' | 'STUDENT'
  } | null
}

export async function createTRPCContext(): Promise<TRPCContext> {
  const session = await getSessionFn().catch(() => null)
  return {
    session,
    user: session
      ? {
          id: session.userId,
          email: session.email,
          name: session.name,
          role: 'TEACHER', // default to teacher for active logged in users
        }
      : null,
  }
}
