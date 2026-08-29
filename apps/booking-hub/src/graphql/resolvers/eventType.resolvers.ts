import { eventTypeService } from '../../services/event-type.service.js'
import { paginateWithCursor } from '../../utils/pagination.js'

export const eventTypeResolvers = {
  Query: {
    eventTypes: async (_: unknown, args: { hostId: number; limit?: number; cursor?: string }) => {
      const all = await eventTypeService.listEventTypes(args.hostId)
      if (args.limit || args.cursor) {
        return paginateWithCursor(all, args.limit, args.cursor).items
      }
      return all
    },
    eventTypesPaginated: async (_: unknown, args: { hostId: number; limit?: number; cursor?: string }) => {
      const all = await eventTypeService.listEventTypes(args.hostId)
      return paginateWithCursor(all, args.limit, args.cursor)
    },
    eventTypeById: (_: unknown, args: { id: number }) => eventTypeService.getEventTypeById(args.id),
    eventTypeBySlug: (_: unknown, args: { hostId: number; slug: string }) =>
      eventTypeService.getEventTypeBySlug(args.hostId, args.slug),
    publicEventType: (_: unknown, args: { hostId: number; slug: string }) =>
      eventTypeService.getPublicEventType(args.hostId, args.slug),
  },
  Mutation: {
    createEventType: (
      _: unknown,
      args: {
        input: {
          hostId: number
          title: string
          description?: string | null
          slug?: string
          durationMinutes: number
          isActive?: boolean
          locationType?: string
          locationValue?: string | null
          bufferBeforeMinutes?: number
          bufferAfterMinutes?: number
        }
      }
    ) => eventTypeService.createEventType(args.input),
    updateEventType: (
      _: unknown,
      args: {
        input: {
          id: number
          hostId: number
          title?: string
          description?: string | null
          slug?: string
          durationMinutes?: number
          isActive?: boolean
          locationType?: string
          locationValue?: string | null
          bufferBeforeMinutes?: number
          bufferAfterMinutes?: number
        }
      }
    ) => eventTypeService.updateEventType(args.input.id, args.input.hostId, args.input),
    deleteEventType: (_: unknown, args: { id: number; hostId: number }) =>
      eventTypeService.deleteEventType(args.id, args.hostId),
  },
}
