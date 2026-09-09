import { enrollerService } from '../../services/enroller.service.js'

export const enrollerResolvers = {
  Query: {
    subscriptions: (_: unknown, args: { enrollerId: number }) => enrollerService.listSubscriptions(args.enrollerId),
    slotRequestsForTeacher: (_: unknown, args: { teacherUserId: number }) =>
      enrollerService.listSlotRequestsForTeacher(args.teacherUserId),
  },
  Mutation: {
    createEnroller: (_: unknown, args: { input: { email: string; name: string; authId?: string } }) =>
      enrollerService.getOrCreateEnroller(args.input),
    subscribe: (_: unknown, args: { enrollerId: number; eventTypeId: number }) =>
      enrollerService.subscribe(args.enrollerId, args.eventTypeId),
    unsubscribe: (_: unknown, args: { enrollerId: number; eventTypeId: number }) =>
      enrollerService.unsubscribe(args.enrollerId, args.eventTypeId),
    createSlotRequest: (
      _: unknown,
      args: { enrollerId: number; eventTypeId: number; message?: string }
    ) =>
      enrollerService.createSlotRequest({
        enrollerId: args.enrollerId,
        eventTypeId: args.eventTypeId,
        message: args.message,
      }),
  },
}
