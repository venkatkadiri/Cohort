import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import { generateCorrelationId } from './correlation.js'
import { createLogger } from './logger.js'

const logger = createLogger('gRPC-Engine')

export function loadCohortProto(protoPath: string) {
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })
  return (grpc.loadPackageDefinition(packageDefinition) as any).cohort
}

export function createGrpcMetadata(correlationId?: string): grpc.Metadata {
  const metadata = new grpc.Metadata()
  const reqId = correlationId || generateCorrelationId()
  metadata.add('x-correlation-id', reqId)
  return metadata
}

export function extractGrpcCorrelationId(call: grpc.ServerUnaryCall<any, any>): string {
  const meta = call.metadata.get('x-correlation-id')
  if (meta && meta.length > 0) {
    return String(meta[0])
  }
  return generateCorrelationId()
}

export function startGrpcServer(
  server: grpc.Server,
  port: number,
  serviceName: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, boundPort) => {
        if (err) {
          logger.error(`Failed to bind gRPC server for ${serviceName} on port ${port}`, { error: err.message })
          return reject(err)
        }
        logger.info(`⚡ [gRPC Server] ${serviceName} listening on port ${boundPort} (binary Protobuf)`)
        resolve(boundPort)
      }
    )
  })
}
