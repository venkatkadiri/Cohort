import grpc from '@grpc/grpc-js'
import path from 'path'
import fs from 'fs'
import { loadCohortProto, startGrpcServer, createLogger, extractGrpcCorrelationId } from '@cohort/observability'

const logger = createLogger('notification-service:grpc')

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

export async function startNotificationGrpcServer(port: number = 50052): Promise<grpc.Server> {
  const protoPath = findProtoPath()
  const cohortProto = loadCohortProto(protoPath)
  const server = new grpc.Server()

  server.addService(cohortProto.NotificationService.service, {
    SendNotification: async (call: any, callback: any) => {
      const reqId = extractGrpcCorrelationId(call)
      logger.info(`[gRPC SendNotification] To: ${call.request.recipient_email}`, { reqId })
      callback(null, { success: true, message: 'Notification dispatched successfully via gRPC' })
    },
    ListNotifications: async (_call: any, callback: any) => {
      callback(null, {
        notifications: [
          {
            id: 'n-1',
            title: 'Office Hours Dropped!',
            message: 'Ada Lovelace dropped 2 slots for Distributed Systems Review.',
            category: 'DROP_ALERT',
            timestamp: '10m ago',
            read: false,
          },
          {
            id: 'n-2',
            title: 'New Masterclass Published',
            message: 'Netflix-Style HLS Adaptive Streaming Architecture is now live.',
            category: 'LECTURE',
            timestamp: '1h ago',
            read: false,
          },
        ],
      })
    },
  })

  await startGrpcServer(server, port, 'notification-service')
  return server
}
