export const authTypeDefs = `#graphql
  enum UserRole {
    TEACHER
    STUDENT
    ADMIN
  }

  type AuthUser {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: AuthUser!
  }

  type SessionInfo {
    token: String!
    userId: String!
    role: String!
    expiresAt: String!
  }

  input LoginInput {
    email: String!
    role: String!
  }

  input RegisterInput {
    email: String!
    name: String!
    role: UserRole!
  }

  type Query {
    validateSession(token: String!): SessionInfo
    currentUser(id: String!): AuthUser
    authHealth: String!
  }

  type Mutation {
    login(input: LoginInput!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    logout(token: String!): Boolean!
  }
`
