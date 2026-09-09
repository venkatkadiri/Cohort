import { notificationRepository, NotificationModel, DropSubscriptionModel } from '../repositories/notification.repository.js'
import { logger } from '../utils/logger.js'

// =========================================================================
// NOTIFICATION SERVICE (STUB)
// Business logic to be implemented later
// =========================================================================
export class NotificationService {
  async getUserNotifications(userId: string): Promise<NotificationModel[]> {
    logger.debug(`[Stub] getUserNotifications called for ${userId}`)
    return notificationRepository.listByUserId(userId)
  }

  async sendBookingConfirmation(payload: {
    userId: string
    title: string
    message: string
    type: 'BOOKING_CONFIRMATION' | 'DROP_ALERT' | 'REMINDER' | 'SYSTEM'
  }): Promise<NotificationModel> {
    logger.debug(`[Stub] sendBookingConfirmation called for ${payload.userId}`)
    return notificationRepository.create(payload)
  }

  async sendDropAlert(hostId: string, slotTime: string): Promise<void> {
    logger.debug(`[Stub] sendDropAlert called for host ${hostId} at ${slotTime}`)
  }

  async markAsRead(id: string): Promise<boolean> {
    logger.debug(`[Stub] markAsRead called for ${id}`)
    return notificationRepository.markAsRead(id)
  }

  async getSubscriptions(userId: string): Promise<DropSubscriptionModel[]> {
    logger.debug(`[Stub] getSubscriptions called for ${userId}`)
    return notificationRepository.listSubscriptions(userId)
  }

  async subscribeToHost(userId: string, hostId: string, eventTypeId?: string): Promise<DropSubscriptionModel> {
    logger.debug(`[Stub] subscribeToHost called for user ${userId} and host ${hostId}`)
    return notificationRepository.createSubscription(userId, hostId, eventTypeId)
  }

  async unsubscribe(id: string): Promise<boolean> {
    logger.debug(`[Stub] unsubscribe called for subscription ${id}`)
    return notificationRepository.deleteSubscription(id)
  }
}

export const notificationService = new NotificationService()
