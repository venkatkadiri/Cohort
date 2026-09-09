import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import CloseIcon from '@mui/icons-material/Close'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import SchoolIcon from '@mui/icons-material/School'
import PersonIcon from '@mui/icons-material/Person'

import { useAuth, PRESET_USERS, type AuthUser } from '../context'
import { createUserFn } from '../server/functions/users.fn'
import { createEnrollerFn } from '../server/functions/enrollers.fn'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, login, user: currentUser } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>(authModalTab || 'login')

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [timezone, setTimezone] = useState('UTC')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Keep tab state synchronized with openAuthModal requests
  if (authModalTab && authModalTab !== tab && isAuthModalOpen) {
    setTab(authModalTab)
  }

  const handleQuickLogin = (preset: AuthUser) => {
    login(preset)
    closeAuthModal()
  }

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    // Match existing preset or create active session
    const matched = PRESET_USERS.find((p) => p.email.toLowerCase() === email.toLowerCase())
    if (matched) {
      login(matched)
    } else {
      login({
        id: Math.floor(Math.random() * 9000) + 1000,
        name: name || email.split('@')[0],
        email,
        role,
        timezone,
      })
    }
    closeAuthModal()
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name || !email) {
      setError('Name and Email are required.')
      return
    }

    setBusy(true)
    try {
      if (role === 'teacher') {
        const created = await createUserFn({
          data: {
            name,
            email,
          },
        })
        login({
          id: created.id,
          name: created.name,
          email: created.email,
          role: 'teacher',
          slug: created.slug,
          timezone,
        })
      } else {
        const created = await createEnrollerFn({
          data: {
            name,
            email,
          },
        })
        login({
          id: created.id,
          name: created.name,
          email: created.email,
          role: 'student',
          timezone,
        })
      }
      closeAuthModal()
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.35)' : '#E2E8F0'),
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 24px 64px rgba(0,0,0,0.85), 0 0 32px rgba(255,62,0,0.18)'
                : '0 20px 48px rgba(0,0,0,0.12)',
            p: 1,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(255, 62, 0, 0.35)',
            }}
          >
            <WhatshotIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Cohort Authentication
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              Student &amp; Mentor Access Gateway
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={closeAuthModal} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, val) => {
          setTab(val)
          setError(null)
        }}
        variant="fullWidth"
        sx={{
          px: 2,
          minHeight: 40,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.82rem',
            minHeight: 40,
          },
        }}
      >
        <Tab label="⚡ Quick Sign In" value="login" />
        <Tab label="✨ Create Account" value="register" />
      </Tabs>

      <DialogContent sx={{ p: 2.5 }}>
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 1.2,
              borderRadius: 2,
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#EF4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: "'Fira Code', monospace",
            }}
          >
            ⚠️ {error}
          </Box>
        )}

        {tab === 'login' ? (
          <Stack spacing={2.5}>
            {/* Quick-Switch Persona Badges */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'text.secondary',
                  fontFamily: "'Fira Code', monospace",
                  fontSize: '0.68rem',
                }}
              >
                1-Click Persona Switch (Instant Testing)
              </Typography>
              <Stack spacing={1}>
                {PRESET_USERS.map((preset) => {
                  const isActive = currentUser?.email.toLowerCase() === preset.email.toLowerCase()
                  return (
                    <Box
                      key={preset.email}
                      onClick={() => handleQuickLogin(preset)}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isActive ? '#FF3E00' : 'divider',
                        bgcolor: isActive
                          ? 'rgba(255, 62, 0, 0.08)'
                          : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: '#FF3E00',
                          bgcolor: 'rgba(255, 62, 0, 0.06)',
                          transform: 'translateX(2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        {preset.role === 'teacher' ? (
                          <SchoolIcon sx={{ fontSize: 18, color: '#FF3E00' }} />
                        ) : (
                          <PersonIcon sx={{ fontSize: 18, color: '#06B6D4' }} />
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', lineHeight: 1.2 }}>
                            {preset.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            {preset.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        size="small"
                        label={preset.role.toUpperCase()}
                        sx={{
                          height: 20,
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          bgcolor: preset.role === 'teacher' ? 'rgba(255, 62, 0, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                          color: preset.role === 'teacher' ? '#FF3E00' : '#06B6D4',
                          border: '1px solid',
                          borderColor: preset.role === 'teacher' ? 'rgba(255, 62, 0, 0.3)' : 'rgba(6, 182, 212, 0.3)',
                        }}
                      />
                    </Box>
                  )
                })}
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 700 }}>
                OR SIGN IN WITH EMAIL
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            </Box>

            <form onSubmit={handleManualLogin}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@domain.com"
                  slotProps={{
                    htmlInput: {
                      style: { fontSize: '0.82rem' },
                    },
                  }}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="button"
                    fullWidth
                    variant={role === 'student' ? 'contained' : 'outlined'}
                    onClick={() => setRole('student')}
                    size="small"
                    startIcon={<PersonIcon />}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      ...(role === 'student'
                        ? {
                            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                            color: '#FFFFFF',
                          }
                        : {}),
                    }}
                  >
                    Student
                  </Button>
                  <Button
                    type="button"
                    fullWidth
                    variant={role === 'teacher' ? 'contained' : 'outlined'}
                    onClick={() => setRole('teacher')}
                    size="small"
                    startIcon={<SchoolIcon />}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      ...(role === 'teacher'
                        ? {
                            background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                            color: '#FFFFFF',
                          }
                        : {}),
                    }}
                  >
                    Teacher
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#000000',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontSize: '0.8rem',
                    py: 1,
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                      boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
                    },
                  }}
                >
                  Enter Cohort Hub
                </Button>
              </Stack>
            </form>
          </Stack>
        ) : (
          <form onSubmit={handleRegister}>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 1,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'text.secondary',
                    fontFamily: "'Fira Code', monospace",
                    fontSize: '0.68rem',
                  }}
                >
                  Select Account Type
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="button"
                    fullWidth
                    variant={role === 'student' ? 'contained' : 'outlined'}
                    onClick={() => setRole('student')}
                    size="small"
                    startIcon={<PersonIcon />}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      ...(role === 'student'
                        ? {
                            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                            color: '#FFFFFF',
                          }
                        : {}),
                    }}
                  >
                    Student / Fellow
                  </Button>
                  <Button
                    type="button"
                    fullWidth
                    variant={role === 'teacher' ? 'contained' : 'outlined'}
                    onClick={() => setRole('teacher')}
                    size="small"
                    startIcon={<SchoolIcon />}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      ...(role === 'teacher'
                        ? {
                            background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                            color: '#FFFFFF',
                          }
                        : {}),
                    }}
                  >
                    Teacher / Mentor
                  </Button>
                </Box>
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Linus Torvalds"
                required
                slotProps={{
                  htmlInput: {
                    style: { fontSize: '0.82rem' },
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="linus@linux.org"
                required
                slotProps={{
                  htmlInput: {
                    style: { fontSize: '0.82rem' },
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="UTC or America/New_York"
                slotProps={{
                  htmlInput: {
                    style: { fontSize: '0.82rem' },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                disabled={busy}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '0.8rem',
                  py: 1.1,
                  boxShadow: '0 4px 14px rgba(255, 62, 0, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF5722 0%, #FF1744 100%)',
                    boxShadow: '0 0 24px rgba(255, 62, 0, 0.5)',
                  },
                }}
              >
                {busy ? 'Creating Account...' : `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Account`}
              </Button>
            </Stack>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
