import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'

import { useCredits } from '../context'

interface LeaderboardUser {
  id: string
  rank: number
  name: string
  handle: string
  avatarText: string
  avatarBg: string
  crestType: 'CHAMPION' | 'EMERALD' | 'GOLD_STAR' | 'SAPPHIRE' | 'CYAN' | 'SLATE'
  xp: number
  badgeIcon?: string
  topCourse: string
  isCurrentUser?: boolean
}

interface LiveStreamItem {
  id: string
  handle: string
  badgeIcon?: string
  actionText: string
  courseName: string
  xpEarned?: number
  timestamp: string
  isNew?: boolean
}

const INITIAL_TOP_STUDENTS: LeaderboardUser[] = [
  {
    id: 'u-1',
    rank: 1,
    name: 'Nikolai',
    handle: 'nikolai_arch',
    avatarText: 'N',
    avatarBg: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
    crestType: 'CHAMPION',
    xp: 37654,
    badgeIcon: '👑',
    topCourse: 'Distributed Systems & Raft Protocol',
  },
  {
    id: 'u-2',
    rank: 2,
    name: 'Syler',
    handle: 'syler_dev',
    avatarText: 'S',
    avatarBg: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    crestType: 'EMERALD',
    xp: 35649,
    badgeIcon: '🔥',
    topCourse: 'Adaptive HLS Multi-Bitrate Pipelines',
  },
  {
    id: 'u-3',
    rank: 3,
    name: 'Hazem',
    handle: 'hazem_k',
    avatarText: 'H',
    avatarBg: 'linear-gradient(135deg, #047857 0%, #34D399 100%)',
    crestType: 'EMERALD',
    xp: 31097,
    badgeIcon: '🛡️',
    topCourse: 'High-Throughput Node.js & Libuv',
  },
  {
    id: 'u-4',
    rank: 4,
    name: 'Antonis',
    handle: 'antonis_c',
    avatarText: 'A',
    avatarBg: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    crestType: 'EMERALD',
    xp: 30023,
    badgeIcon: '⚡',
    topCourse: 'Temporal Distributed Workflows',
  },
  {
    id: 'u-5',
    rank: 5,
    name: 'Anton',
    handle: 'anton_v',
    avatarText: 'A',
    avatarBg: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    crestType: 'GOLD_STAR',
    xp: 28203,
    badgeIcon: '🎥',
    topCourse: 'FFmpeg Transcoding & Chunking',
  },
  {
    id: 'u-6',
    rank: 6,
    name: 'Tuna',
    handle: 'tuna_codes',
    avatarText: 'T',
    avatarBg: 'linear-gradient(135deg, #B45309 0%, #FBBF24 100%)',
    crestType: 'GOLD_STAR',
    xp: 27997,
    badgeIcon: '🔥',
    topCourse: 'Raft Master Manifests',
  },
  {
    id: 'u-7',
    rank: 7,
    name: 'Anirban',
    handle: 'anirban_m',
    avatarText: 'A',
    avatarBg: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    crestType: 'GOLD_STAR',
    xp: 27554,
    badgeIcon: '🛡️',
    topCourse: 'Distributed Consensus & Paxos',
  },
  {
    id: 'u-8',
    rank: 8,
    name: 'Shubham',
    handle: 'shubham_p',
    avatarText: 'S',
    avatarBg: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
    crestType: 'GOLD_STAR',
    xp: 27459,
    badgeIcon: '⚡',
    topCourse: 'Concurrency & Worker Threads',
  },
  {
    id: 'u-9',
    rank: 9,
    name: 'Ibuchukwu',
    handle: 'ibuchukwu_e',
    avatarText: 'I',
    avatarBg: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
    crestType: 'GOLD_STAR',
    xp: 26185,
    badgeIcon: '🎯',
    topCourse: 'gRPC & Streaming Buffers',
  },
  {
    id: 'u-10',
    rank: 10,
    name: 'Adhil',
    handle: 'adhil_r',
    avatarText: 'A',
    avatarBg: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    crestType: 'SAPPHIRE',
    xp: 25803,
    badgeIcon: '🛡️',
    topCourse: 'Kafka Fanout Architecture',
  },
  {
    id: 'u-11',
    rank: 11,
    name: 'Matthias',
    handle: 'matthias_h',
    avatarText: 'M',
    avatarBg: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
    crestType: 'SAPPHIRE',
    xp: 24821,
    badgeIcon: '⚡',
    topCourse: 'Linux Kernel & Memory Profiles',
  },
  {
    id: 'u-12',
    rank: 12,
    name: 'Dipankar',
    handle: 'dipankar_s',
    avatarText: 'D',
    avatarBg: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
    crestType: 'SAPPHIRE',
    xp: 24492,
    badgeIcon: '🌀',
    topCourse: 'Learn Go & Concurrency',
  },
  {
    id: 'u-13',
    rank: 13,
    name: 'Dương',
    handle: 'duong_ng',
    avatarText: 'D',
    avatarBg: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    crestType: 'SAPPHIRE',
    xp: 23427,
    badgeIcon: '🔥',
    topCourse: 'Learn Git & Branching',
  },
  {
    id: 'u-14',
    rank: 14,
    name: 'Dmitry',
    handle: 'dmitry_k',
    avatarText: 'D',
    avatarBg: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
    crestType: 'CYAN',
    xp: 20888,
    badgeIcon: '🎥',
    topCourse: 'Video Codecs & Bitrate Ladders',
  },
  {
    id: 'u-15',
    rank: 15,
    name: 'Ali',
    handle: 'ali_reza',
    avatarText: 'A',
    avatarBg: 'linear-gradient(135deg, #0891B2 0%, #22D3EE 100%)',
    crestType: 'CYAN',
    xp: 20782,
    badgeIcon: '⚡',
    topCourse: 'Learn Python for Beginners',
  },
  {
    id: 'u-16',
    rank: 16,
    name: 'Thriambake...',
    handle: 'thriambakeshwar',
    avatarText: 'T',
    avatarBg: 'linear-gradient(135deg, #0E7490 0%, #06B6D4 100%)',
    crestType: 'CYAN',
    xp: 19705,
    badgeIcon: '🛡️',
    topCourse: 'Build a Static Site Generator',
  },
  {
    id: 'u-17',
    rank: 17,
    name: 'Johannes',
    handle: 'johannes_w',
    avatarText: 'J',
    avatarBg: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)',
    crestType: 'CYAN',
    xp: 19057,
    badgeIcon: '🌀',
    topCourse: 'Learn Linux & Shell Scripting',
  },
  {
    id: 'u-18',
    rank: 18,
    name: 'Laurenz',
    handle: 'laurenz_b',
    avatarText: 'L',
    avatarBg: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    crestType: 'SLATE',
    xp: 17603,
    badgeIcon: '🔥',
    topCourse: 'Build a Blog Aggregator in Go',
  },
]

