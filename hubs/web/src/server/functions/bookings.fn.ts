import { createServerFn } from '@tanstack/react-start'
import { createBookingSchema } from '../../dtos/booking.dto'
import { graphqlApi } from '../graphql/client'

export const listBookingsFn = createServerFn({ method: 'GET' })
  .validator((hostId: number) => hostId)
  .handler(async ({ data: hostId }) => {
    return graphqlApi.listBookings(hostId)
  })

export const createBookingFn = createServerFn({ method: 'POST' })
  .validator(createBookingSchema)
  .handler(async ({ data }) => {
    return graphqlApi.createBooking(data)
  })

export const cancelBookingFn = createServerFn({ method: 'POST' })
  .validator((data: { hostId: number; bookingId: number }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.cancelBooking(data.bookingId, data.hostId)
  })