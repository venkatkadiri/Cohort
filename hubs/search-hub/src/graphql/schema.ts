import { makeExecutableSchema } from '@graphql-tools/schema'
import { searchTypeDefs } from './typeDefs/search.typeDefs.js'
import { searchResolvers } from './resolvers/search.resolvers.js'

export const schema = makeExecutableSchema({
  typeDefs: [searchTypeDefs],
  resolvers: [searchResolvers],
})
