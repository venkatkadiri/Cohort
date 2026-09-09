import { Link } from '@tanstack/react-router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'

import BoltIcon from '@mui/icons-material/Bolt'
import LocalActivityIcon from '@mui/icons-material/LocalActivity'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'

import { useCredits } from '../context'

interface CreditProgressBarProps {
  compact?: boolean
  showConvertButton?: boolean
}

export function CreditProgressBar({ compact = false, showConvertButton = true }: CreditProgressBarProps) {
  const {
    xpCredits,
    cohortCredits,
    lifetimeXp,
    level,
    levelTitle,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    levelProgressPercent,
    xpToNextCohortCredit,
    cohortCreditProgressPercent,
    streakDays,
    economicsConfig,
    convertXpToCohort,
  } = useCredits()

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 0.8,
          px: 1.5,
          borderRadius: 2,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(24, 31, 42, 0.8)' : '#F4F6F8'),
          border: '1px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.25)' : '#E2E8F0'),
          boxShadow: '0 4px 14px rgba(255, 62, 0, 0.08)',
        }}
      >
        {/* XP Pill */}
        <Tooltip title={`Experience Credits: ${xpCredits} XP. Total Earned: ${lifetimeXp} XP`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
            <BoltIcon sx={{ color: '#FF3E00', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace", color: '#FF3E00' }}>
              {xpCredits} XP
            </Typography>
          </Box>
        </Tooltip>

        <Box sx={{ width: 1, height: 14, bgcolor: 'divider' }} />

        {/* Cohort Booking Credits Pill */}
        <Tooltip title={`Cohort Booking Credits: ${cohortCredits}. Used to book 1:1 mentor office hours.`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
            <LocalActivityIcon sx={{ color: '#06B6D4', fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace", color: '#06B6D4' }}>
              {cohortCredits} Credits
            </Typography>
          </Box>
        </Tooltip>

        {/* Mini Progress */}
        <Tooltip title={`${xpToNextCohortCredit} XP needed for next 1:1 Cohort Booking Credit (${cohortCreditProgressPercent}%)`}>
          <Box sx={{ width: 48, cursor: 'help' }}>
            <LinearProgress
              variant="determinate"
              value={cohortCreditProgressPercent}
              sx={{
                height: 5,
                borderRadius: 1,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #FF3E00, #06B6D4)',
                },
              }}
            />
          </Box>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #181F2A 0%, #121822 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.3)' : '#DDE2E7'),
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 62, 0, 0.2)'
            : '0 10px 25px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Background Accent Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 62, 0, 0.18) 0%, rgba(255, 0, 85, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Stack spacing={2.5}>
        {/* Top Header: Level & Streak */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                color: '#FFFFFF',
                boxShadow: '0 6px 18px rgba(255, 62, 0, 0.4)',
              }}
            >
              <MilitaryTechIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                  LEVEL {level}: {levelTitle.toUpperCase()}
                </Typography>
                <Chip
                  size="small"
                  label={`Lvl ${level}`}
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.65rem',
                    height: 20,
                    background: 'rgba(255, 62, 0, 0.15)',
                    color: '#FF3E00',
                    border: '1px solid rgba(255, 62, 0, 0.3)',
                    fontFamily: "'Fira Code', monospace",
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace" }}>
                {lifetimeXp} Total XP Earned · {xpInCurrentLevel}/{xpNeededForNextLevel} XP to Level {level + 1}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<WhatshotIcon sx={{ fontSize: 16, color: '#FF3E00 !important' }} />}
              label={`${streakDays}-Day Rush (${economicsConfig.streakBonusMultiplier}x XP)`}
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.12)' : '#FFF1EE'),
                color: '#FF3E00',
                border: '1px solid rgba(255, 62, 0, 0.3)',
                boxShadow: '0 2px 8px rgba(255, 62, 0, 0.15)',
              }}
            />
          </Box>
        </Box>

        {/* Main Credit Metric Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Card 1: Experience Credits */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(14, 18, 23, 0.7)' : '#F8FAFC'),
              border: '1px solid',
              borderColor: 'rgba(255, 62, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  fontFamily: "'Fira Code', monospace",
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <BoltIcon sx={{ fontSize: 14, color: '#FF3E00' }} /> EXPERIENCE CREDITS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#FF3E00', fontFamily: "'Fira Code', monospace", mt: 0.2 }}>
                {xpCredits} <span style={{ fontSize: '0.9rem', color: 'inherit', opacity: 0.8 }}>XP</span>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                Earned watching masterclass tracks
              </Typography>
            </Box>
          </Box>

          {/* Card 2: Cohort Booking Credits */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(14, 18, 23, 0.7)' : '#F8FAFC'),
              border: '1px solid',
              borderColor: 'rgba(6, 182, 212, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  fontFamily: "'Fira Code', monospace",
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <LocalActivityIcon sx={{ fontSize: 14, color: '#06B6D4' }} /> COHORT BOOKING PASSES
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#06B6D4', fontFamily: "'Fira Code', monospace", mt: 0.2 }}>
                {cohortCredits} <span style={{ fontSize: '0.9rem', color: 'inherit', opacity: 0.8 }}>CREDITS</span>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                1 Credit = 1 Bookable 1:1 Mentor Slot
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {showConvertButton && xpCredits >= economicsConfig.conversionFactor && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SwapHorizIcon />}
                  onClick={() => convertXpToCohort()}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    borderColor: '#06B6D4',
                    color: '#06B6D4',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(6, 182, 212, 0.1)',
                      borderColor: '#06B6D4',
                    },
                  }}
                >
                  Convert +1
                </Button>
              )}

              <Link to="/credits/buy" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<LocalActivityIcon />}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  Buy Credits
                </Button>
              </Link>
            </Stack>
          </Box>
        </Box>

        {/* In-Your-Face Glowing Progress Bar Towards Next Booking Credit */}
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0E1217' : '#F1F5F9') }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
              ⚡ Next 1:1 Mentor Booking Credit: <span style={{ color: '#FF3E00' }}>{xpCredits % economicsConfig.conversionFactor} / {economicsConfig.conversionFactor} XP</span>
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#06B6D4', fontFamily: "'Fira Code', monospace" }}>
              {xpToNextCohortCredit > 0 ? `${xpToNextCohortCredit} XP away` : 'READY TO CLAIM!'} ({cohortCreditProgressPercent}%)
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <LinearProgress
              variant="determinate"
              value={cohortCreditProgressPercent}
              sx={{
                height: 12,
                borderRadius: 2,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#E2E8F0'),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #FF3E00 0%, #FF0055 50%, #06B6D4 100%)',
                  boxShadow: '0 0 16px rgba(255, 62, 0, 0.8), 0 0 8px rgba(6, 182, 212, 0.6)',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              Current Conversion Factor: <strong>{economicsConfig.conversionFactor} XP = 1 Cohort Credit</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontFamily: "'Fira Code', monospace" }}>
              Level {level} Progress: {levelProgressPercent}%
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Card>
  )
}
