export const eventTypeTypeDefs = `#graphql
  type PaginatedEventTypes {
    items: [EventType!]!
    pageInfo: PageInfo!
  }

  type EventType {
    id: Int!
    hostId: Int!
    title: String!
    description: String
    slug: String!
    durationMinutes: Int!
    isActive: Boolean!
    locationType: String!
    locationValue: String
    bufferBeforeMinutes: Int!
    bufferAfterMinutes: Int!
    createdAt: String!
    updatedAt: String!
  }

  type PublicEventTypePayload {
    eventType: EventType!
    host: User!
  }

  input CreateEventTypeInput {
    hostId: Int!
    title: String!
    description: String
    slug: String
    durationMinutes: Int!
    isActive: Boolean
    locationType: String
    locationValue: String
    bufferBeforeMinutes: Int
    bufferAfterMinutes: Int
  }

  input UpdateEventTypeInput {
    id: Int!
    hostId: Int!
    title: String
    description: String
    slug: String
    durationMinutes: Int
    isActive: Boolean
    locationType: String
    locationValue: String
    bufferBeforeMinutes: Int
    bufferAfterMinutes: Int
  }

  extend type Query {
    eventTypes(hostId: Int!, limit: Int, cursor: String): [EventType!]!
    eventTypesPaginated(hostId: Int!, limit: Int, cursor: String): PaginatedEventTypes!
    eventTypeById(id: Int!): EventType
    eventTypeBySlug(hostId: Int!, slug: String!): EventType
    publicEventType(hostId: Int!, slug: String!): PublicEventTypePayload!
  }

  extend type Mutation {
    createEventType(input: CreateEventTypeInput!): EventType!
    updateEventType(input: UpdateEventTypeInput!): EventType!
    deleteEventType(id: Int!, hostId: Int!): StatusResponse!
  }
`
