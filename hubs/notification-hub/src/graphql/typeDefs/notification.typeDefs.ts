export const notificationTypeDefs = `#graphql
  enum NotificationType {
    BOOKING_CONFIRMATION
    DROP_ALERT
    REMINDER
    SYSTEM
  }

  type Notification {
    id: ID!
    userId: String!
    title: String!
    message: String!
    type: NotificationType!
    isRead: Boolean!
    createdAt: String!
  }

  type DropSubscription {
    id: ID!
    userId: String!
    hostId: String!
    eventTypeId: String
    active: Boolean!
    createdAt: String!
  }

  input SendNotificationInput {
    userId: String!
    title: String!
    message: String!
    type: NotificationType!
  }

  input SubscribeDropAlertInput {
    userId: String!
    hostId: String!
    eventTypeId: String
  }

  type Query {
    notifications(userId: String!): [Notification!]!
    dropSubscriptions(userId: String!): [DropSubscription!]!
    notificationHealth: String!
  }

  type Mutation {
    sendNotification(input: SendNotificationInput!): Notification!
    markNotificationAsRead(id: ID!): Boolean!
    subscribeToDropAlert(input: SubscribeDropAlertInput!): DropSubscription!
    unsubscribeFromDropAlert(id: ID!): Boolean!
  }
`
