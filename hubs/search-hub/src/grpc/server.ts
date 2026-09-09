import grpc from '@grpc/grpc-js'
import path from 'path'
import fs from 'fs'
import { loadCohortProto, startGrpcServer, createLogger } from '@cohort/observability'

const logger = createLogger('search-service:grpc')

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

export async function startSearchGrpcServer(port: number = 50053): Promise<grpc.Server> {
  const protoPath = findProtoPath()
  const cohortProto = loadCohortProto(protoPath)
  const server = new grpc.Server()

  server.addService(cohortProto.SearchService.service, {
    Search: async (call: any, callback: any) => {
      const q = (call.request.query || '').toLowerCase()
      const catalog = [
        { id: '1', type: 'TEACHER', title: 'Ada Lovelace', subtitle: 'Distributed Systems Mentor', url: '/teachers/1' },
        { id: '2', type: 'TEACHER', title: 'Grace Hopper', subtitle: 'Compiler Engineering Mentor', url: '/teachers/2' },
        { id: '3', type: 'LECTURE', title: 'Raft & Paxos Masterclass', subtitle: 'Video Lecture', url: '/vault' },
      ]
      const matches = catalog.filter(
        (c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
      )
      callback(null, { results: matches })
    },
  })

  await startGrpcServer(server, port, 'search-service')
  return server
}
