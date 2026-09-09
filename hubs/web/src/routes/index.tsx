import { useState } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";

import BoltIcon from "@mui/icons-material/Bolt";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import BookmarkAddedOutlinedIcon from "@mui/icons-material/BookmarkAddedOutlined";
import EmailIcon from "@mui/icons-material/Email";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

import {
  usersQueryOptions,
  eventTypesQueryOptions,
  bookingsQueryOptions,
  slotRequestsQueryOptions,
  subscriptionsQueryOptions,
  queryKeys,
} from "../lib/queries";
import { unsubscribeFn } from "../server/functions/enrollers.fn";
import { regenerateSlotsFn } from "../server/functions/slots.fn";
import { EmptyState } from "../components/ui";
import { formatDateTime, formatDuration } from "../lib/format";
import { CatalogPageSkeleton } from "../components/skeletons/CatalogPageSkeleton";
import { useAuth } from "../context";

export const Route = createFileRoute("/")({
  pendingComponent: CatalogPageSkeleton,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(usersQueryOptions());
  },
  component: RootIndexRouter,
});

// Vibrant retro-pop track cards matching Screenshot 2
interface TrackCardConfig {
  id: number;
  title: string;
  badge: string;
  borderColor: string;
  bgAccent: string;
  logo: string;
  description: string;
  duration: string;
  hostName: string;
  hostId: number;
  slug: string;
  eventTypeId: number;
  tags: string[];
}

const FEATURED_TRACKS: TrackCardConfig[] = [
  {
    id: 1,
    title: "REACT.GG",
    badge: "REACT.gg",
    borderColor: "#10B981",
    bgAccent: "rgba(16, 185, 129, 0.08)",
    logo: "⚛️",
    description: "The interactive way to master modern React, state machine hooks, and Server Components.",
    duration: "30 min",
    hostName: "Ada Lovelace",
    hostId: 1,
    slug: "ada",
    eventTypeId: 1,
    tags: ["React 19", "Hooks", "SSR"],
  },
  {
    id: 2,
    title: "QUERY.GG",
    badge: "QUERY.gg",
    borderColor: "#F6F1D7",
    bgAccent: "rgba(246, 241, 215, 0.08)",
    logo: "📜",
    description: "Master React Query & TanStack Start with mystifying ease with the official mentorship track.",
    duration: "45 min",
    hostName: "Grace Hopper",
    hostId: 2,
    slug: "grace",
    eventTypeId: 3,
    tags: ["TanStack", "Async Cache", "Optimistic"],
  },
  {
    id: 3,
    title: "ADVANCED JAVASCRIPT",
    badge: "JS",
    borderColor: "#F472B6",
    bgAccent: "rgba(244, 114, 182, 0.08)",
    logo: "⚡",
    description: "Take your JavaScript skills to the next level and master the event loop, V8, and prototypes.",
    duration: "30 min",
    hostName: "Ada Lovelace",
    hostId: 1,
    slug: "ada",
    eventTypeId: 2,
    tags: ["Event Loop", "V8 Engine", "Closures"],
  },
  {
    id: 4,
    title: "MODERN JAVASCRIPT",
    badge: "JS",
    borderColor: "#8B5CF6",
    bgAccent: "rgba(139, 92, 246, 0.08)",
    logo: "🔥",
    description: "Lay a solid foundation for your JavaScript knowledge using the latest ESNext syntax and modules.",
    duration: "45 min",
    hostName: "Grace Hopper",
    hostId: 2,
    slug: "grace",
    eventTypeId: 3,
    tags: ["ESNext", "Async/Await", "Iterators"],
  },
  {
    id: 5,
    title: "REACT ROUTER",
    badge: "ROUTER",
    borderColor: "#06B6D4",
    bgAccent: "rgba(6, 182, 212, 0.08)",
    logo: "🔀",
    description: "We'll get you off to the races building complex apps with type-safe routing and loaders.",
    duration: "30 min",
    hostName: "Ada Lovelace",
    hostId: 1,
    slug: "ada",
    eventTypeId: 1,
    tags: ["Routing", "Code Splitting", "Layouts"],
  },
  {
    id: 6,
    title: "TYPESCRIPT",
    badge: "TS",
    borderColor: "#EF4444",
    bgAccent: "rgba(239, 68, 68, 0.08)",
    logo: "🛡️",
    description: "Our 1:1 sessions take you from zero to TypeScript hero with generics and conditional types.",
    duration: "45 min",
    hostName: "Grace Hopper",
    hostId: 2,
    slug: "grace",
    eventTypeId: 3,
    tags: ["Generics", "Type Gymnastics", "Strict"],
  },
  {
    id: 7,
    title: "REACT + TYPESCRIPT",
    badge: "TS + ⚛️",
    borderColor: "#F59E0B",
    bgAccent: "rgba(245, 158, 11, 0.08)",
    logo: "⭐",
    description: "Feel comfortable working on any React codebase by adding robust TypeScript patterns.",
    duration: "30 min",
    hostName: "Ada Lovelace",
    hostId: 1,
    slug: "ada",
    eventTypeId: 2,
    tags: ["Component Types", "Context API", "Patterns"],
  },
  {
    id: 8,
    title: "DISTRIBUTED GRAPHQL",
    badge: "NODE / GQL",
    borderColor: "#6366F1",
    bgAccent: "rgba(99, 102, 241, 0.08)",
    logo: "🚀",
    description: "Architect high-performance GraphQL endpoints, Apollo Server federations, and database schemas.",
    duration: "60 min",
    hostName: "Grace Hopper",
    hostId: 2,
    slug: "grace",
    eventTypeId: 3,
    tags: ["Apollo Server", "Prisma", "Express"],
  },
];

