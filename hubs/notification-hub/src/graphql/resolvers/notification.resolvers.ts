import { notificationService } from '../../services/notification.service.js'

export const notificationResolvers = {
  Query: {
    notifications: async (_: unknown, { userId }: { userId: string }) => {
      return notificationService.getUserNotifications(userId)
    },
    dropSubscriptions: async (_: unknown, { userId }: { userId: string }) => {
      return notificationService.getSubscriptions(userId)
    },
    notificationHealth: () => 'Notification service is operational',
  },
  Mutation: {
    sendNotification: async (_: unknown, { input }: { input: any }) => {
      return notificationService.sendBookingConfirmation(input)
    },
    markNotificationAsRead: async (_: unknown, { id }: { id: string }) => {
      return notificationService.markAsRead(id)
    },
    subscribeToDropAlert: async (_: unknown, { input }: { input: { userId: string; hostId: string; eventTypeId?: string } }) => {
      return notificationService.subscribeToHost(input.userId, input.hostId, input.eventTypeId)
    },
    unsubscribeFromDropAlert: async (_: unknown, { id }: { id: string }) => {
      return notificationService.unsubscribe(id)
    },
  },
}
