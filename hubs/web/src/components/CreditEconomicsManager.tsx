import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'

import BoltIcon from '@mui/icons-material/Bolt'
import TuneIcon from '@mui/icons-material/Tune'
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { useCredits, type EconomicsConfig } from '../context'

export function CreditEconomicsManager() {
  const { economicsConfig, updateEconomicsConfig } = useCredits()

  const [formConfig, setFormConfig] = useState<EconomicsConfig>({
    ...economicsConfig,
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleConversionChange = (_: Event, value: number | number[]) => {
    setFormConfig((prev) => ({
      ...prev,
      conversionFactor: value as number,
    }))
  }

  const handleDifficultyXpChange = (field: keyof EconomicsConfig['difficultyXp'], val: number) => {
    setFormConfig((prev) => ({
      ...prev,
      difficultyXp: {
        ...prev.difficultyXp,
        [field]: Number(val) || 0,
      },
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateEconomicsConfig(formConfig)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  // Real-time calculation helpers for economics simulation
  const intermediateVideosPerBooking = (formConfig.conversionFactor / formConfig.difficultyXp.intermediate).toFixed(1)
  const masterclassVideosPerBooking = (formConfig.conversionFactor / formConfig.difficultyXp.masterclass).toFixed(1)

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
      <Box component="form" onSubmit={handleSave}>
        <Stack spacing={3.5}>
          {/* Header */}
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
                // TOKEN_ECONOMICS_ENGINE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon sx={{ color: '#FF3E00' }} /> Fellow Credit Conversion &amp; EXP Difficulty Rules
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Control how Experience Credits (EXP) are awarded upon completing video masterclasses and determine the exchange rate for minting 1:1 mentor booking passes.
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                color: '#FFFFFF',
                px: 3,
              }}
            >
              Save Economics Policy
            </Button>
          </Box>

          {savedSuccess && (
            <Alert
              icon={<CheckCircleIcon fontSize="inherit" />}
              severity="success"
              sx={{ borderRadius: 2 }}
            >
              Economics policy updated! Conversion factor set to <strong>{formConfig.conversionFactor} XP = 1 Cohort Credit</strong>.
            </Alert>
          )}

          {/* Section 1: Conversion Factor Slider */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2.5,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0E1217' : '#F8FAFC'),
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.25)' : '#E2E8F0'),
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Credit Conversion Rate: <span style={{ color: '#FF3E00' }}>{formConfig.conversionFactor} EXP Credits</span> = <span style={{ color: '#06B6D4' }}>1 Cohort Booking Pass</span>
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Students convert accumulated video EXP into 1:1 office hours booking slots. (e.g. 10 EXP = 1 Booking or 50 EXP = 1 Booking).
                </Typography>
              </Box>

              <Chip
                label={`${formConfig.conversionFactor} XP / CREDIT`}
                sx={{
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  color: '#FF3E00',
                  bgcolor: 'rgba(255, 62, 0, 0.12)',
                  border: '1px solid rgba(255, 62, 0, 0.3)',
                  fontFamily: "'Fira Code', monospace",
                }}
              />
            </Box>

            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Slider
                value={formConfig.conversionFactor}
                onChange={handleConversionChange}
                min={10}
                max={250}
                step={5}
                marks={[
                  { value: 10, label: '10 XP (Fast)' },
                  { value: 50, label: '50 XP (Balanced)' },
                  { value: 100, label: '100 XP (Standard)' },
                  { value: 200, label: '200 XP (Hardcore)' },
                ]}
                sx={{
                  color: '#FF3E00',
                  '& .MuiSlider-thumb': {
                    boxShadow: '0 0 12px #FF3E00',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Section 2: EXP Rewards by Concept Difficulty Matrix */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              EXP Reward Matrix by Concept Difficulty
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Decide how many EXP points a student earns when they watch and complete a video in each difficulty tier.
            </Typography>

            <Grid container spacing={2}>
              {/* Beginner */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Beginner Track</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    Foundations &amp; Intro Concepts
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="XP Earned"
                    value={formConfig.difficultyXp.beginner}
                    onChange={(e) => handleDifficultyXpChange('beginner', Number(e.target.value))}
                    slotProps={{
                      input: {
                        startAdornment: <BoltIcon sx={{ color: '#10B981', fontSize: 16, mr: 0.5 }} />,
                      },
                    }}
                  />
                </Card>
              </Grid>

              {/* Intermediate */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#06B6D4' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Intermediate</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    Async, Node.js &amp; Libuv
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="XP Earned"
                    value={formConfig.difficultyXp.intermediate}
                    onChange={(e) => handleDifficultyXpChange('intermediate', Number(e.target.value))}
                    slotProps={{
                      input: {
                        startAdornment: <BoltIcon sx={{ color: '#06B6D4', fontSize: 16, mr: 0.5 }} />,
                      },
                    }}
                  />
                </Card>
              </Grid>

              {/* Advanced */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Advanced Systems</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    HLS Transcoding &amp; Streams
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="XP Earned"
                    value={formConfig.difficultyXp.advanced}
                    onChange={(e) => handleDifficultyXpChange('advanced', Number(e.target.value))}
                    slotProps={{
                      input: {
                        startAdornment: <BoltIcon sx={{ color: '#F59E0B', fontSize: 16, mr: 0.5 }} />,
                      },
                    }}
                  />
                </Card>
              </Grid>

              {/* Masterclass */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF3E00' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Masterclass / Raft</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    Consensus &amp; Kernel Internals
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="XP Earned"
                    value={formConfig.difficultyXp.masterclass}
                    onChange={(e) => handleDifficultyXpChange('masterclass', Number(e.target.value))}
                    slotProps={{
                      input: {
                        startAdornment: <BoltIcon sx={{ color: '#FF3E00', fontSize: 16, mr: 0.5 }} />,
                      },
                    }}
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Section 3: Real-Time Token Economics Simulation */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(6, 182, 212, 0.05)' : '#F0FDFA'),
              border: '1px solid',
              borderColor: 'rgba(6, 182, 212, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CalculateOutlinedIcon sx={{ color: '#06B6D4' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#06B6D4' }}>
                LIVE ECONOMICS SIMULATION PREVIEW
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Intermediate Video Ratio</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace" }}>
                  {intermediateVideosPerBooking} Videos = 1 Booking
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  At {formConfig.difficultyXp.intermediate} XP/video
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Masterclass Video Ratio</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace", color: '#FF3E00' }}>
                  {masterclassVideosPerBooking} Masterclasses = 1 Booking
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  At {formConfig.difficultyXp.masterclass} XP/video
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Student Incentive Health</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'success.main' }}>
                  High Engagement 🔥
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  Strong motivation to finish full tracks
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Box>
    </Card>
  )
}
