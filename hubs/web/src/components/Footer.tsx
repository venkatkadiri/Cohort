import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAuth } from '../context'

export default function Footer() {
  const year = new Date().getFullYear()
  const { openAuthModal, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  // Hide footer when user is logged in (workspace/dashboard mode)
  if (isAuthenticated) {
    return null
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setTimeout(() => {
        setEmail('')
      }, 2000)
    }
  }

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0E1217' : '#F4F6F8'),
        pt: { xs: 6, sm: 8 },
        pb: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="lg">
        {/* Main Dark Elevated Container matching Screenshot 4 */}
        <Box
          sx={{
            borderRadius: 4,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF'),
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.08)' : '#E2E8F0'),
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 20px 50px rgba(0,0,0,0.6)'
                : '0 10px 30px rgba(0,0,0,0.06)',
            p: { xs: 3.5, sm: 5, md: 6 },
          }}
        >
          <Grid container spacing={4} sx={{ justifyContent: 'space-between' }}>
            {/* Left Columns: Quick Links (Matching Screenshot 4) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, sm: 6 }}>
                  <Stack spacing={1.2}>
                    <Box
                      onClick={() => (!isAuthenticated ? openAuthModal('login') : null)}
                      sx={{
                        cursor: 'pointer',
                        color: 'text.primary',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Login
                    </Box>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      About
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Jobs
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Blog
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Reviews
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Terms
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Privacy
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Code of Conduct
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 6, sm: 6 }}>
                  <Stack spacing={1.2}>
                    <Typography
                      component="a"
                      href="https://youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      YouTube
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Bytes
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      npmtrends
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      useHooks
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      react.gg
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      query.gg
                    </Typography>
                    <Typography
                      component="a"
                      href="#"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        '&:hover': { color: '#FF3E00' },
                      }}
                    >
                      Discord Community
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column: SIGN UP FOR BYTES Newsletter Box (Matching Screenshot 4) */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 3,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0E1217' : '#F8FAFC'),
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.12)' : '#E2E8F0'),
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Sticker Emoji in corner (Matching Screenshot 4) */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 14,
                    fontSize: '1.8rem',
                    transform: 'rotate(12deg)',
                  }}
                >
                  👅
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  SIGN UP FOR BYTES
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    lineHeight: 1.5,
                    mb: 2.5,
                  }}
                >
                  Delivered to over <strong>200,000</strong> web developers every <strong>Tuesday</strong> and{' '}
                  <strong>Friday</strong>.
                </Typography>

                {subscribed ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid #10B981',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}
                  >
                    <CheckCircleIcon fontSize="small" />
                    <span>You&apos;re in! Welcome to Dev Bytes.</span>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleSubscribe}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF',
                            fontSize: '0.8rem',
                          },
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          flexShrink: 0,
                          bgcolor: '#F59E0B',
                          color: '#000000',
                          fontWeight: 900,
                          fontSize: '0.78rem',
                          px: 2.5,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                          '&:hover': {
                            bgcolor: '#FBBF24',
                            boxShadow: '0 0 18px rgba(245, 158, 11, 0.5)',
                          },
                        }}
                      >
                        Get Bytes Today
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Brand Logo Strip (Matching Screenshot 4) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              mt: 5,
              pt: 3,
              borderTop: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.08)' : '#E2E8F0'),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(255, 62, 0, 0.35)',
                }}
              >
                <WhatshotIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                cohort<span style={{ color: '#FF3E00' }}>.dev</span>
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontFamily: "'Fira Code', monospace",
                fontSize: '0.72rem',
              }}
            >
              &copy; {year} Cohort.dev &middot; Brain food for developers &amp; builders
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}