import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState, useMemo } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import SendIcon from '@mui/icons-material/Send'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LayersIcon from '@mui/icons-material/Layers'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'

import { getSessionFn } from '../../server/functions/auth.fn'
import { CustomVideoPlayer } from '../../components/CustomVideoPlayer'

export const Route = createFileRoute('/lectures/$videoId')({
  loader: async ({ params }) => {
    const session = await getSessionFn().catch(() => null)
    return {
      session,
      videoId: params.videoId,
    }
  },
  component: MasterclassPlayerPage,
})

interface LessonModule {
  id: string
  number: number
  title: string
  lessonsCount: number
  hasAttachment?: boolean
  lessons: { id: string; title: string; duration: string; completed?: boolean }[]
}

const SYLLABUS_MODULES: LessonModule[] = [
  {
    id: 'mod-62',
    number: 62,
    title: '[Netflix] HLS Adaptive Streaming | M3U8 | Multi-Bitrate Transcoding',
    lessonsCount: 7,
    lessons: [
      { id: 'l-62-1', title: 'Video Codecs & Bitrate Profiles (1080p, 720p, 480p, 360p)', duration: '14:20', completed: true },
      { id: 'l-62-2', title: 'FFmpeg Pipeline & Segment Chunking (.ts files)', duration: '18:45', completed: true },
      { id: 'l-62-3', title: 'Master M3U8 Playlist Generation & Bandwidth Manifests', duration: '22:10', completed: true },
      { id: 'l-62-4', title: 'Video Ingestion & Multipart Chunk Storage', duration: '16:30', completed: false },
    ],
  },
  {
    id: 'mod-63',
    number: 63,
    title: '[Netflix] System Architecture & Video Chunk Ingestion',
    lessonsCount: 1,
    lessons: [
      { id: 'l-63-1', title: 'High-Throughput Upload Gateways & Streaming Buffers', duration: '28:10', completed: false },
    ],
  },
  {
    id: 'mod-64',
    number: 64,
    title: '[Netflix] Setting up Adaptive Transcoding Pipelines',
    lessonsCount: 1,
    lessons: [
      { id: 'l-64-1', title: 'Worker Threading & Distributed Transcode Jobs', duration: '35:00', completed: false },
    ],
  },
  {
    id: 'mod-65',
    number: 65,
    title: '[Netflix] Workflow Fanout & Transcoding Workers',
    lessonsCount: 1,
    lessons: [
      { id: 'l-65-1', title: 'Temporal Workflows for Distributed Video Processing', duration: '25:40', completed: false },
    ],
  },
  {
    id: 'mod-66',
    number: 66,
    title: '[Netflix] Writing the HLS Streaming API Layer',
    lessonsCount: 1,
    hasAttachment: true,
    lessons: [
      { id: 'l-66-1', title: 'Express & Apollo Server HLS Stream Controller', duration: '31:15', completed: false },
    ],
  },
]

