import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LanguageIcon from '@mui/icons-material/Language'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import StarIcon from '@mui/icons-material/Star'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { useSuspenseQuery } from '@tanstack/react-query'
import { EmptyState, Badge, Button } from '#/components/ui'
import { formatDuration, initials } from '#/lib/format'
import { DateTime } from 'luxon'
import { MentorProfileSkeleton } from '#/components/skeletons/MentorProfileSkeleton'
import { userByIdQueryOptions, eventTypesQueryOptions } from '#/lib/queries'

export const Route = createFileRoute('/public/$userId/')({
  pendingComponent: MentorProfileSkeleton,
  loader: async ({ params, context: { queryClient } }) => {
    const userId = Number(params.userId)
    const [user] = await Promise.all([
      queryClient.ensureQueryData(userByIdQueryOptions(userId)).catch(() => null),
      queryClient.ensureQueryData(eventTypesQueryOptions(userId)).catch(() => null),
    ])
    if (!user) throw notFound()
  },
  component: PublicProfile,
})

function PublicProfile() {
  const { userId } = Route.useParams()
  const id = Number(userId)
  const { data: user } = useSuspenseQuery(userByIdQueryOptions(id))
  const { data: rawEventTypes } = useSuspenseQuery(eventTypesQueryOptions(id))
  const eventTypes = rawEventTypes.filter((e) => e.isActive)

  if (!user) return null

  const nowInHostTz = DateTime.now().setZone(user.timezone || 'UTC')
  const isDaytime = nowInHostTz.hour >= 6 && nowInHostTz.hour < 19

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
      <Stack spacing={3.5}>
        {/* Mentor Profile Header */}
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', mb: 1.5 }}>
            <Avatar
              sx={{
                width: { xs: 56, sm: 68 },
                height: { xs: 56, sm: 68 },
                background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: { xs: '1.4rem', sm: '1.7rem' },
                border: '2px solid rgba(255, 62, 0, 0.4)',
                boxShadow: '0 4px 16px rgba(255, 62, 0, 0.35)',
              }}
            >
              {initials(user.name)}
            </Avatar>
          </Box>

          <Typography variant="h3" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 900, mb: 0.3, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {user.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Badge tone="neutral">/{user.slug}</Badge>
            <Badge tone="flame">
              <LanguageIcon sx={{ fontSize: 12, mr: 0.4, verticalAlign: 'middle' }} />
              {user.timezone}
            </Badge>
            <Badge tone="pro">⚡ PRO MENTOR</Badge>
          </Box>

          {/* Timezone Status Card */}
          <Card
            variant="outlined"
            sx={{
              px: 2,
              py: 0.6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.2,
              borderRadius: 2,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7',
            }}
          >
            {isDaytime ? (
              <WbSunnyOutlinedIcon sx={{ fontSize: 15, color: '#F59E0B' }} />
            ) : (
              <DarkModeOutlinedIcon sx={{ fontSize: 15, color: '#8B5CF6' }} />
            )}
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.72rem' }}>
              Host local time: <strong style={{ color: '#FF3E00' }}>{nowInHostTz.toFormat('h:mm a')}</strong> ({user.timezone})
            </Typography>
          </Card>
        </Box>

        {/* Available Office Hour Tracks */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="h5" sx={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Available Session Tracks
            </Typography>
            <Badge tone="cyan">{eventTypes.length} ACTIVE</Badge>
          </Box>

          {eventTypes.length === 0 ? (
            <EmptyState
              title="No session tracks published yet"
              description={`${user.name} has not made any public 1:1 tracks active yet. Check back soon!`}
            />
          ) : (
            <Grid container spacing={1.5}>
              {eventTypes.map((eventType) => (
                <Grid key={eventType.id} size={{ xs: 12 }}>
                  <Link
                    to="/public/$userId/event-types/$eventTypeSlug"
                    params={{
                      userId: String(user.id),
                      eventTypeSlug: eventType.slug,
                    }}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 1.5,
                        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.55)' : '#FF3E00',
                          transform: 'translateY(-2px)',
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '0 16px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 62, 0, 0.2)'
                              : '0 12px 28px rgba(14, 18, 23, 0.09)',
                        },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8, flexWrap: 'wrap' }}>
                          <Badge tone="flame">{formatDuration(eventType.durationMinutes)}</Badge>
                          <Badge tone="neutral">
                            {eventType.locationType === 'online' ? 'Google Meet Video' : 'In Person'}
                          </Badge>
                        </Box>

                        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, mb: 0.4 }}>
                          {eventType.title}
                        </Typography>

                        {eventType.description ? (
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', fontSize: '0.78rem', lineHeight: 1.4, mb: 1 }}
                          >
                            {eventType.description}
                          </Typography>
                        ) : null}

                        <Stack direction="row" spacing={1.5} sx={{ color: 'text.secondary', fontSize: '0.7rem', fontFamily: "'Fira Code', monospace" }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <AccessTimeIcon sx={{ fontSize: 13, color: '#FF3E00' }} />
                            <span>Instant Booking</span>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <PlaceOutlinedIcon sx={{ fontSize: 13, color: '#06B6D4' }} />
                            <span>{eventType.locationValue || 'Online Video'}</span>
                          </Box>
                        </Stack>
                      </Box>

                      <Button
                        variant="contained"
                        size="sm"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                          fontWeight: 800,
                          px: 2,
                          py: 0.5,
                          fontSize: '0.76rem',
                          alignSelf: { xs: 'stretch', sm: 'center' },
                        }}
                      >
                        Select Time
                      </Button>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Fellow Testimonials & Peer Feedback */}
        <Card
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0E1217' : '#F4F6F8',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.08)' : '#DDE2E7',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800 }}>
                Verified Fellow Reviews
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.66rem' }}>
                // RECENT 1:1 SESSIONS FEEDBACK
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 900, fontFamily: "'Fira Code', monospace", fontSize: '0.85rem' }}>
                5.0 / 5.0
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={1.5}>
            {[
              {
                text: "The architectural code review saved us weeks of refactoring in our microservice migration.",
                author: "Alex Rivers",
                role: "Senior Backend Eng",
              },
              {
                text: "Unblocked our gRPC streaming and distributed tracing pipeline in a single 30m session. Worth every second.",
                author: "Danielle Chen",
                role: "Platform Engineer",
              },
            ].map((rev, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.78rem', mb: 1, fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{rev.text}"
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#FF3E00', display: 'block', fontSize: '0.7rem' }}>
                    {rev.author} <span style={{ color: 'var(--sea-ink-muted, #888)', fontWeight: 500 }}>— {rev.role}</span>
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Stack>
    </Container>
  )
}