const INITIAL_LIVE_EVENTS: LiveStreamItem[] = [
  {
    id: 'live-1',
    handle: 'judiciouscondition39',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: 'Just now',
  },
  {
    id: 'live-2',
    handle: 'tonnebrre',
    badgeIcon: '🔥',
    actionText: 'completed a lesson on',
    courseName: 'Learn Object Oriented Programming in Python',
    timestamp: '3s ago',
  },
  {
    id: 'live-3',
    handle: 'impishreputation31',
    badgeIcon: '🛡️',
    actionText: 'completed a lesson on',
    courseName: 'Learn Go',
    timestamp: '5s ago',
  },
  {
    id: 'live-4',
    handle: 'thunderousgate30',
    actionText: 'completed a lesson on',
    courseName: 'Learn Git',
    timestamp: '9s ago',
  },
  {
    id: 'live-5',
    handle: 'hanniahheart',
    actionText: 'completed a lesson on',
    courseName: 'Build a Static Site Generator in Python',
    timestamp: '12s ago',
  },
  {
    id: 'live-6',
    handle: 'mxzula',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '15s ago',
  },
  {
    id: 'live-7',
    handle: 'simplisticargument23',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '18s ago',
  },
  {
    id: 'live-8',
    handle: 'secondaryspot15',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '22s ago',
  },
  {
    id: 'live-9',
    handle: 'siggmon',
    badgeIcon: '⚡',
    actionText: 'completed a lesson on',
    courseName: 'Learn Linux',
    timestamp: '25s ago',
  },
  {
    id: 'live-10',
    handle: 'sizzlingplayer38',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '29s ago',
  },
  {
    id: 'live-11',
    handle: 'eidomor',
    actionText: 'completed a lesson on',
    courseName: 'Learn Git',
    timestamp: '34s ago',
  },
  {
    id: 'live-12',
    handle: 'unrealisticreport27',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '38s ago',
  },
  {
    id: 'live-13',
    handle: 'ruralbeer47',
    actionText: 'completed a lesson on',
    courseName: 'Learn Git',
    timestamp: '42s ago',
  },
  {
    id: 'live-14',
    handle: 'exemplaryknowledge68',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '46s ago',
  },
  {
    id: 'live-15',
    handle: 'zachxyz',
    badgeIcon: '🎯',
    actionText: 'completed a lesson on',
    courseName: 'Learn Object Oriented Programming in Python',
    timestamp: '50s ago',
  },
  {
    id: 'live-16',
    handle: 'fern_ace',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '54s ago',
  },
  {
    id: 'live-17',
    handle: 'smoggyrope33',
    badgeIcon: '🎥',
    actionText: 'completed a lesson on',
    courseName: 'Build a Blog Aggregator in Go',
    timestamp: '58s ago',
  },
  {
    id: 'live-18',
    handle: 'writhingvisit14',
    badgeIcon: '🔥',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '1m ago',
  },
  {
    id: 'live-19',
    handle: 'mixedchannel96',
    actionText: 'completed a lesson on',
    courseName: 'Learn Python for Beginners',
    timestamp: '1m ago',
  },
]

