import { userResolvers } from './user.resolvers.js'
import { eventTypeResolvers } from './eventType.resolvers.js'
import { availabilityResolvers } from './availability.resolvers.js'
import { slotResolvers } from './slot.resolvers.js'
import { bookingResolvers } from './booking.resolvers.js'
import { enrollerResolvers } from './enroller.resolvers.js'

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...eventTypeResolvers.Query,
    ...availabilityResolvers.Query,
    ...slotResolvers.Query,
    ...bookingResolvers.Query,
    ...enrollerResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...eventTypeResolvers.Mutation,
    ...availabilityResolvers.Mutation,
    ...slotResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...enrollerResolvers.Mutation,
  },
}
