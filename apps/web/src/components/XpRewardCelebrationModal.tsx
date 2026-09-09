import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import type { Theme } from '@mui/material/styles'

import LocalActivityIcon from '@mui/icons-material/LocalActivity'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import CloseIcon from '@mui/icons-material/Close'

import { useCredits } from '../context'

export function XpRewardCelebrationModal() {
  const { celebration, closeCelebration, level, levelTitle } = useCredits()

  if (!celebration.isOpen) return null

  return (
    <Dialog
      open={celebration.isOpen}
      onClose={closeCelebration}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: (theme: Theme) => (theme.palette.mode === 'dark' ? '#0E1217' : '#FFFFFF'),
            border: '2px solid #FF3E00',
            boxShadow: '0 0 50px rgba(255, 62, 0, 0.4), 0 20px 40px rgba(0, 0, 0, 0.6)',
          },
        },
      }}
    >
      {/* Background Animated Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 62, 0, 0.35) 0%, rgba(255, 0, 85, 0.1) 50%, transparent 75%)',
          pointerEvents: 'none',
          animation: 'pulse 2s infinite',
        }}
      />

      <IconButton
        onClick={closeCelebration}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: 'text.secondary',
          zIndex: 2,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 3, sm: 4.5 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          {/* Main Glowing Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
              color: '#FFFFFF',
              boxShadow: '0 0 30px rgba(255, 62, 0, 0.8), 0 0 10px #FF0055',
              fontSize: '2.5rem',
            }}
          >
            ⚡
          </Box>

          {/* Title & XP Amount */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 900,
                letterSpacing: '0.15em',
                color: '#FF3E00',
                fontFamily: "'Fira Code', monospace",
                display: 'block',
                mb: 0.5,
              }}
            >
              // REWARD_DISPATCH_CONFIRMED
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              +{celebration.xpEarned} EXP CREDITS!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
              {celebration.videoTitle ? (
                <>Completed masterclass: <strong>{celebration.videoTitle}</strong></>
              ) : (
                celebration.reason
              )}
            </Typography>
          </Box>

          {/* Level Up Banner (if triggered) */}
          {celebration.levelUp && (
            <Box
              sx={{
                width: '100%',
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(255, 62, 0, 0.12)',
                border: '1px solid #FF3E00',
                boxShadow: '0 0 20px rgba(255, 62, 0, 0.25)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <MilitaryTechIcon sx={{ color: '#FF3E00', fontSize: 24 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#FF3E00' }}>
                  LEVEL UP! PROMOTED TO LEVEL {level}: {levelTitle.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Minted Cohort Booking Passes (if triggered) */}
          {celebration.newCohortCredits > 0 && (
            <Box
              sx={{
                width: '100%',
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid #06B6D4',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.25)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <LocalActivityIcon sx={{ color: '#06B6D4', fontSize: 24 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#06B6D4' }}>
                  +{celebration.newCohortCredits} COHORT BOOKING PASS MINTED!
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Conversion threshold reached! You can now book 1:1 office hours with cohort mentors.
              </Typography>
            </Box>
          )}

          {/* Unlocked Badge (if triggered) */}
          {celebration.unlockedBadge && (
            <Box
              sx={{
                width: '100%',
                p: 2,
                borderRadius: 2.5,
                bgcolor: (theme: Theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#F8FAFC'),
                border: `1px solid ${celebration.unlockedBadge.glowColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                textAlign: 'left',
              }}
            >
              <Box sx={{ fontSize: '2rem' }}>{celebration.unlockedBadge.icon}</Box>
              <Box>
                <Chip
                  size="small"
                  label={`NEW BADGE: ${celebration.unlockedBadge.tier}`}
                  sx={{
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    height: 18,
                    color: celebration.unlockedBadge.glowColor,
                    bgcolor: `${celebration.unlockedBadge.glowColor}15`,
                    mb: 0.5,
                  }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  {celebration.unlockedBadge.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {celebration.unlockedBadge.description}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', pt: 1 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={closeCelebration}
              startIcon={<WhatshotIcon />}
              sx={{
                fontWeight: 900,
                borderRadius: 2.5,
                py: 1.2,
                background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(255, 62, 0, 0.5)',
              }}
            >
              KEEP GRINDING 🔥
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