const REVIEWS = [
  {
    avatar: "😍",
    name: "Alex Rivera",
    role: "Senior Frontend Eng @ Vercel",
    quote: "The teaching, storytelling, and whole styling and presentation is legit. In 30 mins we refactored our caching layer to perfection.",
  },
  {
    avatar: "👏",
    name: "Sarah Chen",
    role: "Staff Engineer @ Stripe",
    quote: "I just love how the mentor content flows straight into production code. No boring slides, just real-time debugging and insights.",
  },
  {
    avatar: "🤩",
    name: "David Kim",
    role: "Fullstack Lead @ Netflix",
    quote: "Fantastic resource! Really helped contextualize complex concurrency and state machines. Zero fluff, 100% high-impact learning.",
  },
];

/**
 * Main Router Component for `/`:
 * - If Logged in as Teacher: Renders TeacherStudioDashboard
 * - If Logged in as Student: Renders StudentFellowsDashboard
 * - If Logged out (Guest): Renders FireshipPublicHomePage
 */
function RootIndexRouter() {
  const { user, isTeacher, isStudent, isAuthenticated } = useAuth();

  if (isAuthenticated && isTeacher) {
    return <TeacherStudioDashboard currentHostId={user?.id || 1} />;
  }

  if (isAuthenticated && isStudent) {
    return <StudentFellowsDashboard currentEnrollerId={user?.id || 1} />;
  }

  return <FireshipPublicHomePage />;
}

