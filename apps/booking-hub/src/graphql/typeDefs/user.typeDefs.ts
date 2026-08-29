export const userTypeDefs = `#graphql
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    totalCount: Int!
  }

  type PaginatedUsers {
    items: [User!]!
    pageInfo: PageInfo!
  }

  type UserCount {
    eventTypes: Int!
    bookings: Int!
  }

  type User {
    id: Int!
    email: String!
    name: String!
    slug: String!
    timezone: String!
    createdAt: String!
    updatedAt: String!
    count: UserCount
  }

  type StatusResponse {
    success: Boolean!
    message: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    slug: String
    timezone: String
  }

  input UpdateUserInput {
    id: Int!
    name: String
    email: String
    slug: String
    timezone: String
  }

  extend type Query {
    users(limit: Int, cursor: String): [User!]!
    usersPaginated(limit: Int, cursor: String): PaginatedUsers!
    userById(id: Int!): User
    userBySlug(slug: String!): User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    deleteUser(id: Int!): StatusResponse!
  }
`
