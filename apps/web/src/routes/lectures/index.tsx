import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import SearchIcon from '@mui/icons-material/Search'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'

import { getSessionFn } from '../../server/functions/auth.fn'

interface LectureCardData {
  id: string
  title: string
  teacherId: string
  teacherName: string
  trackTitle: string
  durationMinutes: number
  resolutions: string[]
  isSubscribed: boolean
  thumbnailUrl: string
  description: string
  lessonsCount: number
}

const ALL_LECTURES: LectureCardData[] = [
  {
    id: 'lecture-1',
    title: 'Distributed Systems & Consensus: Raft & Paxos Deep Dive',
    teacherId: '1',
    teacherName: 'Ada Lovelace',
    trackTitle: 'Systems Architecture',
    durationMinutes: 45,
    resolutions: ['1080p', '720p', '480p', '360p'],
    isSubscribed: true,
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
    isSubscribed: true,
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
    isSubscribed: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
    description: 'Constructing an end-to-end compiler with recursive descent parsing, intermediate representation, and register allocation.',
    lessonsCount: 6,
  },
  {
    id: 'lecture-4',
    title: 'Netflix-Style HLS Adaptive Streaming Architecture',
    teacherId: '1',
    teacherName: 'Ada Lovelace',
    trackTitle: 'Systems Architecture',
    durationMinutes: 48,
    resolutions: ['1080p', '720p', '480p', '360p'],
    isSubscribed: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop',
    description: 'FFmpeg multi-bitrate video transcoding, m3u8 playlist assembly, Temporal workflow fanout, and low-latency chunk streaming.',
    lessonsCount: 8,
  },
]

export const Route = createFileRoute('/lectures/')({
  loader: async () => {
    const session = await getSessionFn().catch(() => null)
    return { session }
  },
  component: LectureVaultPage,
})

function LectureVaultPage() {
  const { session } = Route.useLoaderData()
  const isTeacher = !!session

  const [selectedTrack, setSelectedTrack] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const tracks = ['ALL', 'Systems Architecture', 'Backend Engineering', 'Compilers & Languages']

  const filteredLectures = ALL_LECTURES.filter((lec) => {
    const matchesTrack = selectedTrack === 'ALL' || lec.trackTitle === selectedTrack
    const matchesQuery =
      lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTrack && matchesQuery
  })

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={4}>
        {/* Header Hero */}
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
              // FELLOWS_STREAMING_VAULT
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Masterclass Video Lectures
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              On-demand masterclasses with multi-bitrate HLS adaptive playback.
            </Typography>
          </Box>

          {isTeacher && (
            <Link to="/teachers/lectures" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                startIcon={<VideoLibraryIcon />}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                  color: '#FFFFFF',
                }}
              >
                Teacher Studio Upload
              </Button>
            </Link>
          )}
        </Box>

        {/* Filter & Search Bar */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {tracks.map((t) => (
              <Chip
                key={t}
                label={t}
                onClick={() => setSelectedTrack(t)}
                color={selectedTrack === t ? 'primary' : 'default'}
                variant={selectedTrack === t ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  bgcolor: selectedTrack === t ? '#FF3E00' : 'transparent',
                }}
              />
            ))}
          </Stack>

          <TextField
            size="small"
            placeholder="Search lectures, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 260 }}
          />
        </Box>

        {/* Lecture Grid */}
        <Grid container spacing={3}>
          {filteredLectures.map((lecture) => (
            <Grid key={lecture.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#FF3E00',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.14)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="170"
                    image={lecture.thumbnailUrl}
                    alt={lecture.title}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                    }}
                  >
                    <Chip
                      size="small"
                      label={lecture.trackTitle}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: '#FFFFFF',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                    }}
                  >
                    <Chip
                      size="small"
                      icon={<AccessTimeIcon sx={{ fontSize: 12, color: '#FFFFFF !important' }} />}
                      label={`${lecture.durationMinutes}m`}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: '#FFFFFF',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2.5 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1 }}>
                      {lecture.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', lineClamp: 2, mb: 2 }}>
                      {lecture.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace" }}>
                      by {lecture.teacherName}
                    </Typography>

                    <Link
                      to="/lectures/$videoId"
                      params={{ videoId: lecture.id }}
                      style={{ textDecoration: 'none' }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        sx={{
                          fontWeight: 800,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                        }}
                      >
                        Watch
                      </Button>
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  )
}
