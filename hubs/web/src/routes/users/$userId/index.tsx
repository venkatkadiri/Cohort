import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import BookmarkAddedOutlinedIcon from "@mui/icons-material/BookmarkAddedOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SchoolIcon from "@mui/icons-material/School";

import { eventTypesQueryOptions, bookingsQueryOptions } from "../../../lib/queries";
import { EmptyState } from "../../../components/ui";
import { formatDateTime, formatDuration } from "../../../lib/format";
import { StudioDashboardSkeleton } from "../../../components/skeletons/StudioDashboardSkeleton";

export const Route = createFileRoute("/users/$userId/")({
  pendingComponent: StudioDashboardSkeleton,
  loader: async ({ params, context: { queryClient } }) => {
    const hostId = Number(params.userId);
    await Promise.all([
      queryClient.ensureQueryData(eventTypesQueryOptions(hostId)),
      queryClient.ensureQueryData(bookingsQueryOptions(hostId)),
    ]);
  },
  component: HostOverviewPage,
});

function HostOverviewPage() {
  const { userId } = Route.useParams();
  const hostId = Number(userId);
  const { data: eventTypes } = useSuspenseQuery(eventTypesQueryOptions(hostId));
  const { data: bookings } = useSuspenseQuery(bookingsQueryOptions(hostId));
  const [copiedLink, setCopiedLink] = useState(false);

  const activeEventTypes = eventTypes.filter((e) => e.isActive);
  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/public/${userId}`
    : `/public/${userId}`;

  return (
    <Stack spacing={4}>
      {/* Studio Header Quick Bar */}
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: 'rgba(255, 62, 0, 0.12)',
                color: '#FF3E00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              <SchoolIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                Mentor Availability Studio
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Host ID #{userId} &middot; Studio Console
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              navigator.clipboard?.writeText(publicUrl);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            startIcon={copiedLink ? <CheckIcon color="success" /> : <ContentCopyIcon sx={{ color: '#FF3E00' }} />}
          >
            {copiedLink ? "Link Copied!" : "Copy Public Link"}
          </Button>
        </Box>
      </Card>

      {/* Metrics Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: 'rgba(255, 62, 0, 0.12)',
                color: '#FF3E00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LayersOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>
                Session Tracks
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '1.8rem', lineHeight: 1 }}>
                {eventTypes.length}{" "}
                <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                  ({activeEventTypes.length} active)
                </Typography>
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookmarkAddedOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>
                Total Bookings
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '1.8rem', lineHeight: 1 }}>
                {bookings.length}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarMonthOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>
                Quick Action
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Link
                  to="/users/$userId/event-types/new"
                  params={{ userId }}
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{ fontSize: '0.72rem', py: 0.4 }}
                  >
                    Track
                  </Button>
                </Link>
                <Link
                  to="/users/$userId/slots"
                  params={{ userId }}
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.72rem', py: 0.4 }}
                  >
                    Slots
                  </Button>
                </Link>
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid: Active Tracks + Recent Bookings */}
      <Grid container spacing={3}>
        {/* Active Tracks Preview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5">Session Tracks ({eventTypes.length})</Typography>
              <Link
                to="/users/$userId/event-types"
                params={{ userId }}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  color="primary"
                  size="small"
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                >
                  Manage all
                </Button>
              </Link>
            </Box>

            {eventTypes.length === 0 ? (
              <EmptyState
                title="No session tracks created yet"
                description="Create meeting tracks with custom durations, buffers, and locations."
                action={
                  <Link
                    to="/users/$userId/event-types/new"
                    params={{ userId }}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon fontSize="small" />}
                      sx={{
                        background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                      }}
                    >
                      Create First Track
                    </Button>
                  </Link>
                }
              />
            ) : (
              <Stack spacing={1.5}>
                {eventTypes.map((et) => (
                  <Card
                    key={et.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                          {et.title}
                        </Typography>
                        <Chip
                          label={et.isActive ? "Active" : "Hidden"}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            bgcolor: et.isActive ? 'rgba(16, 185, 129, 0.12)' : 'secondary.main',
                            color: et.isActive ? '#10B981' : 'text.secondary',
                          }}
                        />
                      </Box>
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <AccessTimeIcon sx={{ fontSize: 13, color: '#FF3E00' }} /> {formatDuration(et.durationMinutes)}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          {et.locationType === "online" ? (
                            <LanguageIcon sx={{ fontSize: 13, color: '#FF3E00' }} />
                          ) : (
                            <PlaceOutlinedIcon sx={{ fontSize: 13, color: '#FF3E00' }} />
                          )}
                          {et.locationType === "online" ? "Online Meet" : "In person"}
                        </Typography>
                      </Stack>
                    </Box>

                    <Link
                      to="/users/$userId/event-types/$eventTypeSlug"
                      params={{ userId, eventTypeSlug: et.slug }}
                      style={{ textDecoration: 'none' }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                      >
                        Edit
                      </Button>
                    </Link>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Grid>

        {/* Recent Bookings Feed */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5">Recent Bookings ({bookings.length})</Typography>
              <Link
                to="/users/$userId/bookings"
                params={{ userId }}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  color="primary"
                  size="small"
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                  sx={{ color: '#FF3E00', fontWeight: 800 }}
                >
                  View all
                </Button>
              </Link>
            </Box>

            {bookings.length === 0 ? (
              <EmptyState
                title="No bookings recorded yet"
                description="Share your public booking page link to start receiving sessions from fellows."
              />
            ) : (
              <Stack spacing={1.5}>
                {recentBookings.map((b) => (
                  <Card key={b.id} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {b.inviteeName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {b.inviteeEmail} &middot; {b.eventType?.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={b.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          bgcolor:
                            b.status === "CANCELLED"
                              ? 'rgba(239, 68, 68, 0.12)'
                              : b.status === "CONFIRMED"
                              ? 'rgba(16, 185, 129, 0.12)'
                              : 'rgba(14, 165, 233, 0.12)',
                          color:
                            b.status === "CANCELLED"
                              ? '#EF4444'
                              : b.status === "CONFIRMED"
                              ? '#10B981'
                              : '#0EA5E9',
                        }}
                      />
                    </Box>
                    {b.slot ? (
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 700, color: '#FF3E00', fontFamily: "'Fira Code', monospace" }}>
                        {formatDateTime(b.slot.startAt)}
                      </Typography>
                    ) : null}
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
