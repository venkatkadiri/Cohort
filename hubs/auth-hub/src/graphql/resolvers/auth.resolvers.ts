import { authService } from '../../services/auth.service.js'

export const authResolvers = {
  Query: {
    validateSession: async (_: unknown, { token }: { token: string }) => {
      return authService.validateToken(token)
    },
    currentUser: async (_: unknown, { id }: { id: string }) => {
      return authService.getUser(id)
    },
    authHealth: () => 'Auth service is operational',
  },
  Mutation: {
    login: async (_: unknown, { input }: { input: { email: string; role: string } }) => {
      return authService.login(input.email, input.role)
    },
    register: async (_: unknown, { input }: { input: { email: string; name: string; role: string } }) => {
      return authService.login(input.email, input.role)
    },
    logout: async (_: unknown, { token }: { token: string }) => {
      return authService.logout(token)
    },
  },
}
