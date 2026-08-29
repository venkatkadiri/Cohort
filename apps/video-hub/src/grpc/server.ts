import grpc from '@grpc/grpc-js'
import path from 'path'
import fs from 'fs'
import { loadCohortProto, startGrpcServer, createLogger } from '@cohort/observability'

const logger = createLogger('video-service:grpc')

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

const SAMPLE_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Distributed Systems & Consensus: Raft & Paxos Deep Dive',
    teacher_id: '1',
    teacher_name: 'Ada Lovelace',
    track_title: 'Systems Architecture',
    duration_minutes: 45,
    resolutions: ['1080p', '720p', '480p', '360p'],
    stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
    description: 'Masterclass on distributed log replication, quorum intersections, state machine safety, and leader election protocols.',
    created_at: new Date().toISOString(),
  },
]

export async function startVideoGrpcServer(port: number = 50055): Promise<grpc.Server> {
  const protoPath = findProtoPath()
  const cohortProto = loadCohortProto(protoPath)
  const server = new grpc.Server()

  server.addService(cohortProto.VideoService.service, {
    ListVideos: async (_call: any, callback: any) => {
      callback(null, {
        videos: SAMPLE_VIDEOS,
        page_info: {
          has_next_page: false,
          has_previous_page: false,
          total_count: SAMPLE_VIDEOS.length,
        },
      })
    },
    GetVideo: async (call: any, callback: any) => {
      const vid = SAMPLE_VIDEOS.find((v) => v.id === call.request.id) || SAMPLE_VIDEOS[0]
      callback(null, vid)
    },
  })

  await startGrpcServer(server, port, 'video-service')
  return server
}
