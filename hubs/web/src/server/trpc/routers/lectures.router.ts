import { z } from 'zod'
import { router, publicProcedure, teacherProcedure } from '../trpc'
import { paginateWithCursor } from '../../../utils/pagination'

const LECTURES_CATALOG = [
  {
    id: 'lecture-1',
    title: 'Distributed Systems & Consensus: Raft & Paxos Deep Dive',
    teacherId: '1',
    teacherName: 'Ada Lovelace',
    trackTitle: 'Systems Architecture',
    durationMinutes: 45,
    resolutions: ['1080p', '720p', '480p', '360p'],
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
    description: 'Masterclass on distributed log replication, quorum intersections, state machine safety, and leader election protocols.',
    lessonsCount: 7,
  },
  {
    id: 'lecture-2',
    title: 'High-Performance Node.js: Event Loop, Libuv & Memory Profiles',
    teacherId: '1',
    teacherName: 'Ada Lovelace',
    trackTitle: 'Backend Engineering',
    durationMinutes: 52,
    resolutions: ['1080p', '720p', '480p', '360p'],
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
    description: 'Profiling asynchronous I/O bottlenecks, microtask queue scheduling, V8 heap snapshots, and native C++ addons.',
    lessonsCount: 5,
  },
  {
    id: 'lecture-3',
    title: 'Compiler Design: Lexing, AST Parsing & Bytecode Optimization',
    teacherId: '2',
    teacherName: 'Grace Hopper',
    trackTitle: 'Compilers & Languages',
    durationMinutes: 60,
    resolutions: ['1080p', '720p', '480p', '360p'],
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
    description: 'Constructing an end-to-end compiler with recursive descent parsing, intermediate representation, and register allocation.',
    lessonsCount: 6,
  },
]

export const lecturesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          track: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().int().min(1).max(100).default(20).optional(),
          cursor: z.string().nullish(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      let filtered = [...LECTURES_CATALOG]
      if (input?.track && input.track !== 'ALL') {
        filtered = filtered.filter((l) => l.trackTitle === input.track)
      }
      if (input?.search) {
        const q = input.search.toLowerCase()
        filtered = filtered.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.teacherName.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q)
        )
      }
      return paginateWithCursor(filtered, input?.limit ?? 20, input?.cursor)
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const lecture = LECTURES_CATALOG.find((l) => l.id === input.id)
      return lecture || null
    }),

  upload: teacherProcedure
    .input(
      z.object({
        title: z.string().min(3),
        trackTitle: z.string(),
        description: z.string().optional(),
        originalFileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const newLecture = {
        id: `lecture-${Date.now()}`,
        title: input.title,
        teacherId: '1',
        teacherName: 'Ada Lovelace',
        trackTitle: input.trackTitle,
        durationMinutes: 30,
        resolutions: ['1080p', '720p', '480p', '360p'],
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
        description: input.description || 'Newly published cohort masterclass.',
        lessonsCount: 1,
      }
      return newLecture
    }),
})
