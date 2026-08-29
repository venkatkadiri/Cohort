import { userService } from '../../services/user.service.js'
import { paginateWithCursor } from '../../utils/pagination.js'

export const userResolvers = {
  Query: {
    users: async (_: unknown, args: { limit?: number; cursor?: string }) => {
      const all = await userService.listUsers()
      if (args.limit || args.cursor) {
        return paginateWithCursor(all, args.limit, args.cursor).items
      }
      return all
    },
    usersPaginated: async (_: unknown, args: { limit?: number; cursor?: string }) => {
      const all = await userService.listUsers()
      return paginateWithCursor(all, args.limit, args.cursor)
    },
    userById: (_: unknown, args: { id: number }) => userService.getUserById(args.id),
    userBySlug: (_: unknown, args: { slug: string }) => userService.getUserBySlug(args.slug),
  },
  Mutation: {
    createUser: (_: unknown, args: { input: { name: string; email: string; slug?: string; timezone?: string } }) =>
      userService.createUser(args.input),
    updateUser: (
      _: unknown,
      args: { input: { id: number; name?: string; email?: string; slug?: string; timezone?: string } }
    ) => userService.updateUser(args.input.id, args.input),
    deleteUser: (_: unknown, args: { id: number }) => userService.deleteUser(args.id),
  },
}
