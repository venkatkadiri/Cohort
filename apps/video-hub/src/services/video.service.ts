import { videoRepository } from '../database/repositories/video.repository.js'
import { LectureVideoModel } from '../database/models/video.model.js'
import { transcodeWorker } from '../transcoder/ffmpeg.js'
import { logger } from '../utils/logger.js'

export class VideoService {
  async getAllVideos(): Promise<LectureVideoModel[]> {
    return videoRepository.listAll()
  }

  async getVideoById(id: string): Promise<LectureVideoModel | null> {
    return videoRepository.findById(id)
  }

  async getVideosByTeacher(teacherId: string): Promise<LectureVideoModel[]> {
    return videoRepository.listByTeacherId(teacherId)
  }

  async uploadLecture(data: {
    teacherId: string
    teacherName: string
    title: string
    description?: string
    trackId?: string
    trackTitle?: string
    originalFileName: string
    fileSizeBytes: number
  }): Promise<LectureVideoModel> {
    logger.info(`Teacher ${data.teacherName} (${data.teacherId}) uploaded lecture "${data.title}"`)

    const video = await videoRepository.create({
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      title: data.title,
      description: data.description,
      trackId: data.trackId,
      trackTitle: data.trackTitle,
      originalFileName: data.originalFileName,
      durationSeconds: 1800, // estimated 30 mins
      fileSizeBytes: data.fileSizeBytes,
      status: 'QUEUED',
      progressPercentage: 0,
      masterPlaylistUrl: '',
      availableResolutions: [],
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
    })

    // Trigger async transcoding in background
    transcodeWorker.processVideo(video.id).catch((err) => {
      logger.error(`Transcoding job error for ${video.id}:`, err)
      videoRepository.update(video.id, { status: 'FAILED' })
    })

    return video
  }

  async deleteLecture(id: string, teacherId: string): Promise<boolean> {
    const video = await videoRepository.findById(id)
    if (!video || video.teacherId !== String(teacherId)) {
      return false
    }
    return videoRepository.delete(id)
  }
}

export const videoService = new VideoService()
