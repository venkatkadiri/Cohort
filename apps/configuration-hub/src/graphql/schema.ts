import { makeExecutableSchema } from '@graphql-tools/schema'
import { configTypeDefs } from './typeDefs/config.typeDefs.js'
import { configResolvers } from './resolvers/config.resolvers.js'

export const schema = makeExecutableSchema({
  typeDefs: [configTypeDefs],
  resolvers: [configResolvers],
})
