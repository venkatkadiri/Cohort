import grpc from '@grpc/grpc-js'
import path from 'path'
import fs from 'fs'
import { loadCohortProto, startGrpcServer, createLogger } from '@cohort/observability'

const logger = createLogger('configuration-hub:grpc')

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

const FEATURE_FLAGS = [
  {
    key: 'FELLOWS_HUB',
    name: 'Fellows Hub & Enrollers',
    description: 'Enables students and fellows to discover cohorts and request 1-on-1 slots.',
    category: 'NETWORKING',
    default_enabled: true,
  },
  {
    key: 'LECTURES_VAULT',
    name: 'Lectures & Masterclasses Vault',
    description: 'Access recorded masterclasses with custom HLS adaptive video player.',
    category: 'EDUCATION',
    default_enabled: true,
  },
  {
    key: 'DROP_ALERTS',
    name: 'Real-time Drop Alerts',
    description: 'Instant notification banner and push alerts when a teacher drops new office hour slots.',
    category: 'NOTIFICATIONS',
    default_enabled: true,
  },
]

export async function startConfigGrpcServer(port: number = 50056): Promise<grpc.Server> {
  const protoPath = findProtoPath()
  const cohortProto = loadCohortProto(protoPath)
  const server = new grpc.Server()

  server.addService(cohortProto.ConfigService.service, {
    ListFeatures: async (_call: any, callback: any) => {
      callback(null, { features: FEATURE_FLAGS })
    },
    GetRoleConfig: async (call: any, callback: any) => {
      const role = call.request.role || 'STUDENT'
      const features: Record<string, boolean> = {
        FELLOWS_HUB: true,
        LECTURES_VAULT: true,
        DROP_ALERTS: role !== 'STUDENT' ? true : false,
      }
      callback(null, { role, features })
    },
  })

  await startGrpcServer(server, port, 'configuration-hub')
  return server
}
