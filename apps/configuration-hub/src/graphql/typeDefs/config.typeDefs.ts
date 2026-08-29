export const configTypeDefs = `#graphql
  enum RoleType {
    ROOT
    ADMIN
    TEACHER
    STUDENT
  }

  enum FeatureCategory {
    CORE
    VIDEO
    SCHEDULING
    ENGAGEMENT
    DEVELOPER
  }

  type RoleFeatureMap {
    ROOT: Boolean!
    ADMIN: Boolean!
    TEACHER: Boolean!
    STUDENT: Boolean!
  }

  type FeatureFlag {
    id: ID!
    key: String!
    name: String!
    description: String!
    category: FeatureCategory!
    enabledForRoles: RoleFeatureMap!
    isSystemCritical: Boolean
    updatedAt: String!
  }

  type RoleConfigSummary {
    role: RoleType!
    displayName: String!
    description: String!
    features: [FeatureStatusItem!]!
  }

  type FeatureStatusItem {
    key: String!
    enabled: Boolean!
  }

  input FeatureToggleInput {
    key: String!
    role: RoleType!
    enabled: Boolean!
  }

  type Query {
    featureFlags: [FeatureFlag!]!
    roleConfig(role: RoleType!): RoleConfigSummary!
    configHealth: String!
  }

  type Mutation {
    toggleFeature(input: FeatureToggleInput!): FeatureFlag!
    resetFeatureFlags: [FeatureFlag!]!
  }
`
