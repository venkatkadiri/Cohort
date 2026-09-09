import { z } from 'zod'
import { router, publicProcedure, teacherProcedure } from '../trpc'
import { graphqlApi } from '../../graphql/client'
import { createEventTypeSchema, updateEventTypeSchema } from '../../../dtos/event-type.dto'
import { paginateWithCursor } from '../../../utils/pagination'

export const eventTypesRouter = router({
  listByHostId: publicProcedure
    .input(
      z.object({
        hostId: z.number(),
        limit: z.number().int().min(1).max(100).default(20).optional(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const all = await graphqlApi.listEventTypes(input.hostId)
      return paginateWithCursor(all, input.limit ?? 20, input.cursor)
    }),

  bySlug: publicProcedure
    .input(z.object({ hostId: z.number(), slug: z.string() }))
    .query(async ({ input }) => {
      return graphqlApi.getEventTypeBySlug(input.hostId, input.slug)
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return graphqlApi.getEventTypeById(input.id)
    }),

  getPublic: publicProcedure
    .input(z.object({ hostId: z.number(), slug: z.string() }))
    .query(async ({ input }) => {
      return graphqlApi.getPublicEventType(input.hostId, input.slug)
    }),

  create: teacherProcedure
    .input(
      z.object({
        hostId: z.number(),
        data: createEventTypeSchema,
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.createEventType({
        hostId: input.hostId,
        ...input.data,
      })
    }),

  update: teacherProcedure
    .input(
      z.object({
        id: z.number(),
        hostId: z.number(),
        patch: updateEventTypeSchema,
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.updateEventType({
        id: input.id,
        hostId: input.hostId,
        ...input.patch,
      })
    }),

  delete: teacherProcedure
    .input(
      z.object({
        id: z.number(),
        hostId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.deleteEventType(input.id, input.hostId)
    }),
})
