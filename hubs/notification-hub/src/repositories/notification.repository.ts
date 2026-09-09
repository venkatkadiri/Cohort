export interface NotificationModel {
  id: string
  userId: string
  title: string
  message: string
  type: 'BOOKING_CONFIRMATION' | 'DROP_ALERT' | 'REMINDER' | 'SYSTEM'
  isRead: boolean
  createdAt: string
  metadata?: Record<string, any>
}

export interface DropSubscriptionModel {
  id: string
  userId: string
  hostId: string
  eventTypeId?: string
  active: boolean
  createdAt: string
}

// =========================================================================
// NOTIFICATION REPOSITORY (STUB)
// Persistence logic to be implemented later (e.g. Prisma / Redis / MongoDB)
// =========================================================================
export class NotificationRepository {
  async listByUserId(_userId: string): Promise<NotificationModel[]> {
    return []
  }

  async create(data: Omit<NotificationModel, 'id' | 'createdAt' | 'isRead'>): Promise<NotificationModel> {
    return {
      ...data,
      id: `stub-notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
  }

  async markAsRead(_id: string): Promise<boolean> {
    return true
  }

  async listSubscriptions(_userId: string): Promise<DropSubscriptionModel[]> {
    return []
  }

  async createSubscription(userId: string, hostId: string, eventTypeId?: string): Promise<DropSubscriptionModel> {
    return {
      id: `stub-sub-${Date.now()}`,
      userId,
      hostId,
      eventTypeId,
      active: true,
      createdAt: new Date().toISOString(),
    }
  }

  async deleteSubscription(_id: string): Promise<boolean> {
    return true
  }
}

export const notificationRepository = new NotificationRepository()