// Ornate Crest Frame Component matching boot.dev star/shield/wreath styling
function AvatarCrest({ crestType, children }: { crestType: LeaderboardUser['crestType']; children: React.ReactNode }) {
  const getCrestBorder = () => {
    switch (crestType) {
      case 'CHAMPION':
        return {
          clipPath: 'polygon(50% 0%, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 15% 85%, 0% 50%, 15% 15%)',
          bgcolor: '#9333EA',
          p: '3px',
          boxShadow: '0 0 14px rgba(168, 85, 247, 0.7)',
        }
      case 'EMERALD':
        return {
          clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)',
          bgcolor: '#10B981',
          p: '3px',
          boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
        }
      case 'GOLD_STAR':
        return {
          clipPath: 'polygon(50% 0%, 65% 25%, 100% 35%, 75% 65%, 85% 100%, 50% 80%, 15% 100%, 25% 65%, 0% 35%, 35% 25%)',
          bgcolor: '#F59E0B',
          p: '3px',
          boxShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
        }
      case 'SAPPHIRE':
        return {
          clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)',
          bgcolor: '#3B82F6',
          p: '3px',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
        }
      case 'CYAN':
        return {
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          bgcolor: '#06B6D4',
          p: '2.5px',
          boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)',
        }
      case 'SLATE':
      default:
        return {
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          bgcolor: '#EF4444',
          p: '2.5px',
          boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
        }
    }
  }

  const style = getCrestBorder()

  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        clipPath: style.clipPath,
        bgcolor: style.bgcolor,
        boxShadow: style.boxShadow,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          clipPath: style.clipPath,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0E1217' : '#FFFFFF'),
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export function LeaderboardWidget() {
  const { lifetimeXp } = useCredits()

  const [isStreaming, setIsStreaming] = useState(true)
  const [isSoundMuted, setIsSoundMuted] = useState(false)
  const [liveEvents, setLiveEvents] = useState<LiveStreamItem[]>(INITIAL_LIVE_EVENTS)

  // Integrate live student into leaderboard ranking
  const totalStudents = 1412599
  const userEstimatedRank = 7290

  // Real-time simulated live streaming loop exactly like Boot.dev's feed
  useEffect(() => {
    if (!isStreaming) return

    const RANDOM_USERS = [
      'judiciouscondition39',
      'tonnebrre',
      'impishreputation31',
      'thunderousgate30',
      'hanniahheart',
      'mxzula',
      'simplisticargument23',
      'secondaryspot15',
      'siggmon',
      'sizzlingplayer38',
      'eidomor',
      'unrealisticreport27',
      'ruralbeer47',
      'exemplaryknowledge68',
      'zachxyz',
      'fern_ace',
      'smoggyrope33',
      'writhingvisit14',
      'mixedchannel96',
      'hypervector99',
      'concurrencyninja',
      'raftmaster88',
    ]

    const RANDOM_LESSONS = [
      'Learn Python for Beginners',
      'Learn Object Oriented Programming in Python',
      'Learn Go',
      'Learn Git',
      'Build a Static Site Generator in Python',
      'Learn Linux',
      'Build a Blog Aggregator in Go',
      'Learn Algorithms & Data Structures',
      'Learn Docker & Containers',
      'Learn SQL & Database Internals',
      'Distributed Systems & Raft Protocol',
      'Adaptive HLS Video Transcoding',
    ]

    const RANDOM_BADGES = ['🔥', '🛡️', '⚡', '🎥', '🎯', undefined, undefined, undefined]

    const interval = setInterval(() => {
      const randomUser = RANDOM_USERS[Math.floor(Math.random() * RANDOM_USERS.length)]
      const randomLesson = RANDOM_LESSONS[Math.floor(Math.random() * RANDOM_LESSONS.length)]
      const randomBadge = RANDOM_BADGES[Math.floor(Math.random() * RANDOM_BADGES.length)]

      const newEvent: LiveStreamItem = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        handle: randomUser,
        badgeIcon: randomBadge,
        actionText: 'completed a lesson on',
        courseName: randomLesson,
        timestamp: 'Just now',
        isNew: true,
      }

      setLiveEvents((prev) => [newEvent, ...prev.slice(0, 24)])
    }, 2800)

    return () => clearInterval(interval)
  }, [isStreaming])

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Banner / Breadcrumb & Audio Ticker */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary' }}>
            Global Leaderboards
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.secondary', mt: 0.5 }}>
            Top Daily Learners
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.78rem' }}>
            You are in position <strong>#{userEstimatedRank}</strong> of <strong>{totalStudents.toLocaleString()}</strong> total students · <strong>{lifetimeXp.toLocaleString()} XP</strong> earned
          </Typography>
        </Box>

        {/* Live Stream Controls */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title={isStreaming ? 'Pause Live Stream' : 'Resume Live Stream'}>
            <IconButton
              size="small"
              onClick={() => setIsStreaming(!isStreaming)}
              sx={{
                border: '1px solid',
                borderColor: isStreaming ? '#10B981' : 'divider',
                color: isStreaming ? '#10B981' : 'text.secondary',
                bgcolor: isStreaming ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              }}
            >
              {isStreaming ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isSoundMuted ? 'Unmute Live Audio Chimes' : 'Mute Audio Chimes'}>
            <IconButton
              size="small"
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                color: isSoundMuted ? 'text.secondary' : '#FF3E00',
              }}
            >
              {isSoundMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Chip
            label={isStreaming ? '🟢 LIVE' : '⏸️ PAUSED'}
            size="small"
            sx={{
              fontWeight: 900,
              fontSize: '0.68rem',
              bgcolor: isStreaming ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
              color: isStreaming ? '#10B981' : 'text.secondary',
              border: `1px solid ${isStreaming ? '#10B981' : 'divider'}`,
              fontFamily: "'Fira Code', monospace",
            }}
          />
        </Stack>
      </Box>

      {/* Main 2-Column Split: Leaderboard Grid (Left) + Live Stream Feed (Right) */}
      <Grid container spacing={3}>
        {/* Left Column: 3-Column Leaderboard Grid */}
        <Grid size={{ xs: 12, lg: 7, xl: 7.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 1.5,
            }}
          >
            {INITIAL_TOP_STUDENTS.map((student) => {
              const isFirst = student.rank === 1
              const formattedXp = student.xp.toLocaleString()

              return (
                <Box
                  key={student.id}
                  sx={{
                    p: 1.5,
                    px: 1.8,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#121822' : '#FFFFFF'),
                    border: '1px solid',
                    borderColor: isFirst
                      ? '#9333EA'
                      : (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.08)' : '#E2E8F0'),
                    boxShadow: isFirst
                      ? '0 0 16px rgba(147, 51, 234, 0.25)'
                      : 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#FF3E00',
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#18202D' : '#F8FAFC'),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  {/* Rank Number */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      fontFamily: "'Fira Code', monospace",
                      fontSize: '0.85rem',
                      color: isFirst ? '#C084FC' : 'text.secondary',
                      minWidth: 20,
                      textAlign: 'center',
                    }}
                  >
                    {student.rank}
                  </Typography>

                  {/* Ornate Avatar Crest */}
                  <AvatarCrest crestType={student.crestType}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        background: student.avatarBg,
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                      }}
                    >
                      {student.avatarText}
                    </Avatar>
                  </AvatarCrest>

                  {/* Student Name & XP */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        lineHeight: 1.2,
                        color: 'text.primary',
                      }}
                    >
                      {student.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isFirst ? '#C084FC' : 'text.secondary',
                        fontWeight: 700,
                        fontFamily: "'Fira Code', monospace",
                        fontSize: '0.72rem',
                        display: 'block',
                      }}
                    >
                      {formattedXp} xp
                    </Typography>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Grid>

        {/* Right Column: Real-Time Live Activity Stream Feed */}
        <Grid size={{ xs: 12, lg: 5, xl: 4.5 }}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#121822' : '#FFFFFF'),
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
              height: 560,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Live Stream Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, mb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#10B981',
                    boxShadow: '0 0 8px #10B981',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: '0.05em', fontFamily: "'Fira Code', monospace", fontSize: '0.75rem' }}>
                  REAL-TIME LEARNING STREAM
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontFamily: "'Fira Code', monospace" }}>
                ws://live.cohort.mesh
              </Typography>
            </Box>

            {/* Scrollable Live Stream Items */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                pr: 0.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.2,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
              }}
            >
              {liveEvents.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1,
                    px: 1.2,
                    borderRadius: 1.5,
                    bgcolor: item.isNew
                      ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.08)' : 'rgba(255, 62, 0, 0.05)')
                      : 'transparent',
                    borderLeft: item.isNew ? '3px solid #FF3E00' : '3px solid transparent',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.6,
                    flexWrap: 'wrap',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    '&:hover': {
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 800,
                      color: '#06B6D4',
                      fontFamily: "'Fira Code', monospace",
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    @{item.handle}
                  </Typography>

                  {item.badgeIcon && (
                    <Box component="span" sx={{ fontSize: '0.85rem' }}>
                      {item.badgeIcon}
                    </Box>
                  )}

                  <Typography
                    component="span"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.78rem',
                    }}
                  >
                    {item.actionText}
                  </Typography>

                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: '0.78rem',
                    }}
                  >
                    {item.courseName}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
