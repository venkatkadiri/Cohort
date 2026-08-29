import { userTypeDefs } from './user.typeDefs.js'
import { eventTypeTypeDefs } from './eventType.typeDefs.js'
import { availabilityTypeDefs } from './availability.typeDefs.js'
import { slotTypeDefs } from './slot.typeDefs.js'
import { bookingTypeDefs } from './booking.typeDefs.js'
import { enrollerTypeDefs } from './enroller.typeDefs.js'

const baseTypeDefs = `#graphql
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`

export const typeDefs = [
  baseTypeDefs,
  userTypeDefs,
  eventTypeTypeDefs,
  availabilityTypeDefs,
  slotTypeDefs,
  bookingTypeDefs,
  enrollerTypeDefs,
]
