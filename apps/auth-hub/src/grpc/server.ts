import grpc from '@grpc/grpc-js'
import path from 'path'
import fs from 'fs'
import { loadCohortProto, startGrpcServer, createLogger, extractGrpcCorrelationId } from '@cohort/observability'

const logger = createLogger('auth-service:grpc')

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

export async function startAuthGrpcServer(port: number = 50054): Promise<grpc.Server> {
  const protoPath = findProtoPath()
  const cohortProto = loadCohortProto(protoPath)
  const server = new grpc.Server()

  server.addService(cohortProto.AuthService.service, {
    CreateEnroller: async (call: any, callback: any) => {
      const reqId = extractGrpcCorrelationId(call)
      logger.info(`[gRPC CreateEnroller] Email: ${call.request.email}`, { reqId })
      callback(null, {
        id: Math.floor(Math.random() * 1000) + 1,
        email: call.request.email,
        name: call.request.name,
        auth_id: call.request.auth_id || `auth_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    },
  })

  await startGrpcServer(server, port, 'auth-service')
  return server
}
