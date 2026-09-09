import { availabilityService } from '../../services/availability.service.js'

export const availabilityResolvers = {
  Query: {
    availabilityRules: (_: unknown, args: { userId: number }) => availabilityService.listRules(args.userId),
    availabilityExceptions: (_: unknown, args: { userId: number; from?: string; to?: string }) =>
      availabilityService.listExceptions(args.userId, args.from, args.to),
  },
  Mutation: {
    createAvailabilityRule: (
      _: unknown,
      args: {
        input: {
          userId: number
          weekday: number
          startTime: string
          endTime: string
          isActive?: boolean
          timezone?: string
        }
      }
    ) => availabilityService.createRule(args.input),
    updateAvailabilityRule: (
      _: unknown,
      args: {
        input: {
          id: number
          userId: number
          weekday?: number
          startTime?: string
          endTime?: string
          isActive?: boolean
          timezone?: string
        }
      }
    ) => availabilityService.updateRule(args.input.id, args.input.userId, args.input),
    deleteAvailabilityRule: (_: unknown, args: { id: number; userId: number }) =>
      availabilityService.deleteRule(args.id, args.userId),

    createAvailabilityException: (
      _: unknown,
      args: {
        input: {
          userId: number
          date: string
          type: string
          startTime?: string | null
          endTime?: string | null
          timezone?: string
          reason?: string | null
        }
      }
    ) => availabilityService.createException(args.input),
    updateAvailabilityException: (
      _: unknown,
      args: {
        input: {
          id: number
          userId: number
          date?: string
          type?: string
          startTime?: string | null
          endTime?: string | null
          timezone?: string
          reason?: string | null
        }
      }
    ) => availabilityService.updateException(args.input.id, args.input.userId, args.input),
    deleteAvailabilityException: (_: unknown, args: { id: number; userId: number }) =>
      availabilityService.deleteException(args.id, args.userId),
  },
}
