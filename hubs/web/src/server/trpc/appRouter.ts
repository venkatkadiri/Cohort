import { router } from './trpc'
import { usersRouter } from './routers/users.router'
import { eventTypesRouter } from './routers/eventTypes.router'
import { availabilityRouter } from './routers/availability.router'
import { slotsRouter } from './routers/slots.router'
import { bookingsRouter } from './routers/bookings.router'
import { lecturesRouter } from './routers/lectures.router'
import { configRouter } from './routers/config.router'
import { notificationsRouter } from './routers/notifications.router'

export const appRouter = router({
  users: usersRouter,
  eventTypes: eventTypesRouter,
  availability: availabilityRouter,
  slots: slotsRouter,
  bookings: bookingsRouter,
  lectures: lecturesRouter,
  config: configRouter,
  notifications: notificationsRouter,
})

export type AppRouter = typeof appRouter
