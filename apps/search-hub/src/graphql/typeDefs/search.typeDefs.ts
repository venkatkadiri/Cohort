export const searchTypeDefs = `#graphql
  enum SearchCategory {
    ALL
    MENTOR
    TRACK
    SESSION
    DOC
  }

  type SearchDoc {
    id: ID!
    title: String!
    subtitle: String
    category: SearchCategory!
    url: String!
    tags: [String!]!
    description: String
    score: Float
  }

  type SearchResult {
    items: [SearchDoc!]!
    total: Int!
  }

  input IndexMentorInput {
    id: String!
    name: String!
    title: String
    bio: String
    url: String!
    tags: [String!]!
  }

  input IndexTrackInput {
    id: String!
    title: String!
    subtitle: String
    url: String!
    tags: [String!]!
    description: String
  }

  type Query {
    search(query: String!, category: SearchCategory, limit: Int, offset: Int): SearchResult!
    autocomplete(query: String!, limit: Int): [String!]!
    searchHealth: String!
  }

  type Mutation {
    indexMentor(input: IndexMentorInput!): SearchDoc!
    indexTrack(input: IndexTrackInput!): SearchDoc!
  }
`
