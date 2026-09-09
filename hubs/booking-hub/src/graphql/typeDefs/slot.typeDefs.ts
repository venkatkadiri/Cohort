export const slotTypeDefs = `#graphql
  type PaginatedSlots {
    items: [Slot!]!
    pageInfo: PageInfo!
  }

  type Slot {
    id: String!
    hostId: Int!
    eventTypeId: Int!
    startAt: String!
    endAt: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    eventType: EventType
  }

  type RegenerateSlotsPayload {
    success: Boolean!
    generatedCount: Int!
    message: String!
  }

  input CreateSlotInput {
    hostId: Int!
    eventTypeId: Int!
    startAt: String!
    endAt: String!
  }

  input UpdateSlotInput {
    id: String!
    hostId: Int!
    eventTypeId: Int
    startAt: String
    endAt: String
    status: String
  }

  input RegenerateSlotsInput {
    hostId: Int!
    from: String
    to: String
    daysAhead: Int
  }

  extend type Query {
    availableSlots(eventTypeId: Int!, date: String!): [Slot!]!
    slotsForHost(hostId: Int!, from: String, to: String, limit: Int, cursor: String): [Slot!]!
    slotsForHostPaginated(hostId: Int!, from: String, to: String, limit: Int, cursor: String): PaginatedSlots!
  }

  extend type Mutation {
    createSlot(input: CreateSlotInput!): Slot!
    updateSlot(input: UpdateSlotInput!): Slot!
    deleteSlot(id: String!, hostId: Int!): StatusResponse!
    regenerateSlots(input: RegenerateSlotsInput!): RegenerateSlotsPayload!
  }
`
