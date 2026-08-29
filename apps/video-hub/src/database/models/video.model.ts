export type VideoProcessingStatus = 'UPLOADING' | 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED'

export interface VideoResolutionProfile {
  label: '360p' | '480p' | '720p' | '1080p'
  width: number
  height: number
  bitrate: string // e.g. 800k, 2500k, 5000k
  audioBitrate: string // e.g. 96k, 128k, 192k
  playlistName: string // e.g. 720p.m3u8
}

export interface LectureVideoModel {
  id: string
  teacherId: string
  teacherName: string
  title: string
  description?: string
  trackId?: string
  trackTitle?: string
  originalFileName: string
  durationSeconds: number
  fileSizeBytes: number
  status: VideoProcessingStatus
  progressPercentage: number
  masterPlaylistUrl: string
  availableResolutions: string[] // ['360p', '480p', '720p', '1080p']
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
}
