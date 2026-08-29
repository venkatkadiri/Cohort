import { LectureVideoModel } from '../models/video.model.js'

export class VideoRepository {
  private videos: LectureVideoModel[] = [
    {
      id: 'lecture-1',
      teacherId: '1',
      teacherName: 'Ada Lovelace',
      title: 'Distributed Systems & Consensus: Raft & Paxos Deep Dive',
      description: 'Masterclass on implementing fault-tolerant distributed log replication and leader election.',
      trackId: 'track-1',
      trackTitle: 'Systems Architecture',
      originalFileName: 'distributed-consensus-masterclass.mp4',
      durationSeconds: 2700,
      fileSizeBytes: 420000000,
      status: 'READY',
      progressPercentage: 100,
      masterPlaylistUrl: '/api/videos/stream/lecture-1/master.m3u8',
      availableResolutions: ['360p', '480p', '720p', '1080p'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'lecture-2',
      teacherId: '1',
      teacherName: 'Ada Lovelace',
      title: 'High-Performance Node.js: Event Loop, Libuv & Memory Profiles',
      description: 'Profiling asynchronous I/O bottlenecks, microtask queue scheduling, and memory leaks.',
      trackId: 'track-2',
      trackTitle: 'Backend Engineering',
      originalFileName: 'nodejs-internals.mp4',
      durationSeconds: 3120,
      fileSizeBytes: 510000000,
      status: 'READY',
      progressPercentage: 100,
      masterPlaylistUrl: '/api/videos/stream/lecture-2/master.m3u8',
      availableResolutions: ['360p', '480p', '720p', '1080p'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'lecture-3',
      teacherId: '2',
      teacherName: 'Grace Hopper',
      title: 'Compiler Design: Lexing, AST Parsing & Bytecode Optimization',
      description: 'Building an end-to-end programming language compiler from grammar to register allocation.',
      trackId: 'track-3',
      trackTitle: 'Compilers & Languages',
      originalFileName: 'compiler-design-101.mp4',
      durationSeconds: 3600,
      fileSizeBytes: 620000000,
      status: 'READY',
      progressPercentage: 100,
      masterPlaylistUrl: '/api/videos/stream/lecture-3/master.m3u8',
      availableResolutions: ['360p', '480p', '720p', '1080p'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ]

  async listAll(): Promise<LectureVideoModel[]> {
    return this.videos
  }

  async findById(id: string): Promise<LectureVideoModel | null> {
    return this.videos.find((v) => v.id === id) || null
  }

  async listByTeacherId(teacherId: string): Promise<LectureVideoModel[]> {
    return this.videos.filter((v) => v.teacherId === String(teacherId))
  }

  async create(data: Omit<LectureVideoModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<LectureVideoModel> {
    const video: LectureVideoModel = {
      ...data,
      id: `lecture-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.videos.unshift(video)
    return video
  }

  async update(id: string, updates: Partial<LectureVideoModel>): Promise<LectureVideoModel | null> {
    const idx = this.videos.findIndex((v) => v.id === id)
    if (idx === -1) return null
    this.videos[idx] = {
      ...this.videos[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return this.videos[idx]
  }

  async delete(id: string): Promise<boolean> {
    const initialLen = this.videos.length
    this.videos = this.videos.filter((v) => v.id !== id)
    return this.videos.length < initialLen
  }
}

export const videoRepository = new VideoRepository()
