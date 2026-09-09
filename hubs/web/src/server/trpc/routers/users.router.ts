import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { graphqlApi } from '../../graphql/client'
import { createUserSchema, updateUserSchema } from '../../../dtos/user.dto'
import { paginateWithCursor } from '../../../utils/pagination'

export const usersRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(20).optional(),
          cursor: z.string().nullish(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20
      const cursor = input?.cursor ?? null
      const users = await graphqlApi.listUsers()
      const formatted = (users || []).map((u) => ({
        ...u,
        _count: {
          eventTypes: u.count?.eventTypes ?? 0,
          bookings: u.count?.bookings ?? 0,
        },
      }))
      return paginateWithCursor(formatted, limit, cursor)
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return graphqlApi.getUserById(input.id)
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const users = await graphqlApi.listUsers()
      return users.find((u) => u.slug === input.slug) || null
    }),

  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      return graphqlApi.createUser(input)
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        patch: updateUserSchema,
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.updateUser({ id: input.id, ...input.patch })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return graphqlApi.deleteUser(input.id)
    }),
})
