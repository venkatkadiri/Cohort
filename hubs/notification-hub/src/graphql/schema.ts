import { makeExecutableSchema } from '@graphql-tools/schema'
import { notificationTypeDefs } from './typeDefs/notification.typeDefs.js'
import { notificationResolvers } from './resolvers/notification.resolvers.js'

export const schema = makeExecutableSchema({
  typeDefs: [notificationTypeDefs],
  resolvers: [notificationResolvers],
})
