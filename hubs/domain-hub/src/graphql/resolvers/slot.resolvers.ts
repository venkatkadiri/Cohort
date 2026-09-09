import { slotService } from '../../services/slot.service.js'
import { paginateWithCursor } from '../../utils/pagination.js'

export const slotResolvers = {
  Query: {
    availableSlots: (_: unknown, args: { eventTypeId: number; date: string }) =>
      slotService.getAvailableSlots(args.eventTypeId, args.date),
    slotsForHost: async (_: unknown, args: { hostId: number; from?: string; to?: string; limit?: number; cursor?: string }) => {
      const all = await slotService.listSlotsForHost(args.hostId, args.from, args.to)
      if (args.limit || args.cursor) {
        return paginateWithCursor(all, args.limit, args.cursor).items
      }
      return all
    },
    slotsForHostPaginated: async (_: unknown, args: { hostId: number; from?: string; to?: string; limit?: number; cursor?: string }) => {
      const all = await slotService.listSlotsForHost(args.hostId, args.from, args.to)
      return paginateWithCursor(all, args.limit, args.cursor)
    },
  },
  Mutation: {
    createSlot: (
      _: unknown,
      args: { input: { hostId: number; eventTypeId: number; startAt: string; endAt: string } }
    ) => slotService.createSlot(args.input),
    updateSlot: (
      _: unknown,
      args: {
        input: {
          id: string
          hostId: number
          eventTypeId?: number
          startAt?: string
          endAt?: string
          status?: string
        }
      }
    ) => slotService.updateSlot(args.input.id, args.input.hostId, args.input),
    deleteSlot: (_: unknown, args: { id: string; hostId: number }) =>
      slotService.deleteSlot(args.id, args.hostId),
    regenerateSlots: (
      _: unknown,
      args: { input: { hostId: number; from?: string; to?: string; daysAhead?: number } }
    ) => slotService.regenerateSlots(args.input.hostId, args.input.from, args.input.to, args.input.daysAhead),
  },
}