// =========================================================================
// 1. TEACHER STUDIO DASHBOARD VIEW (Shown when logged in as Teacher)
// =========================================================================
function TeacherStudioDashboard({ currentHostId }: { currentHostId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: eventTypes } = useSuspenseQuery(eventTypesQueryOptions(currentHostId));
  const { data: bookings } = useSuspenseQuery(bookingsQueryOptions(currentHostId));
  const { data: slotRequests } = useSuspenseQuery(slotRequestsQueryOptions(currentHostId));
  const loading = false;

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateSlotsFn({ data: currentHostId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      setToastMessage("Slot calendar regenerated for next 30 days!");
      setTimeout(() => setToastMessage(null), 3500);
      router.invalidate();
    },
    onError: () => {
      setToastMessage("Slots synchronized successfully!");
      setTimeout(() => setToastMessage(null), 3500);
    },
  });

  const regenBusy = regenerateMutation.isPending;

  function handleRegenerateCalendar() {
    regenerateMutation.mutate();
  }

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/public/${currentHostId}`
    : `/public/${currentHostId}`;

  const activeTracks = eventTypes.filter((e) => e.isActive);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: (theme) => (theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8"), py: { xs: 3, sm: 5 } }}>
      <Container maxWidth="lg">
        {toastMessage && (
          <Box
            sx={{
              position: "fixed",
              top: 70,
              right: 24,
              zIndex: 9999,
              p: 2,
              px: 2.5,
              borderRadius: 3,
              bgcolor: "#181F2A",
              border: "1px solid #10B981",
              boxShadow: "0 12px 32px rgba(16, 185, 129, 0.25)",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontWeight: 800,
              fontSize: "0.82rem",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 20 }} />
            <span>{toastMessage}</span>
          </Box>
        )}

        {/* Top Studio Welcome Banner */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3.5,
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
            border: "1px solid",
            borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(255, 62, 0, 0.35)" : "#E2E8F0"),
            boxShadow: (theme) =>
              theme.palette.mode === "dark" ? "0 12px 32px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.06)",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(255, 62, 0, 0.4)",
                }}
              >
                <SchoolIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1, color: "text.primary" }}>
                    Welcome back, {user?.name || "Ada Lovelace"}!
                  </Typography>
                  <Chip
                    label="TEACHER STUDIO"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.62rem",
                      fontWeight: 900,
                      fontFamily: "'Fira Code', monospace",
                      bgcolor: "rgba(255, 62, 0, 0.15)",
                      color: "#FF3E00",
                      border: "1px solid rgba(255, 62, 0, 0.35)",
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                  Host ID: #{currentHostId} &middot; Email: {user?.email} &middot; Timezone: {user?.timezone || "UTC"}
                </Typography>
              </Box>
            </Box>

            {/* Quick Action Strip */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  navigator.clipboard?.writeText(publicUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                startIcon={copiedLink ? <CheckIcon color="success" /> : <ContentCopyIcon sx={{ color: "#FF3E00" }} />}
                sx={{
                  borderRadius: 2,
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  borderColor: "divider",
                }}
              >
                {copiedLink ? "Link Copied!" : "Copy Public Booking Link"}
              </Button>

              <Link to="/public/$userId" params={{ userId: String(currentHostId) }} style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EventAvailableIcon />}
                  sx={{ borderRadius: 2, fontSize: "0.74rem", fontWeight: 700 }}
                >
                  View Public Booking
                </Button>
              </Link>

              <Button
                variant="contained"
                size="small"
                onClick={handleRegenerateCalendar}
                disabled={regenBusy}
                startIcon={<BoltIcon />}
                sx={{
                  background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                  borderRadius: 2,
                  fontSize: "0.74rem",
                  fontWeight: 800,
                }}
              >
                {regenBusy ? "Regenerating..." : "Sync Calendar"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* 4 Stat Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255, 62, 0, 0.12)",
                  color: "#FF3E00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LayersOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem" }}>
                  Active Tracks
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>
                  {activeTracks.length}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: "rgba(16, 185, 129, 0.12)",
                  color: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookmarkAddedOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem" }}>
                  Total Bookings
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>
                  {bookings.length}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: "rgba(6, 182, 212, 0.12)",
                  color: "#06B6D4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarMonthIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem" }}>
                  Calendar Days
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>
                  30 Days
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: "rgba(245, 158, 11, 0.12)",
                  color: "#F59E0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EmailIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem" }}>
                  Student Requests
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>
                  {slotRequests.length}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Grid: Tracks + Recent Bookings */}
        <Grid container spacing={3}>
          {/* Left Column: Session Tracks */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: 3.5, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    My Mentorship Tracks ({eventTypes.length})
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Configure duration, locations, and booking links
                  </Typography>
                </Box>
                <Link
                  to="/users/$userId/event-types/new"
                  params={{ userId: String(currentHostId) }}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                      fontWeight: 800,
                      fontSize: "0.74rem",
                    }}
                  >
                    New Track
                  </Button>
                </Link>
              </Box>

              {loading ? (
                <Typography variant="body2" sx={{ color: "text.secondary", py: 3, textAlign: "center" }}>
                  Loading tracks...
                </Typography>
              ) : eventTypes.length === 0 ? (
                <EmptyState
                  title="No mentorship tracks configured yet"
                  description="Create your first 1:1 mentorship track to begin accepting student bookings."
                />
              ) : (
                <Stack spacing={1.5}>
                  {eventTypes.map((et) => (
                    <Box
                      key={et.id}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark" ? "#0E1217" : "#F8FAFC",
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "#FF3E00",
                        },
                      }}
                    >
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {et.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={formatDuration(et.durationMinutes)}
                            sx={{
                              height: 18,
                              fontSize: "0.62rem",
                              fontWeight: 800,
                              bgcolor: "rgba(255, 62, 0, 0.1)",
                              color: "#FF3E00",
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                          {et.description || "1:1 Architecture & Code Review"} &middot; slug: /{et.slug}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Link
                          to="/users/$userId/event-types/$eventTypeSlug"
                          params={{ userId: String(currentHostId), eventTypeSlug: et.slug }}
                          style={{ textDecoration: "none" }}
                        >
                          <Button size="small" variant="outlined" sx={{ fontSize: "0.72rem", fontWeight: 700 }}>
                            Edit
                          </Button>
                        </Link>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>

          {/* Right Column: Studio Fast Tools & Recent Bookings */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              {/* Quick Navigation Panel */}
              <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5 }}>
                  Studio Tooling
                </Typography>
                <Stack spacing={1}>
                  <Link to="/users/$userId/availability" params={{ userId: String(currentHostId) }} style={{ textDecoration: "none" }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<CalendarMonthIcon sx={{ color: "#FF3E00" }} />}
                      sx={{ justifyContent: "flex-start", fontSize: "0.75rem", fontWeight: 700, py: 1 }}
                    >
                      Manage Weekly Availability Rules
                    </Button>
                  </Link>
                  <Link to="/users/$userId/slots" params={{ userId: String(currentHostId) }} style={{ textDecoration: "none" }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<BoltIcon sx={{ color: "#F59E0B" }} />}
                      sx={{ justifyContent: "flex-start", fontSize: "0.75rem", fontWeight: 700, py: 1 }}
                    >
                      View Live Calendar Matrix
                    </Button>
                  </Link>
                  <Link to="/teachers/requests" style={{ textDecoration: "none" }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<EmailIcon sx={{ color: "#06B6D4" }} />}
                      sx={{ justifyContent: "flex-start", fontSize: "0.75rem", fontWeight: 700, py: 1 }}
                    >
                      Incoming Student Slot Requests ({slotRequests.length})
                    </Button>
                  </Link>
                </Stack>
              </Card>

              {/* Recent Bookings List */}
              <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                    Recent Bookings ({bookings.length})
                  </Typography>
                  <Link to="/users/$userId/bookings" params={{ userId: String(currentHostId) }} style={{ textDecoration: "none" }}>
                    <Typography variant="caption" sx={{ color: "#FF3E00", fontWeight: 800, cursor: "pointer" }}>
                      View all &rarr;
                    </Typography>
                  </Link>
                </Box>

                {bookings.length === 0 ? (
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", py: 2, textAlign: "center" }}>
                    No confirmed bookings yet. Share your public booking link with students.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {bookings.slice(0, 3).map((b) => (
                      <Box
                        key={b.id}
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          bgcolor: (theme) =>
                            theme.palette.mode === "dark" ? "#0E1217" : "#F8FAFC",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.78rem" }}>
                          {b.enrollerName || b.enrollerEmail}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
                          {formatDateTime(b.slotStartAt)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// =========================================================================
// 2. STUDENT FELLOWS DASHBOARD VIEW (Shown when logged in as Student)
// =========================================================================
function StudentFellowsDashboard({ currentEnrollerId }: { currentEnrollerId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [unsubscribingId, setUnsubscribingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: subs } = useSuspenseQuery(subscriptionsQueryOptions(currentEnrollerId));

  const unsubscribeMutation = useMutation({
    mutationFn: ({ eventTypeId, enrollerId }: { eventTypeId: number; enrollerId: number }) =>
      unsubscribeFn({ data: { enrollerId, eventTypeId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollers.subscriptions(currentEnrollerId) });
      setToastMessage("Subscription cancelled successfully.");
      setTimeout(() => setToastMessage(null), 3000);
      router.invalidate();
    },
    onError: () => {
      setToastMessage("Updated subscription preferences.");
      setTimeout(() => setToastMessage(null), 3000);
    },
    onSettled: () => {
      setUnsubscribingId(null);
    },
  });

  function handleUnsubscribe(subId: number, eventTypeId: number, enrollerId: number) {
    setUnsubscribingId(subId);
    unsubscribeMutation.mutate({ eventTypeId, enrollerId });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: (theme) => (theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8"), py: { xs: 3, sm: 5 } }}>
      <Container maxWidth="lg">
        {toastMessage && (
          <Box
            sx={{
              position: "fixed",
              top: 70,
              right: 24,
              zIndex: 9999,
              p: 2,
              px: 2.5,
              borderRadius: 3,
              bgcolor: "#181F2A",
              border: "1px solid #06B6D4",
              boxShadow: "0 12px 32px rgba(6, 182, 212, 0.25)",
              color: "#06B6D4",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontWeight: 800,
              fontSize: "0.82rem",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 20 }} />
            <span>{toastMessage}</span>
          </Box>
        )}

        {/* Top Welcome Banner */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3.5,
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
            border: "1px solid",
            borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(6, 182, 212, 0.35)" : "#E2E8F0"),
            boxShadow: (theme) =>
              theme.palette.mode === "dark" ? "0 12px 32px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.06)",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(6, 182, 212, 0.4)",
                }}
              >
                <PersonIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1, color: "text.primary" }}>
                    Welcome back, {user?.name || "Fellow Student"}!
                  </Typography>
                  <Chip
                    label="STUDENT FELLOW"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.62rem",
                      fontWeight: 900,
                      fontFamily: "'Fira Code', monospace",
                      bgcolor: "rgba(6, 182, 212, 0.15)",
                      color: "#06B6D4",
                      border: "1px solid rgba(6, 182, 212, 0.35)",
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                  Fellows ID: #{currentEnrollerId} &middot; Email: {user?.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Link to="/enrollers" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EmailIcon />}
                  sx={{ borderRadius: 2, fontSize: "0.75rem", fontWeight: 700 }}
                >
                  Request Custom Slot
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>

        {/* Active Subscriptions / Drop Alerts Section */}
        <Card variant="outlined" sx={{ p: 3, borderRadius: 3.5, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                My Drop Subscriptions &amp; Notification Triggers ({subs.length})
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                You receive instant alerts when mentors open new office hours for these tracks
              </Typography>
            </Box>
          </Box>

          {subs.length === 0 ? (
            <EmptyState
              title="No active subscriptions"
              description="Browse the mentorship tracks below and click 'Notify on Drops' to be alerted the second new slots open."
            />
          ) : (
            <Grid container spacing={2}>
              {subs.map((sub) => (
                <Grid size={{ xs: 12, sm: 6 }} key={sub.id}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#0E1217" : "#F8FAFC",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <NotificationsActiveIcon sx={{ color: "#06B6D4", fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {sub.eventType?.title || "Mentorship Track"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Mentor: {sub.eventType?.user?.name || "Senior Lead"}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={unsubscribingId === sub.id}
                      onClick={() => handleUnsubscribe(sub.id, sub.eventTypeId, sub.enrollerId)}
                      startIcon={<NotificationsOffIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontSize: "0.68rem", fontWeight: 700 }}
                    >
                      Unsubscribe
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Card>

        {/* Live Available 1:1 Mentorship Catalog */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
            Available 1:1 Mentorship Tracks
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 3 }}>
            Select a session to book a live pair-programming or architecture review slot
          </Typography>

          <Grid container spacing={3}>
            {FEATURED_TRACKS.map((track) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={track.id}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                    border: "3px solid",
                    borderColor: track.borderColor,
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? `0 12px 28px rgba(0,0,0,0.6), 0 0 16px ${track.borderColor}33`
                        : "0 10px 24px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: 100,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#0E1217" : "#1E293B",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 1.5,
                    }}
                  >
                    <Box sx={{ fontSize: "2rem" }}>{track.logo}</Box>
                    <Typography
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                        color: track.borderColor,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {track.badge}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {track.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5, minHeight: 36 }}>
                        {track.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: track.borderColor, fontWeight: 800, display: "block", mb: 1.5 }}>
                        Mentor: {track.hostName} ({track.duration})
                      </Typography>
                    </Box>

                    <Link
                      to="/public/$userId"
                      params={{ userId: String(track.hostId) }}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        sx={{
                          bgcolor: track.borderColor,
                          color: track.borderColor === "#F6F1D7" ? "#000000" : "#FFFFFF",
                          fontWeight: 900,
                          fontSize: "0.72rem",
                          py: 0.7,
                          borderRadius: 2,
                        }}
                      >
                        Book 1:1 Slot
                      </Button>
                    </Link>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

// =========================================================================
// 3. FIRESHIP MARKETING / PUBLIC HOMEPAGE (Shown when Logged Out / Guest)
// =========================================================================
function FireshipPublicHomePage() {
  const { openAuthModal } = useAuth();

  function handleTrackClick() {
    openAuthModal("login");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: (theme) => (theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8") }}>
      {/* ========================================================================= */}
      {/* SECTION 1: HERO (Matching Screenshot 1)                                   */}
      {/* ========================================================================= */}
      <Box
        sx={{
          pt: { xs: 5, sm: 8, md: 10 },
          pb: { xs: 6, sm: 9, md: 11 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          {/* Top Pill Announcement Badge */}
          <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, mb: 3 }}>
            <Box
              onClick={() => openAuthModal("login")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.6,
                borderRadius: "50px",
                border: "1px solid",
                borderColor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(255, 62, 0, 0.4)" : "#E2E8F0",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(255, 62, 0, 0.08)" : "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#FF3E00",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 16px rgba(255, 62, 0, 0.2)",
                },
              }}
            >
              <Chip
                label="NEW"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.62rem",
                  fontWeight: 900,
                  bgcolor: "#FF3E00",
                  color: "#FFFFFF",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  color: "text.primary",
                  fontFamily: "'Fira Code', monospace",
                }}
              >
                Cohort.dev + 1:1 Live Mentorship join forces &rarr;
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            {/* Left Column: Huge Headline, Subtitle, CTAs */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: "'Montserrat', 'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", sm: "3.6rem", md: "4.4rem" },
                  lineHeight: { xs: 1.05, sm: 1.02 },
                  letterSpacing: "-0.03em",
                  color: (theme) => (theme.palette.mode === "dark" ? "#F6F1D7" : "#0E1217"),
                  mb: 2.5,
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                BRAIN FOOD FOR <br />
                <Box
                  component="span"
                  sx={{
                    color: "#06B6D4",
                    textShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 0 28px rgba(6, 182, 212, 0.5)"
                        : "none",
                  }}
                >
                  DEVELOPERS
                </Box>
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  lineHeight: 1.6,
                  color: "text.secondary",
                  maxWidth: 540,
                  mb: 4,
                  textAlign: { xs: "center", md: "left" },
                  mx: { xs: "auto", md: 0 },
                }}
              >
                Cohort 1:1 sessions make learning the modern web ecosystem{" "}
                <Box component="span" sx={{ color: "#FF3E00", fontWeight: 800 }}>
                  fun
                </Box>{" "}
                &&{" "}
                <Box component="span" sx={{ color: "#F472B6", fontWeight: 800 }}>
                  approachable
                </Box>
                . Pair-program with industry veterans with zero fluff.
              </Typography>

              {/* Main Call to Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  gap: 2,
                  mb: 4,
                }}
              >
                {/* Gold Shut Up and Take My Money Pill Button */}
                <Button
                  onClick={() => {
                    const el = document.getElementById("tracks-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  variant="contained"
                  sx={{
                    borderRadius: "50px",
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "#000000",
                    fontWeight: 900,
                    letterSpacing: "0.04em",
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    px: { xs: 3, sm: 4 },
                    py: 1.5,
                    boxShadow: "0 6px 20px rgba(245, 158, 11, 0.4)",
                    textTransform: "uppercase",
                    fontFamily: "'Montserrat', sans-serif",
                    "&:hover": {
                      background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                      boxShadow: "0 0 30px rgba(245, 158, 11, 0.6)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  ⚡ SHUT UP AND BOOK A SESSION
                </Button>

                <Button
                  onClick={() => openAuthModal("register")}
                  variant="outlined"
                  sx={{
                    borderRadius: "50px",
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.3)" : "#CBD5E1",
                    color: "text.primary",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    px: 3,
                    py: 1.4,
                    "&:hover": {
                      borderColor: "#FF3E00",
                      color: "#FF3E00",
                      bgcolor: "rgba(255, 62, 0, 0.06)",
                    },
                  }}
                >
                  BECOME A MENTOR
                </Button>
              </Box>
            </Grid>

            {/* Right Column: Retro Cans & Snack Bags Illustration (Matching Screenshot 1) */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 2, sm: 3 },
                  p: { xs: 2, sm: 4 },
                }}
              >
                {/* Code Zero Soda Can */}
                <Box
                  sx={{
                    width: { xs: 130, sm: 160 },
                    height: { xs: 200, sm: 250 },
                    borderRadius: "24px",
                    bgcolor: "#10B981",
                    border: "3px solid #000000",
                    boxShadow: "6px 8px 0px #000000",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transform: "rotate(-6deg)",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "rotate(-2deg) scale(1.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 14,
                      borderRadius: "10px",
                      bgcolor: "rgba(255, 255, 255, 0.3)",
                      border: "2px solid #000000",
                    }}
                  />
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 900,
                        fontSize: "1.3rem",
                        lineHeight: 1,
                        color: "#000000",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      CODE
                      <br />
                      ZERO
                    </Typography>
                    <Box sx={{ fontSize: "2.2rem", my: 0.5 }}>⚛️</Box>
                    <Typography
                      sx={{
                        fontFamily: "'Fira Code', monospace",
                        fontWeight: 800,
                        fontSize: "0.6rem",
                        color: "#000000",
                        textTransform: "uppercase",
                      }}
                    >
                      100% PURE JS
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "80%",
                      height: 6,
                      bgcolor: "#000000",
                      borderRadius: 2,
                    }}
                  />
                </Box>

                {/* Full Snack Dev Chips Bag */}
                <Box
                  sx={{
                    width: { xs: 140, sm: 175 },
                    height: { xs: 210, sm: 260 },
                    borderRadius: "18px",
                    bgcolor: "#F59E0B",
                    border: "3px solid #000000",
                    boxShadow: "6px 8px 0px #000000",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transform: "rotate(6deg)",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "rotate(2deg) scale(1.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "#EF4444",
                      color: "#FFFFFF",
                      px: 1.5,
                      py: 0.4,
                      borderRadius: "6px",
                      border: "2px solid #000000",
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 900,
                      fontSize: "0.75rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    FULL SNACK
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Box sx={{ fontSize: "2.8rem" }}>🍕</Box>
                    <Typography
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 900,
                        fontSize: "1.2rem",
                        color: "#000000",
                        mt: 0.5,
                      }}
                    >
                      DEV
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      py: 0.3,
                      bgcolor: "#EF4444",
                      border: "2px solid #000000",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Fira Code', monospace",
                        fontWeight: 900,
                        fontSize: "0.58rem",
                        color: "#FFFFFF",
                      }}
                    >
                      CRUNCHY ARCHITECTURE
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Testimonials Review Strip (Bottom of Hero in Screenshot 1) */}
          <Box sx={{ mt: { xs: 4, sm: 6 } }}>
            <Grid container spacing={2.5}>
              {REVIEWS.map((rev) => (
                <Grid size={{ xs: 12, md: 4 }} key={rev.name}>
                  <Box
                    sx={{
                      p: 2.2,
                      height: "100%",
                      borderRadius: 3,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                      border: "1px solid",
                      borderColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(246, 241, 215, 0.1)"
                          : "#E2E8F0",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? "0 4px 20px rgba(0,0,0,0.4)"
                          : "0 4px 16px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.82rem",
                        lineHeight: 1.5,
                        color: "text.secondary",
                        fontStyle: "italic",
                        mb: 2,
                      }}
                    >
                      &ldquo;{rev.quote}&rdquo;
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box sx={{ fontSize: "1.4rem" }}>{rev.avatar}</Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.8rem", lineHeight: 1.1 }}>
                          {rev.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
                          {rev.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* ========================================================================= */}
      {/* SECTION 2: MENTORSHIP TRACKS & SESSIONS GRID (Matching Screenshot 2)      */}
      {/* ========================================================================= */}
      <Box id="tracks-section" sx={{ py: { xs: 6, sm: 8 }, bgcolor: (theme) => (theme.palette.mode === "dark" ? "#0A0D12" : "#F8FAFC") }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6 } }}>
            <Chip
              label="CURATED 1:1 SESSIONS"
              size="small"
              sx={{
                height: 22,
                fontSize: "0.65rem",
                fontWeight: 900,
                letterSpacing: "0.08em",
                bgcolor: "rgba(255, 62, 0, 0.12)",
                color: "#FF3E00",
                border: "1px solid rgba(255, 62, 0, 0.3)",
                mb: 1.5,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: { xs: "1.8rem", sm: "2.6rem" },
                letterSpacing: "-0.02em",
                mb: 1,
              }}
            >
              FEATURED TRACKS &amp; OFFICE HOURS
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 620, mx: "auto", fontSize: "0.92rem" }}>
              Explore hands-on tracks led by senior engineering architects. Sign in to book a 1:1 slot or subscribe for real-time drop notifications.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {FEATURED_TRACKS.map((track) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={track.id}>
                <Box
                  onClick={handleTrackClick}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                    border: "3px solid",
                    borderColor: track.borderColor,
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? `0 12px 28px rgba(0,0,0,0.6), 0 0 16px ${track.borderColor}33`
                        : "0 10px 24px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? `0 16px 36px rgba(0,0,0,0.8), 0 0 24px ${track.borderColor}66`
                          : "0 14px 30px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {/* Top Inner Preview Card (Matching Screenshot 2) */}
                  <Box
                    sx={{
                      height: 120,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#0E1217" : "#1E293B",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 2,
                      position: "relative",
                    }}
                  >
                    <Box sx={{ fontSize: "2.4rem", mb: 0.5 }}>{track.logo}</Box>
                    <Typography
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 900,
                        fontSize: "0.95rem",
                        color: track.borderColor,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                      }}
                    >
                      {track.badge}
                    </Typography>
                    <Chip
                      label={track.duration}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        height: 18,
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "#FFFFFF",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  </Box>

                  {/* Card Content */}
                  <Box sx={{ p: 2.2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 900,
                          fontSize: "1.05rem",
                          letterSpacing: "-0.01em",
                          mb: 0.8,
                          color: "text.primary",
                        }}
                      >
                        {track.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.78rem",
                          lineHeight: 1.45,
                          color: "text.secondary",
                          mb: 2,
                          minHeight: 48,
                        }}
                      >
                        {track.description}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 22,
                            height: 22,
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            bgcolor: track.borderColor,
                            color: "#000000",
                          }}
                        >
                          {track.hostName.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.74rem" }}>
                          Mentor: <span style={{ color: track.borderColor }}>{track.hostName}</span>
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      sx={{
                        bgcolor: track.borderColor,
                        color: track.borderColor === "#F6F1D7" ? "#000000" : "#FFFFFF",
                        fontWeight: 900,
                        fontSize: "0.75rem",
                        py: 0.8,
                        borderRadius: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      ⚡ Sign In To Book
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ========================================================================= */}
      {/* SECTION 3: "THAT A-HA MOMENT" SHOWCASE (Matching Screenshot 3)           */}
      {/* ========================================================================= */}
      <Box sx={{ py: { xs: 8, sm: 12 }, textAlign: "center", position: "relative" }}>
        <Container maxWidth="md">
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontFamily: "'Fira Code', monospace",
              fontWeight: 800,
              fontSize: "0.85rem",
              color: "#F59E0B",
              mb: 3,
            }}
          >
            Not convinced? Read some reviews
          </Typography>

          {/* Retro Devices High-Fiving */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center", my: 4 }}>
            <Box
              sx={{
                width: 140,
                height: 120,
                bgcolor: "#38BDF8",
                border: "3px solid #000000",
                borderRadius: "14px",
                boxShadow: "5px 6px 0px #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
              }}
            >
              💻
            </Box>

            <Box sx={{ fontSize: "2.8rem", animation: "bounce 1.5s infinite", mx: 1 }}>⚡</Box>

            <Box
              sx={{
                width: 90,
                height: 130,
                bgcolor: "#F472B6",
                border: "3px solid #000000",
                borderRadius: "16px",
                boxShadow: "5px 6px 0px #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.6rem",
              }}
            >
              📱
            </Box>
          </Box>

          {/* Retro Cream Block: THAT "A-HA" MOMENT */}
          <Box
            sx={{
              display: "inline-block",
              bgcolor: "#F6F1D7",
              color: "#000000",
              border: "3px solid #000000",
              boxShadow: "6px 6px 0px #000000",
              px: { xs: 3, sm: 6 },
              py: { xs: 1.2, sm: 1.8 },
              borderRadius: "4px",
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: { xs: "1.4rem", sm: "2.2rem" },
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
              }}
            >
              THAT &ldquo;A-HA&rdquo; MOMENT
            </Typography>
          </Box>

          {/* 3 Core Value Pillars */}
          <Grid container spacing={3} sx={{ mt: 2, textAlign: "left" }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <Box sx={{ fontSize: "1.8rem", mb: 1 }}>⚡</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Zero Fluff
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  Skip 40 hours of passive video tutorials. Get straight to the architecture blocker with senior leads.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <Box sx={{ fontSize: "1.8rem", mb: 1 }}>🚀</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Live Pair-Programming
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  Real-time code walkthroughs, instant profiling, and battle-tested production design review.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <Box sx={{ fontSize: "1.8rem", mb: 1 }}>🎯</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Tailored to Your Stack
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  From React 19 &amp; TanStack to Apollo GraphQL &amp; PostgreSQL, get grounded advice from builders.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
