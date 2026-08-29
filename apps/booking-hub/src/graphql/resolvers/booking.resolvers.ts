import { bookingService } from '../../services/booking.service.js'
import { paginateWithCursor } from '../../utils/pagination.js'

export const bookingResolvers = {
  Query: {
    bookings: async (_: unknown, args: { hostId: number; limit?: number; cursor?: string }) => {
      const all = await bookingService.listBookings(args.hostId)
      if (args.limit || args.cursor) {
        return paginateWithCursor(all, args.limit, args.cursor).items
      }
      return all
    },
    bookingsPaginated: async (_: unknown, args: { hostId: number; limit?: number; cursor?: string }) => {
      const all = await bookingService.listBookings(args.hostId)
      return paginateWithCursor(all, args.limit, args.cursor)
    },
    bookingById: (_: unknown, args: { id: number; hostId?: number }) =>
      bookingService.getBookingById(args.id, args.hostId),
  },
  Mutation: {
    createBooking: (
      _: unknown,
      args: {
        input: {
          eventTypeId: number
          slotId: string
          inviteeName: string
          inviteeEmail: string
          inviteeNotes?: string | null
        }
      }
    ) => bookingService.createBooking(args.input),
    cancelBooking: (_: unknown, args: { id: number; hostId: number }) =>
      bookingService.cancelBooking(args.id, args.hostId),
  },
}
