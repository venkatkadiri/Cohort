import { makeExecutableSchema } from '@graphql-tools/schema'
import { authTypeDefs } from './typeDefs/auth.typeDefs.js'
import { authResolvers } from './resolvers/auth.resolvers.js'

export const schema = makeExecutableSchema({
  typeDefs: [authTypeDefs],
  resolvers: [authResolvers],
})
