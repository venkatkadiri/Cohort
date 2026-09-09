import { VideoResolutionProfile } from '../database/models/video.model.js'

export const HLS_PROFILES: VideoResolutionProfile[] = [
  {
    label: '1080p',
    width: 1920,
    height: 1080,
    bitrate: '4500k',
    audioBitrate: '192k',
    playlistName: '1080p.m3u8',
  },
  {
    label: '720p',
    width: 1280,
    height: 720,
    bitrate: '2500k',
    audioBitrate: '128k',
    playlistName: '720p.m3u8',
  },
  {
    label: '480p',
    width: 854,
    height: 480,
    bitrate: '1200k',
    audioBitrate: '96k',
    playlistName: '480p.m3u8',
  },
  {
    label: '360p',
    width: 640,
    height: 360,
    bitrate: '600k',
    audioBitrate: '64k',
    playlistName: '360p.m3u8',
  },
]

export function generateMasterPlaylist(profiles: VideoResolutionProfile[] = HLS_PROFILES): string {
  let master = '#EXTM3U\n#EXT-X-VERSION:3\n'
  for (const p of profiles) {
    const bandwidth = parseInt(p.bitrate) * 1000 + parseInt(p.audioBitrate) * 1000
    master += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${p.width}x${p.height},NAME="${p.label}"\n${p.playlistName}\n`
  }
  return master
}

export function generateDemoVariantPlaylist(label: string, durationSeconds: number = 300): string {
  let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n'
  const segmentCount = Math.min(Math.ceil(durationSeconds / 10), 30)
  for (let i = 0; i < segmentCount; i++) {
    playlist += `#EXTINF:10.000,\nsegment_${label}_${i}.ts\n`
  }
  playlist += '#EXT-X-ENDLIST\n'
  return playlist
}
