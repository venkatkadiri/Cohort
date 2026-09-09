import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { graphqlApi } from '../../graphql/client'
import { createBookingSchema } from '../../../dtos/booking.dto'
import { paginateWithCursor } from '../../../utils/pagination'

export const bookingsRouter = router({
  listByHostId: publicProcedure
    .input(
      z.object({
        hostId: z.number(),
        limit: z.number().int().min(1).max(100).default(20).optional(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const all = await graphqlApi.listBookings(input.hostId)
      return paginateWithCursor(all, input.limit ?? 20, input.cursor)
    }),

  create: publicProcedure
    .input(createBookingSchema)
    .mutation(async ({ input }) => {
      return graphqlApi.createBooking(input)
    }),

  cancel: protectedProcedure
    .input(
      z.object({
        hostId: z.number(),
        bookingId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.cancelBooking(input.bookingId, input.hostId)
    }),
})
