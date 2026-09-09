export const availabilityTypeDefs = `#graphql
  type AvailabilityRule {
    id: Int!
    userId: Int!
    weekday: Int!
    startTime: String!
    endTime: String!
    isActive: Boolean!
    timezone: String!
    createdAt: String!
    updatedAt: String!
  }

  type AvailabilityException {
    id: Int!
    userId: Int!
    date: String!
    type: String!
    startTime: String
    endTime: String
    timezone: String!
    reason: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateRuleInput {
    userId: Int!
    weekday: Int!
    startTime: String!
    endTime: String!
    isActive: Boolean
    timezone: String
  }

  input UpdateRuleInput {
    id: Int!
    userId: Int!
    weekday: Int
    startTime: String
    endTime: String
    isActive: Boolean
    timezone: String
  }

  input CreateExceptionInput {
    userId: Int!
    date: String!
    type: String!
    startTime: String
    endTime: String
    timezone: String
    reason: String
  }

  input UpdateExceptionInput {
    id: Int!
    userId: Int!
    date: String
    type: String
    startTime: String
    endTime: String
    timezone: String
    reason: String
  }

  extend type Query {
    availabilityRules(userId: Int!): [AvailabilityRule!]!
    availabilityExceptions(userId: Int!, from: String, to: String): [AvailabilityException!]!
  }

  extend type Mutation {
    createAvailabilityRule(input: CreateRuleInput!): AvailabilityRule!
    updateAvailabilityRule(input: UpdateRuleInput!): AvailabilityRule!
    deleteAvailabilityRule(id: Int!, userId: Int!): StatusResponse!

    createAvailabilityException(input: CreateExceptionInput!): AvailabilityException!
    updateAvailabilityException(input: UpdateExceptionInput!): AvailabilityException!
    deleteAvailabilityException(id: Int!, userId: Int!): StatusResponse!
  }
`
