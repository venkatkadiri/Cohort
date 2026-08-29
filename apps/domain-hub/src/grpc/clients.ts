import grpc from '@grpc/grpc-js'
import path from 'path'
import fs from 'fs'
import { loadCohortProto, createGrpcMetadata, createLogger } from '@cohort/observability'

const logger = createLogger('domain-hub:grpc-clients')

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

const protoPath = findProtoPath()
const cohortProto = loadCohortProto(protoPath)

const BOOKING_GRPC_ADDR = process.env.BOOKING_GRPC_URL || '127.0.0.1:50051'
const NOTIFICATION_GRPC_ADDR = process.env.NOTIFICATION_GRPC_URL || '127.0.0.1:50052'
const SEARCH_GRPC_ADDR = process.env.SEARCH_GRPC_URL || '127.0.0.1:50053'
const AUTH_GRPC_ADDR = process.env.AUTH_GRPC_URL || '127.0.0.1:50054'
const VIDEO_GRPC_ADDR = process.env.VIDEO_GRPC_URL || '127.0.0.1:50055'
const CONFIG_GRPC_ADDR = process.env.CONFIG_GRPC_URL || '127.0.0.1:50056'

const credentials = grpc.credentials.createInsecure()

// 1. Spoke Clients
export const grpcBookingClient = new cohortProto.BookingService(BOOKING_GRPC_ADDR, credentials)
export const grpcSlotClient = new cohortProto.SlotService(BOOKING_GRPC_ADDR, credentials)
export const grpcEventTypeClient = new cohortProto.EventTypeService(BOOKING_GRPC_ADDR, credentials)
export const grpcNotificationClient = new cohortProto.NotificationService(NOTIFICATION_GRPC_ADDR, credentials)
export const grpcSearchClient = new cohortProto.SearchService(SEARCH_GRPC_ADDR, credentials)
export const grpcAuthClient = new cohortProto.AuthService(AUTH_GRPC_ADDR, credentials)
export const grpcVideoClient = new cohortProto.VideoService(VIDEO_GRPC_ADDR, credentials)
export const grpcConfigClient = new cohortProto.ConfigService(CONFIG_GRPC_ADDR, credentials)

// 2. High-throughput Promisified Helper Callers
export const grpcCall = {
  // Booking Spoke
  listBookings: (hostId: number, correlationId?: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const meta = createGrpcMetadata(correlationId)
      grpcBookingClient.ListBookings({ host_id: hostId }, meta, (err: any, res: any) => {
        if (err) return reject(err)
        resolve(res.bookings || [])
      })
    })
  },

  createBooking: (input: any, correlationId?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const meta = createGrpcMetadata(correlationId)
      grpcBookingClient.CreateBooking(
        {
          event_type_id: input.eventTypeId,
          slot_id: input.slotId,
          invitee_name: input.inviteeName,
          invitee_email: input.inviteeEmail,
          invitee_notes: input.inviteeNotes,
        },
        meta,
        (err: any, res: any) => {
          if (err) return reject(err)
          resolve(res)
        }
      )
    })
  },

  // Slots Spoke
  listSlotsForHost: (hostId: number, from?: string, to?: string, correlationId?: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const meta = createGrpcMetadata(correlationId)
      grpcSlotClient.ListSlotsForHost({ host_id: hostId, from, to }, meta, (err: any, res: any) => {
        if (err) return reject(err)
        resolve(res.slots || [])
      })
    })
  },

  getAvailableSlots: (eventTypeId: number, date: string, correlationId?: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const meta = createGrpcMetadata(correlationId)
      grpcSlotClient.GetAvailableSlots({ event_type_id: eventTypeId, date }, meta, (err: any, res: any) => {
        if (err) return reject(err)
        resolve(res.slots || [])
      })
    })
  },

  // Notifications Spoke
  sendNotification: (recipientEmail: string, title: string, message: string, category: string = 'ALERT', correlationId?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const meta = createGrpcMetadata(correlationId)
      grpcNotificationClient.SendNotification(
        { recipient_email: recipientEmail, title, message, category },
        meta,
        (err: any, res: any) => {
          if (err) return reject(err)
          resolve(res)
        }
      )
    })
  },

  // Search Spoke
  search: (query: string, filter?: string, correlationId?: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const meta = createGrpcMetadata(correlationId)
      grpcSearchClient.Search({ query, filter }, meta, (err: any, res: any) => {
        if (err) return reject(err)
        resolve(res.results || [])
      })
    })
  },

  // Config Spoke
  listFeatures: (correlationId?: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const meta = createGrpcMetadata(correlationId)
      grpcConfigClient.ListFeatures({}, meta, (err: any, res: any) => {
        if (err) return reject(err)
        resolve(res.features || [])
      })
    })
  },
}

logger.info('⚡ [Hub gRPC Client Pool] Initialized channels to all 6 Spokes (Ports 50051-50056)')
