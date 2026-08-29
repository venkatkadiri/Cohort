export const enrollerTypeDefs = `#graphql
  type Enroller {
    id: Int!
    authId: String!
    email: String!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  type Subscription {
    id: Int!
    enrollerId: Int!
    eventTypeId: Int!
    createdAt: String!
    eventType: EventType
  }

  type SlotRequest {
    id: Int!
    enrollerId: Int!
    eventTypeId: Int!
    message: String
    status: String!
    createdAt: String!
    enroller: Enroller
    eventType: EventType
  }

  input CreateEnrollerInput {
    email: String!
    name: String!
    authId: String
  }

  extend type Query {
    subscriptions(enrollerId: Int!): [Subscription!]!
    slotRequestsForTeacher(teacherUserId: Int!): [SlotRequest!]!
  }

  extend type Mutation {
    createEnroller(input: CreateEnrollerInput!): Enroller!
    subscribe(enrollerId: Int!, eventTypeId: Int!): Subscription!
    unsubscribe(enrollerId: Int!, eventTypeId: Int!): StatusResponse!
    createSlotRequest(enrollerId: Int!, eventTypeId: Int!, message: String): SlotRequest!
  }
`
