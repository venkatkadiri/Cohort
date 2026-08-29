import grpc from '@grpc/grpc-js'
import path from 'path'
import fs from 'fs'
import { loadCohortProto, startGrpcServer, createLogger, extractGrpcCorrelationId } from '@cohort/observability'
import { bookingService } from '../services/booking.service.js'
import { slotService } from '../services/slot.service.js'
import { eventTypeService } from '../services/event-type.service.js'

const logger = createLogger('booking-service:grpc')

function findProtoPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'proto', 'cohort.proto'),
    path.resolve(process.cwd(), '..', '..', 'proto', 'cohort.proto'),
    path.resolve(process.cwd(), '..', 'proto', 'cohort.proto'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return candidates[0]
}

export async function startBookingGrpcServer(port: number = 50051): Promise<grpc.Server> {
  const protoPath = findProtoPath()
  const cohortProto = loadCohortProto(protoPath)
  const server = new grpc.Server()

  // 1. BookingService Implementation
  server.addService(cohortProto.BookingService.service, {
    ListBookings: async (call: any, callback: any) => {
      const reqId = extractGrpcCorrelationId(call)
      try {
        const bookings = await bookingService.listBookings(call.request.host_id || call.request.hostId)
        callback(null, { bookings })
      } catch (err: any) {
        logger.error(`[gRPC ListBookings Error] ${err.message}`, { reqId })
        callback(err)
      }
    },
    GetBookingById: async (call: any, callback: any) => {
      const reqId = extractGrpcCorrelationId(call)
      try {
        const booking = await bookingService.getBookingById(call.request.id, call.request.host_id)
        callback(null, booking || {})
      } catch (err: any) {
        logger.error(`[gRPC GetBookingById Error] ${err.message}`, { reqId })
        callback(err)
      }
    },
    CreateBooking: async (call: any, callback: any) => {
      const reqId = extractGrpcCorrelationId(call)
      try {
        const req = call.request
        const booking = await bookingService.createBooking({
          eventTypeId: req.event_type_id || req.eventTypeId,
          slotId: req.slot_id || req.slotId,
          inviteeName: req.invitee_name || req.inviteeName,
          inviteeEmail: req.invitee_email || req.inviteeEmail,
          inviteeNotes: req.invitee_notes || req.inviteeNotes,
        })
        callback(null, booking)
      } catch (err: any) {
        logger.error(`[gRPC CreateBooking Error] ${err.message}`, { reqId })
        callback(err)
      }
    },
    CancelBooking: async (call: any, callback: any) => {
      const reqId = extractGrpcCorrelationId(call)
      try {
        const booking = await bookingService.cancelBooking(call.request.id, call.request.host_id)
        callback(null, booking)
      } catch (err: any) {
        logger.error(`[gRPC CancelBooking Error] ${err.message}`, { reqId })
        callback(err)
      }
    },
  })

  // 2. SlotService Implementation
  server.addService(cohortProto.SlotService.service, {
    GetAvailableSlots: async (call: any, callback: any) => {
      try {
        const slots = await slotService.getAvailableSlots(
          call.request.event_type_id || call.request.eventTypeId,
          call.request.date
        )
        callback(null, { slots })
      } catch (err: any) {
        callback(err)
      }
    },
    ListSlotsForHost: async (call: any, callback: any) => {
      try {
        const slots = await slotService.listSlotsForHost(
          call.request.host_id || call.request.hostId,
          call.request.from,
          call.request.to
        )
        callback(null, { slots })
      } catch (err: any) {
        callback(err)
      }
    },
    CreateSlot: async (call: any, callback: any) => {
      try {
        const slot = await slotService.createSlot({
          hostId: call.request.host_id || call.request.hostId,
          eventTypeId: call.request.event_type_id || call.request.eventTypeId,
          startAt: call.request.start_at || call.request.startAt,
          endAt: call.request.end_at || call.request.endAt,
        })
        callback(null, slot)
      } catch (err: any) {
        callback(err)
      }
    },
    DeleteSlot: async (call: any, callback: any) => {
      try {
        const res = await slotService.deleteSlot(call.request.id, call.request.host_id)
        callback(null, res)
      } catch (err: any) {
        callback(err)
      }
    },
    RegenerateSlots: async (call: any, callback: any) => {
      try {
        const res = await slotService.regenerateSlots(
          call.request.host_id || call.request.hostId,
          call.request.from,
          call.request.to,
          call.request.days_ahead || call.request.daysAhead
        )
        callback(null, res)
      } catch (err: any) {
        callback(err)
      }
    },
  })

  // 3. EventTypeService Implementation
  server.addService(cohortProto.EventTypeService.service, {
    ListEventTypes: async (call: any, callback: any) => {
      try {
        const eventTypes = await eventTypeService.listEventTypes(call.request.host_id || call.request.hostId)
        callback(null, { event_types: eventTypes })
      } catch (err: any) {
        callback(err)
      }
    },
    GetEventTypeById: async (call: any, callback: any) => {
      try {
        const eventType = await eventTypeService.getEventTypeById(call.request.id)
        callback(null, eventType || {})
      } catch (err: any) {
        callback(err)
      }
    },
  })

  await startGrpcServer(server, port, 'booking-service')
  return server
}
