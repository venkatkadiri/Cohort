import { videoService } from '../../services/video.service.js'

export const videoResolvers = {
  Query: {
    videos: async () => {
      return videoService.getAllVideos()
    },
    video: async (_: unknown, { id }: { id: string }) => {
      return videoService.getVideoById(id)
    },
    teacherVideos: async (_: unknown, { teacherId }: { teacherId: string }) => {
      return videoService.getVideosByTeacher(teacherId)
    },
    videoHealth: () => 'Video service is operational',
  },
  Mutation: {
    deleteVideo: async (_: unknown, { id, teacherId }: { id: string; teacherId: string }) => {
      return videoService.deleteLecture(id, teacherId)
    },
  },
}
