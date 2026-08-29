import { videoRepository } from '../database/repositories/video.repository.js'
import { HLS_PROFILES } from './hls.js'
import { logger } from '../utils/logger.js'

export class TranscodeWorker {
  async processVideo(videoId: string): Promise<void> {
    logger.info(`Starting transcoding pipeline for video ${videoId}`)
    await videoRepository.update(videoId, {
      status: 'PROCESSING',
      progressPercentage: 10,
    })

    // Simulate progressive multi-resolution encoding step-by-step
    const steps = [
      { progress: 30, desc: 'Transcoding 360p & 480p streams...' },
      { progress: 65, desc: 'Transcoding 720p HD stream...' },
      { progress: 90, desc: 'Transcoding 1080p FHD & generating master.m3u8...' },
      { progress: 100, desc: 'HLS Stream Ready' },
    ]

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 600))
      logger.info(`Transcode progress for ${videoId}: ${step.progress}% - ${step.desc}`)
      await videoRepository.update(videoId, {
        progressPercentage: step.progress,
        status: step.progress === 100 ? 'READY' : 'PROCESSING',
        availableResolutions: HLS_PROFILES.map((p) => p.label),
        masterPlaylistUrl: `/api/videos/stream/${videoId}/master.m3u8`,
      })
    }

    logger.info(`Transcoding completed successfully for video ${videoId}`)
  }
}

export const transcodeWorker = new TranscodeWorker()
