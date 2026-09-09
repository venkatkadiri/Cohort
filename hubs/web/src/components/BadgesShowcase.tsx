import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'

import LockIcon from '@mui/icons-material/Lock'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { useCredits, type Badge } from '../context'

interface BadgesShowcaseProps {
  title?: string
  subtitle?: string
}

export function BadgesShowcase({
  title = 'EXP MASTERY BADGES & ACHIEVEMENTS',
  subtitle = 'Unlock exclusive cohort badges as you master distributed systems, streaming architectures, and consensus algorithms.',
}: BadgesShowcaseProps) {
  const { allBadges, unlockedBadgeIds, lifetimeXp } = useCredits()
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL')

  const filteredBadges = allBadges.filter((b) => {
    const isUnlocked = unlockedBadgeIds.includes(b.id)
    if (filter === 'UNLOCKED') return isUnlocked
    if (filter === 'LOCKED') return !isUnlocked
    return true
  })

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: 3,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'),
      }}
    >
      <Stack spacing={3}>
        {/* Header and Filter Pills */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 900,
                letterSpacing: '0.12em',
                color: '#FF3E00',
                fontFamily: "'Fira Code', monospace",
                display: 'block',
                mb: 0.5,
              }}
            >
              // SYSTEM_ACCOLADES
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>
              {title} ({unlockedBadgeIds.length}/{allBadges.length})
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <Chip
              clickable
              label={`All (${allBadges.length})`}
              onClick={() => setFilter('ALL')}
              color={filter === 'ALL' ? 'primary' : 'default'}
              variant={filter === 'ALL' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 800, fontSize: '0.72rem' }}
            />
            <Chip
              clickable
              label={`Unlocked (${unlockedBadgeIds.length})`}
              onClick={() => setFilter('UNLOCKED')}
              color={filter === 'UNLOCKED' ? 'success' : 'default'}
              variant={filter === 'UNLOCKED' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 800, fontSize: '0.72rem' }}
            />
            <Chip
              clickable
              label={`Locked (${allBadges.length - unlockedBadgeIds.length})`}
              onClick={() => setFilter('LOCKED')}
              color={filter === 'LOCKED' ? 'warning' : 'default'}
              variant={filter === 'LOCKED' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 800, fontSize: '0.72rem' }}
            />
          </Stack>
        </Box>

        {/* Badges Grid */}
        <Grid container spacing={2}>
          {filteredBadges.map((badge: Badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id)
            const progress = Math.min(100, Math.round((lifetimeXp / badge.requiredXp) * 100))

            const tierColor =
              badge.tier === 'LEGENDARY'
                ? '#FF3E00'
                : badge.tier === 'EPIC'
                ? '#EC4899'
                : badge.tier === 'RARE'
                ? '#F59E0B'
                : '#06B6D4'

            return (
              <Grid key={badge.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: (theme) =>
                      isUnlocked
                        ? theme.palette.mode === 'dark'
                          ? '#121822'
                          : '#FAFCFF'
                        : theme.palette.mode === 'dark'
                        ? '#0E1217'
                        : '#F8FAFC',
                    borderColor: isUnlocked ? badge.glowColor : 'divider',
                    boxShadow: isUnlocked
                      ? `0 8px 24px rgba(0, 0, 0, 0.2), 0 0 16px ${badge.glowColor}25`
                      : 'none',
                    opacity: isUnlocked ? 1 : 0.72,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: badge.glowColor,
                      opacity: 1,
                      boxShadow: `0 14px 28px rgba(0, 0, 0, 0.3), 0 0 20px ${badge.glowColor}40`,
                    },
                  }}
                >
                  {/* Badge Header & Icon */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem',
                          background: isUnlocked ? badge.bgGradient : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isUnlocked ? badge.glowColor : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: isUnlocked ? `0 4px 14px ${badge.glowColor}40` : 'none',
                        }}
                      >
                        {badge.icon}
                      </Box>

                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                        <Chip
                          size="small"
                          label={badge.tier}
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.62rem',
                            height: 20,
                            color: tierColor,
                            bgcolor: `${tierColor}18`,
                            border: `1px solid ${tierColor}40`,
                            fontFamily: "'Fira Code', monospace",
                          }}
                        />
                        {isUnlocked ? (
                          <Tooltip title="Badge Unlocked!">
                            <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                          </Tooltip>
                        ) : (
                          <Tooltip title={`Locked. Requires ${badge.requiredXp} XP`}>
                            <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                      {badge.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', minHeight: 36 }}>
                      {badge.description}
                    </Typography>
                  </Box>

                  {/* Footer: XP Requirement & Progress */}
                  <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.7rem' }}>
                        {isUnlocked ? 'Requirement Satisfied' : `Progress (${lifetimeXp}/${badge.requiredXp} XP)`}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: isUnlocked ? 'success.main' : tierColor,
                          fontFamily: "'Fira Code', monospace",
                          fontSize: '0.7rem',
                        }}
                      >
                        {isUnlocked ? 'CLAIMED' : `${progress}%`}
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 5,
                        borderRadius: 1,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0E1217' : '#E2E8F0'),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: isUnlocked ? 'success.main' : tierColor,
                        },
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Stack>
    </Card>
  )
}
