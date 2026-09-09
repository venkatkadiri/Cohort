import { Request, Response } from 'express'
import { videoService } from '../../services/video.service.js'
import { generateMasterPlaylist, generateDemoVariantPlaylist } from '../../transcoder/hls.js'
import { logger } from '../../utils/logger.js'
import { paginateWithCursor } from '../../utils/pagination.js'

export async function uploadVideoController(req: Request, res: Response): Promise<void> {
  try {
    const { teacherId, teacherName, title, description, trackId, trackTitle } = req.body

    const file = req.file
    const originalFileName = file?.originalname || 'lecture-recording.mp4'
    const fileSizeBytes = file?.size || 150000000

    if (!title) {
      res.status(400).json({ error: 'Title is required' })
      return
    }

    const video = await videoService.uploadLecture({
      teacherId: teacherId || '1',
      teacherName: teacherName || 'Ada Lovelace',
      title,
      description,
      trackId,
      trackTitle,
      originalFileName,
      fileSizeBytes,
    })

    res.status(201).json({
      version: 'v1',
      success: true,
      video,
    })
  } catch (error: any) {
    logger.error('Upload video failed:', error)
    res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}

export async function listVideosController(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '20', 10), 1), 100)
    const cursor = (req.query.cursor as string) || null

    const allVideos = await videoService.getAllVideos()
    const paginated = paginateWithCursor(allVideos, limit, cursor)

    res.json({
      version: 'v1',
      success: true,
      videos: paginated.items,
      pageInfo: paginated.pageInfo,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export async function getVideoController(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const video = await videoService.getVideoById(id)
    if (!video) {
      res.status(404).json({ error: 'Video not found' })
      return
    }
    res.json({
      version: 'v1',
      success: true,
      video,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export async function streamMasterPlaylistController(req: Request, res: Response): Promise<void> {
  const { videoId } = req.params
  const video = await videoService.getVideoById(videoId)
  if (!video) {
    res.status(404).send('Video not found')
    return
  }

  const manifest = generateMasterPlaylist()
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
  res.send(manifest)
}

export async function streamVariantPlaylistController(req: Request, res: Response): Promise<void> {
  const { videoId, variant } = req.params
  const video = await videoService.getVideoById(videoId)
  if (!video) {
    res.status(404).send('Video not found')
    return
  }

  const cleanVariant = variant.replace('.m3u8', '')
  const manifest = generateDemoVariantPlaylist(cleanVariant, video.durationSeconds || 300)
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
  res.send(manifest)
}
