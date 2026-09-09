import { z } from 'zod'
import { router, publicProcedure, teacherProcedure } from '../trpc'
import { graphqlApi } from '../../graphql/client'
import { paginateWithCursor } from '../../../utils/pagination'

export const slotsRouter = router({
  listForHost: publicProcedure
    .input(
      z.object({
        hostId: z.number(),
        from: z.string().optional(),
        to: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50).optional(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const all = await graphqlApi.listSlotsForHost(input.hostId, input.from, input.to)
      return paginateWithCursor(all, input.limit ?? 50, input.cursor)
    }),

  getAvailableSlots: publicProcedure
    .input(
      z.object({
        eventTypeId: z.number(),
        date: z.string(),
      })
    )
    .query(async ({ input }) => {
      return graphqlApi.getAvailableSlots(input.eventTypeId, input.date)
    }),

  regenerateSlots: teacherProcedure
    .input(
      z.object({
        hostId: z.number(),
        daysAhead: z.number().default(30),
      })
    )
    .mutation(async ({ input }) => {
      const from = new Date().toISOString().slice(0, 10)
      const to = new Date(Date.now() + input.daysAhead * 86400000).toISOString().slice(0, 10)
      await graphqlApi.regenerateSlots({
        hostId: input.hostId,
        from,
        to,
        daysAhead: input.daysAhead,
      })
      return graphqlApi.listSlotsForHost(input.hostId, from, to)
    }),

  createSlot: teacherProcedure
    .input(
      z.object({
        hostId: z.number(),
        eventTypeId: z.number(),
        startAt: z.string(),
        endAt: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.createSlot(input)
    }),

  updateSlot: teacherProcedure
    .input(
      z.object({
        id: z.string(),
        hostId: z.number(),
        eventTypeId: z.number().optional(),
        startAt: z.string().optional(),
        endAt: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.updateSlot(input)
    }),

  deleteSlot: teacherProcedure
    .input(
      z.object({
        id: z.string(),
        hostId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.deleteSlot(input.id, input.hostId)
    }),
})
