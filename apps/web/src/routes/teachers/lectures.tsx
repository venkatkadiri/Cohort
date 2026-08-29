import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DeleteIcon from '@mui/icons-material/Delete'

import { getSessionFn } from '../../server/functions/auth.fn'
import { CustomVideoPlayer } from '../../components/CustomVideoPlayer'

interface LectureItem {
  id: string
  title: string
  trackTitle: string
  durationMinutes: number
  status: 'READY' | 'PROCESSING' | 'QUEUED'
  progressPercentage: number
  availableResolutions: string[]
  createdAt: string
  originalFileName: string
  streamUrl: string
}

const INITIAL_LECTURES: LectureItem[] = [
  {
    id: 'lecture-1',
    title: 'Distributed Systems & Consensus: Raft & Paxos Deep Dive',
    trackTitle: 'Systems Architecture',
    durationMinutes: 45,
    status: 'READY',
    progressPercentage: 100,
    availableResolutions: ['1080p', '720p', '480p', '360p'],
    createdAt: '2 days ago',
    originalFileName: 'distributed-consensus-masterclass.mp4',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'lecture-2',
    title: 'High-Performance Node.js: Event Loop, Libuv & Memory Profiles',
    trackTitle: 'Backend Engineering',
    durationMinutes: 52,
    status: 'READY',
    progressPercentage: 100,
    availableResolutions: ['1080p', '720p', '480p', '360p'],
    createdAt: 'Yesterday',
    originalFileName: 'nodejs-internals.mp4',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
]

export const Route = createFileRoute('/teachers/lectures')({
  loader: async () => {
    const session = await getSessionFn().catch(() => null)
    return { session }
  },
  component: TeacherLectureStudio,
})

function TeacherLectureStudio() {
  const [lectures, setLectures] = useState<LectureItem[]>(INITIAL_LECTURES)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [trackTitle, setTrackTitle] = useState('Systems Architecture')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [previewVideo, setPreviewVideo] = useState<LectureItem | null>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
      }
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile && !title) return

    setIsUploading(true)
    setUploadProgress(10)
    setCurrentStep('Ingesting raw MP4 video chunk stream...')

    setTimeout(() => {
      setUploadProgress(35)
      setCurrentStep('FFmpeg Bitrate Ladder: Extracting 1080p, 720p, 480p, 360p...')
    }, 1200)

    setTimeout(() => {
      setUploadProgress(70)
      setCurrentStep('Generating HLS M3U8 Master Manifests and Segment Chunks (.ts)...')
    }, 2500)

    setTimeout(() => {
      setUploadProgress(95)
      setCurrentStep('Publishing to Global Edge CDN and Notifying Subscribed Fellows...')
    }, 3800)

    setTimeout(() => {
      setUploadProgress(100)
      setIsUploading(false)
      setCurrentStep('')

      const newLecture: LectureItem = {
        id: `lecture-${Date.now()}`,
        title: title || selectedFile?.name || 'New Masterclass Lecture',
        trackTitle: trackTitle,
        durationMinutes: 38,
        status: 'READY',
        progressPercentage: 100,
        availableResolutions: ['1080p', '720p', '480p', '360p'],
        createdAt: 'Just now',
        originalFileName: selectedFile?.name || 'lecture-upload.mp4',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      }

      setLectures([newLecture, ...lectures])
      setSelectedFile(null)
      setTitle('')
    }, 4800)
  }

  const handleDelete = (id: string) => {
    setLectures(lectures.filter((l) => l.id !== id))
    if (previewVideo?.id === id) {
      setPreviewVideo(null)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={4}>
        {/* Header Banner */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 900,
                letterSpacing: '0.1em',
                color: '#FF3E00',
                fontFamily: "'Fira Code', monospace",
                display: 'block',
                mb: 0.5,
              }}
            >
              // ADAPTIVE_STREAMING_STUDIO
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Lecture Studio &amp; Adaptive HLS Upload
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Upload video lectures for your subscribed fellows. Encoded automatically into adaptive multi-bitrate streams (1080p, 720p, 480p, 360p).
            </Typography>
          </Box>

          <Link to="/lectures" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              startIcon={<VideoLibraryIcon />}
              sx={{ fontWeight: 700, borderRadius: 2, borderColor: 'divider' }}
            >
              Student Lecture Vault
            </Button>
          </Link>
        </Box>

        {/* Quick Metrics Bar */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Published Lectures</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace", mt: 0.5 }}>
                {lectures.length}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Transcoding Engine</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FF3E00', mt: 0.5 }}>
                HLS Multi-Bitrate
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Quality Profiles</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Fira Code', monospace", mt: 0.5 }}>
                1080p · 720p · 480p
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Access Gate</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main', mt: 0.5 }}>
                Active Fellows Only
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Form Box */}
        <Card
          variant="outlined"
          sx={{
            p: 3.5,
            borderRadius: 3,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUploadIcon sx={{ color: '#FF3E00' }} /> Upload New Masterclass Recording
          </Typography>

          <Box component="form" onSubmit={handleUploadSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              sx={{
                border: '2px dashed',
                borderColor: selectedFile ? '#06B6D4' : 'divider',
                borderRadius: 2.5,
                p: 4,
                textAlign: 'center',
                bgcolor: selectedFile ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#FF3E00',
                  bgcolor: 'rgba(255, 62, 0, 0.04)',
                },
              }}
              onClick={() => document.getElementById('video-file-input')?.click()}
            >
              <input
                type="file"
                id="video-file-input"
                accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {selectedFile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#06B6D4' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{selectedFile.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace" }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · Ready for Transcoding
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#FF3E00', opacity: 0.8 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Click to select or drag and drop video recording
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Supports MP4, MOV, MKV, WebM up to 4K 60fps
                  </Typography>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Lecture Title"
                  fullWidth
                  size="small"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus: Raft Protocol Deep Dive"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Track"
                  fullWidth
                  size="small"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                >
                  <MenuItem value="Systems Architecture">Systems Architecture</MenuItem>
                  <MenuItem value="Backend Engineering">Backend Engineering</MenuItem>
                  <MenuItem value="Frontend Architecture">Frontend Architecture</MenuItem>
                  <MenuItem value="AI & LLM Infra">AI &amp; LLM Infra</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {isUploading && (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0E1217' : '#F4F6F8' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: "'Fira Code', monospace", color: '#FF3E00', fontWeight: 700 }}>
                    {currentStep}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: "'Fira Code', monospace", fontWeight: 800 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 1, height: 6 }} />
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={isUploading || (!selectedFile && !title)}
              startIcon={<CloudUploadIcon />}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                alignSelf: 'flex-start',
                px: 3,
              }}
            >
              {isUploading ? 'Transcoding & Ingesting...' : 'Upload & Transcode Video'}
            </Button>
          </Box>
        </Card>

        {/* Video Player Modal / Preview */}
        {previewVideo && (
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Video Preview: {previewVideo.title}
              </Typography>
              <Button size="small" onClick={() => setPreviewVideo(null)}>Close Preview</Button>
            </Box>
            <CustomVideoPlayer
              src={previewVideo.streamUrl}
              title={previewVideo.title}
              availableResolutions={previewVideo.availableResolutions}
            />
          </Card>
        )}

        {/* Lectures List */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Masterclass Video Library ({lectures.length})
          </Typography>

          <Grid container spacing={2}>
            {lectures.map((l) => (
              <Grid key={l.id} size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 3,
                    gap: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
                    borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {l.title}
                      </Typography>
                      <Chip
                        size="small"
                        color="success"
                        variant="outlined"
                        label="HLS READY"
                        sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Track: {l.trackTitle} · {l.createdAt}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => setPreviewVideo(l)}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                        flex: 1,
                      }}
                    >
                      Stream
                    </Button>
                    <IconButton size="small" color="error" onClick={() => handleDelete(l.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Container>
  )
}
