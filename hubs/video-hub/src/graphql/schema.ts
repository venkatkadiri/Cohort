import { makeExecutableSchema } from '@graphql-tools/schema'
import { videoTypeDefs } from './typeDefs/video.typeDefs.js'
import { videoResolvers } from './resolvers/video.resolvers.js'

export const schema = makeExecutableSchema({
  typeDefs: [videoTypeDefs],
  resolvers: [videoResolvers],
})