function MasterclassPlayerPage() {
  const { session } = Route.useLoaderData()
  const isTeacher = !!session

  const [activeLessonId, setActiveLessonId] = useState('l-62-1')
  const [activeTab, setActiveTab] = useState(0)
  const [syllabusSearch, setSyllabusSearch] = useState('')
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-62': true,
  })

  const [comments, setComments] = useState<{ id: string; author: string; text: string; time: string; likes: number }[]>([
    {
      id: 'c1',
      author: 'Dmitry K.',
      text: 'The breakdown of how the ffmpeg pipeline writes both the master manifest and multi-bitrate chunks simultaneously is incredible.',
      time: '2 hours ago',
      likes: 18,
    },
    {
      id: 'c2',
      author: 'Elena R.',
      text: 'Quick question: For buffering on mobile safari, does AVPlayer automatically switch stream variant when cell bandwidth drops?',
      time: '5 hours ago',
      likes: 6,
    },
  ])

  const [commentInput, setCommentInput] = useState('')

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim()) return

    const newComment = {
      id: `c-${Date.now()}`,
      author: session?.name || 'Cohort Fellow',
      text: commentInput.trim(),
      time: 'Just now',
      likes: 0,
    }

    setComments([newComment, ...comments])
    setCommentInput('')
  }

  const currentLessonTitle = useMemo(() => {
    for (const mod of SYLLABUS_MODULES) {
      const found = mod.lessons.find((l) => l.id === activeLessonId)
      if (found) return `${mod.title} — ${found.title}`
    }
    return 'HLS Adaptive Streaming Masterclass'
  }, [activeLessonId])

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
      <Stack spacing={3}>
        {/* Navigation Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/lectures" style={{ textDecoration: 'none' }}>
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: 'text.secondary', fontWeight: 700 }}
            >
              Back to Lecture Vault
            </Button>
          </Link>

          {isTeacher && (
            <Link to="/teachers/lectures" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Teacher Studio
              </Button>
            </Link>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Left Column: Player & Tab Content */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: '#000000',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
                }}
              >
                <CustomVideoPlayer
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  title={currentLessonTitle}
                  availableResolutions={['1080p', '720p', '480p', '360p']}
                />
              </Card>

              {/* Title & Metadata */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 260 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>
                    {currentLessonTitle}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1, color: 'text.secondary', fontSize: '0.8rem', fontFamily: "'Fira Code', monospace" }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main', fontWeight: 700 }}>
                      <VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} /> Subscribed Access
                    </Box>
                    <span>•</span>
                    <span>Instructor: Ada Lovelace</span>
                    <span>•</span>
                    <span>Track: Systems Architecture</span>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" startIcon={<ThumbUpOutlinedIcon fontSize="small" />} sx={{ borderRadius: 2, fontWeight: 700 }}>
                    142
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<ShareOutlinedIcon fontSize="small" />} sx={{ borderRadius: 2, fontWeight: 700 }}>
                    Share
                  </Button>
                </Stack>
              </Box>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                  <Tab label="About" sx={{ fontWeight: 800 }} />
                  <Tab label={`Discussions (${comments.length})`} sx={{ fontWeight: 800 }} />
                  <Tab label="Bookmarks" sx={{ fontWeight: 800 }} />
                  <Tab label="Notes" sx={{ fontWeight: 800 }} />
                </Tabs>
              </Box>

              {/* Tab Contents */}
              {activeTab === 0 && (
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                    Lecture Overview &amp; Architecture Notes
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2.5 }}>
                    In this masterclass, we dive deep into building a production Netflix-grade adaptive bitrate video streaming platform.
                    We cover multi-resolution transcoding pipelines using FFmpeg, video segment chunking (.ts files), and generating unified
                    master m3u8 playlist manifests that adjust in real-time according to client bandwidth.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#181F2A' : '#F4F6F8', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
                          Key Takeaway 1
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Understanding HLS master playlists and variant stream descriptors with bandwidth constraints.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#181F2A' : '#F4F6F8', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#FF3E00', display: 'block', mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
                          Key Takeaway 2
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Asynchronous workflow orchestration for distributed transcoding workers without blocking the API gateway.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              )}

              {activeTab === 1 && (
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                    Lesson Discussion ({comments.length})
                  </Typography>

                  <Box component="form" onSubmit={handlePostComment} sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Start a discussion or ask a question..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SendIcon />}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                      }}
                    >
                      Post
                    </Button>
                  </Box>

                  <Stack spacing={2}>
                    {comments.map((comment) => (
                      <Box
                        key={comment.id}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#181F2A' : '#F4F6F8',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#FF3E00' }}>
                              {comment.author[0]}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {comment.author}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace" }}>
                            {comment.time}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {comment.text}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              )}

              {activeTab === 2 && (
                <Card variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No saved bookmarks for this lecture yet.
                  </Typography>
                </Card>
              )}

              {activeTab === 3 && (
                <Card variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Personal lecture notes are synchronized to your account.
                  </Typography>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Right Column: Syllabus Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
                borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
              }}
            >
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LayersIcon sx={{ color: '#FF3E00', fontSize: 20 }} /> Syllabus
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AssessmentOutlinedIcon fontSize="small" />}
                    sx={{ fontSize: '0.7rem', fontWeight: 700, borderRadius: 1.5 }}
                  >
                    Analytics
                  </Button>
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0E1217' : '#F4F6F8' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Course Progress
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#FF3E00', fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                      31% (129 Lessons)
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={31} sx={{ height: 6, borderRadius: 1 }} />
                </Box>

                <TextField
                  size="small"
                  placeholder="Search syllabus modules..."
                  value={syllabusSearch}
                  onChange={(e) => setSyllabusSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {SYLLABUS_MODULES.filter(
                    (m) =>
                      m.title.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
                      m.lessons.some((l) => l.title.toLowerCase().includes(syllabusSearch.toLowerCase()))
                  ).map((module) => {
                    const isExpanded = !!expandedModules[module.id]
                    return (
                      <Card
                        key={module.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0E1217' : '#F4F6F8',
                        }}
                      >
                        <Box
                          onClick={() => toggleModule(module.id)}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <Box sx={{ pr: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', lineHeight: 1.3 }}>
                              {module.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.7rem' }}>
                              {module.lessonsCount} lessons
                            </Typography>
                          </Box>
                          <ExpandMoreIcon sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </Box>

                        {isExpanded && (
                          <Box sx={{ p: 1, pt: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {module.lessons.map((lesson) => {
                              const isActive = activeLessonId === lesson.id
                              return (
                                <Box
                                  key={lesson.id}
                                  onClick={() => setActiveLessonId(lesson.id)}
                                  sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    bgcolor: isActive ? 'rgba(255, 62, 0, 0.12)' : 'transparent',
                                    border: isActive ? '1px solid rgba(255, 62, 0, 0.3)' : '1px solid transparent',
                                    '&:hover': { bgcolor: isActive ? 'rgba(255, 62, 0, 0.18)' : 'action.hover' },
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, pr: 1 }}>
                                    {lesson.completed ? (
                                      <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main' }} />
                                    ) : (
                                      <PlayCircleIcon sx={{ fontSize: 15, color: isActive ? '#FF3E00' : 'text.secondary' }} />
                                    )}
                                    <Typography variant="caption" noWrap sx={{ fontWeight: isActive ? 800 : 500 }}>
                                      {lesson.title}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.68rem' }}>
                                    {lesson.duration}
                                  </Typography>
                                </Box>
                              )
                            })}
                          </Box>
                        )}
                      </Card>
                    )
                  })}
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  )
}
