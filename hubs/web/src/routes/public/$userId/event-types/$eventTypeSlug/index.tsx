import { useEffect, useMemo, useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { DateTime } from "luxon";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import { getPublicEventTypeFn } from "#/server/functions/eventTypes.fn";
import { createBookingFn } from "#/server/functions/bookings.fn";
import { getAvailableSlotsFn } from "#/server/functions/slots.fn";
import {
  EthicalPrivacyNotice,
  FormError,
  ProgressBar,
  Badge,
} from "#/components/ui";
import { AlertDialog } from "#/components/Dialog";
import {
  createEnrollerFn,
  subscribeFn,
  createSlotRequestFn,
} from "#/server/functions/enrollers.fn";
import { createBookingSchema } from "#/dtos/booking.dto";
import { formatDateTime, formatDuration, initials } from "#/lib/format";
import { BookingPageSkeleton } from "#/components/skeletons/BookingPageSkeleton";
import { CyberSkeleton } from "#/components/skeletons/CyberSkeleton";

export const Route = createFileRoute(
  "/public/$userId/event-types/$eventTypeSlug/",
)({
  pendingComponent: BookingPageSkeleton,
  loader: async ({ params }) => {
    const data = await getPublicEventTypeFn({
      data: { hostId: Number(params.userId), slug: params.eventTypeSlug },
    }).catch(() => null);
    if (!data) throw notFound();
    return data;
  },
  component: BookingPage,
});

type AvailableSlot = Awaited<ReturnType<typeof getAvailableSlotsFn>>[number];

const DAYS_TO_SHOW = 14;

import { useLoading } from "#/context";

export default function BookingPage() {
  const loaded = Route.useLoaderData();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // flow state
  const [viewMonth, setViewMonth] = useState(() =>
    DateTime.now().startOf("month"),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    DateTime.now().toISODate(),
  );
  const [daySlots, setDaySlots] = useState<AvailableSlot[] | null>(null);
  const slotsLoading = isLoading("slots");
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Invitee details
  const [pronouns, setPronouns] = useState("they/them");
  const [comfortPreference, setComfortPreference] = useState("Camera optional");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [meetCopied, setMeetCopied] = useState(false);
  const [confirmed, setConfirmed] = useState<Awaited<
    ReturnType<typeof createBookingFn>
  > | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "info" | "success" | "error";
  }>({ isOpen: false, message: "" });

  const timezone = loaded.host.timezone ?? "UTC";

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    startLoading("slots");
    setDaySlots(null);
    setSelectedSlot(null);

    getAvailableSlotsFn({
      data: { eventTypeId: loaded.eventType.id, date: selectedDate },
    })
      .then((slots) => {
        if (!cancelled) setDaySlots(slots);
      })
      .catch(() => {
        if (!cancelled) setDaySlots([]);
      })
      .finally(() => {
        if (!cancelled) stopLoading("slots");
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, loaded, startLoading, stopLoading]);

  // calendar days
  const calendarDays = useMemo(() => {
    const start = viewMonth.startOf("month");
    const lead = start.weekday % 7;
    const cells: Array<{ date: DateTime; inMonth: boolean; enabled: boolean }> =
      [];
    for (let i = 0; i < lead; i++) {
      const date = start.minus({ days: lead - i });
      cells.push({ date, inMonth: false, enabled: false });
    }
    for (let day = 0; day < viewMonth.daysInMonth; day++) {
      const date = start.plus({ days: day });
      const fromToday = Math.floor(
        date.diff(DateTime.now().startOf("day"), "days").days,
      );
      cells.push({
        date,
        inMonth: true,
        enabled: fromToday >= 0 && fromToday < DAYS_TO_SHOW,
      });
    }
    return cells;
  }, [viewMonth]);

  const selectedSlotsOfToday = daySlots ?? [];

  function applyAiSmartMatch(preference: "morning" | "afternoon" | "earliest") {
    if (!selectedSlotsOfToday || selectedSlotsOfToday.length === 0) return;
    if (preference === "earliest") {
      setSelectedSlot(selectedSlotsOfToday[0]);
      return;
    }
    const matching = selectedSlotsOfToday.find((s) => {
      const hour = DateTime.fromISO(s.startAt).setZone(timezone).hour;
      return preference === "morning" ? hour < 12 : hour >= 12;
    });
    if (matching) {
      setSelectedSlot(matching);
    } else {
      setSelectedSlot(selectedSlotsOfToday[0]);
    }
  }

  function generateAiAgenda() {
    setNotes(
      `1. Tech stack & architecture review\n2. Key bottlenecks in ${loaded.eventType.title}\n3. Action items & next milestones`,
    );
  }

  async function handleConfirm() {
    setFormError(null);

    const formattedNotes = [
      notes,
      `[Pronouns: ${pronouns} | Mode: ${comfortPreference}]`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const parsed = createBookingSchema.safeParse({
      eventTypeId: loaded.eventType.id,
      slotId: selectedSlot!.id,
      inviteeName: name,
      inviteeEmail: email,
      inviteeNotes: formattedNotes || undefined,
    });
    if (!parsed.success) {
      setFormError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
      return;
    }

    setBookingBusy(true);
    try {
      const booking = await createBookingFn({ data: parsed.data });
      setConfirmed(booking);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong, please try again",
      );
    } finally {
      setBookingBusy(false);
    }
  }

  // Step 3: Confirmed View
  if (confirmed) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
        <Card
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#181F2A' : '#FFFFFF',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 62, 0, 0.4)' : '#DDE2E7',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(255, 62, 0, 0.2)'
                : '0 8px 30px rgba(14, 18, 23, 0.08)',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 6px 20px rgba(255, 62, 0, 0.4)',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 34 }} />
          </Box>

          <Badge tone="flame">SESSION CONFIRMED</Badge>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem' }, fontWeight: 900, mt: 1, mb: 1, letterSpacing: '-0.02em' }}>
            YOU&apos;RE ON THE SCHEDULE!
          </Typography>

          <Card
            variant="outlined"
            sx={{
              p: 2.5,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0E1217' : '#F4F6F8',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.08)' : '#DDE2E7',
              borderRadius: 3,
              textAlign: 'left',
              my: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
              {loaded.eventType.title} with {loaded.host.name}
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.82rem', mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: '#FF3E00' }} />
              {formatDateTime(confirmed.slot.startAt, timezone)} &ndash; {formatDateTime(confirmed.slot.endAt, timezone)} ({timezone})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Calendar invite and Google Meet link sent to <strong>{email}</strong>
            </Typography>
          </Card>

          {confirmed.meetLink ? (
            <Card
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0E1217' : '#F4F6F8',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.08)' : '#DDE2E7',
                mb: 3,
                textAlign: 'left',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
                Meeting Room Link
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: "'Fira Code', monospace", fontWeight: 800, color: '#FF3E00' }} noWrap>
                  {confirmed.meetLink}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    navigator.clipboard?.writeText(confirmed.meetLink || "");
                    setMeetCopied(true);
                    setTimeout(() => setMeetCopied(false), 2000);
                  }}
                  startIcon={meetCopied ? <CheckIcon color="success" /> : <ContentCopyIcon sx={{ color: '#FF3E00' }} />}
                  sx={{ fontSize: '0.72rem' }}
                >
                  {meetCopied ? "Copied" : "Copy"}
                </Button>
              </Box>
            </Card>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Link
              to="/public/$userId"
              params={{ userId: String(loaded.host.id) }}
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <Button
                variant="outlined"
                fullWidth
              >
                Back to {loaded.host.name}&apos;s profile
              </Button>
            </Link>
            <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
              <Button variant="text" fullWidth color="inherit">
                Cohort Hub
              </Button>
            </Link>
          </Stack>
        </Card>
      </Container>
    );
  }

  const currentStep = !selectedSlot ? 1 : 2;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={3} />

      <Grid container spacing={2.5}>
        {/* Left Column: Event Type & Host Info */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <Link
              to="/public/$userId"
              params={{ userId: String(loaded.host.id) }}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
                sx={{ color: "text.secondary", pl: 0, fontWeight: 700, fontSize: '0.74rem' }}
              >
                All tracks by {loaded.host.name}
              </Button>
            </Link>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(255, 62, 0, 0.35)',
                }}
              >
                {initials(loaded.host.name)}
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.66rem' }}>
                  // MENTOR: {loaded.host.name}
                </Typography>
                <Typography variant="h5" sx={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1 }}>
                  {loaded.eventType.title}
                </Typography>
              </Box>
            </Box>

            <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              {loaded.eventType.description ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', mb: 1.5, lineHeight: 1.5 }}>
                  {loaded.eventType.description}
                </Typography>
              ) : null}

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, fontWeight: 800, fontFamily: "'Fira Code', monospace", fontSize: '0.72rem' }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: '#FF3E00' }} /> {formatDuration(loaded.eventType.durationMinutes)}
                </Typography>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, fontWeight: 800, fontFamily: "'Fira Code', monospace", fontSize: '0.72rem' }}>
                  {loaded.eventType.locationType === "online" ? (
                    <LanguageIcon sx={{ fontSize: 14, color: '#06B6D4' }} />
                  ) : (
                    <PlaceOutlinedIcon sx={{ fontSize: 14, color: '#06B6D4' }} />
                  )}
                  {loaded.eventType.locationValue ?? (loaded.eventType.locationType === "online" ? "Google Meet Video Call" : "In person")}
                </Typography>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.72rem' }}>
                  <VerifiedUserIcon sx={{ fontSize: 14, color: '#10B981' }} /> Host Timezone: {timezone}
                </Typography>
              </Stack>
            </Card>

            <EthicalPrivacyNotice />
          </Stack>
        </Grid>

        {/* Right Column: Date, Slot Picker & Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            {/* Step 1: Calendar Day Picker */}
            <Box>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1.05rem', fontWeight: 800, color: '#FF3E00', fontFamily: "'Fira Code', monospace" }}>
                1. SELECT DATE &amp; TIME
              </Typography>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <IconButton size="small" onClick={() => setViewMonth((m) => m.minus({ months: 1 }))}>
                    <ArrowBackIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.88rem' }}>
                    {viewMonth.toFormat("MMMM yyyy")}
                  </Typography>
                  <IconButton size="small" onClick={() => setViewMonth((m) => m.plus({ months: 1 }))}>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* Calendar Days */}
                <Grid container spacing={0.6} sx={{ mb: 1.5 }}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <Grid key={i} size={12 / 7}>
                      <Typography variant="caption" align="center" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.68rem' }}>
                        {d}
                      </Typography>
                    </Grid>
                  ))}
                  {calendarDays.map((cell, idx) => {
                    const isSelected = selectedDate === cell.date.toISODate();
                    return (
                      <Grid key={idx} size={12 / 7}>
                        <Button
                          disabled={!cell.enabled}
                          onClick={() => {
                            setSelectedDate(cell.date.toISODate());
                            setSelectedSlot(null);
                          }}
                          variant={isSelected ? "contained" : "text"}
                          color={isSelected ? "primary" : "inherit"}
                          size="small"
                          sx={{
                            minWidth: 0,
                            width: "100%",
                            height: 32,
                            p: 0,
                            borderRadius: 1.5,
                            fontSize: '0.74rem',
                            opacity: cell.enabled ? 1 : 0.3,
                            fontWeight: isSelected ? 900 : 700,
                            background: isSelected
                              ? "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)"
                              : undefined,
                            boxShadow: isSelected
                              ? "0 2px 8px rgba(255, 62, 0, 0.3)"
                              : "none",
                          }}
                        >
                          {cell.date.day}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* AI Smart Slot Quick Buttons */}
                {selectedSlotsOfToday.length > 0 && (
                  <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, fontFamily: "'Fira Code', monospace" }}>
                      <AutoAwesomeIcon sx={{ fontSize: 14, color: '#FF3E00' }} /> Smart Match Time
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => applyAiSmartMatch("earliest")}
                        sx={{ fontSize: '0.72rem' }}
                      >
                        ⚡ Earliest
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => applyAiSmartMatch("morning")}
                        sx={{ fontSize: '0.72rem' }}
                      >
                        ☀️ Morning
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => applyAiSmartMatch("afternoon")}
                        sx={{ fontSize: '0.72rem' }}
                      >
                        🌙 Afternoon
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Card>
            </Box>

            {/* Time Slot Selector */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'Fira Code', monospace", color: 'text.secondary', fontSize: '0.74rem' }}>
                Available Times &middot; {selectedDate ? DateTime.fromISO(selectedDate).setZone(timezone).toFormat("cccc, LLL d") : "Select a date"}
              </Typography>

              <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                {slotsLoading ? (
                  <Grid container spacing={1}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Grid key={i} size={{ xs: 6, sm: 4 }}>
                        <CyberSkeleton width="100%" height={38} borderRadius={1.5} />
                      </Grid>
                    ))}
                  </Grid>
                ) : !selectedDate ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 1.5, fontSize: '0.78rem' }}>
                    Pick a date above to view open slots.
                  </Typography>
                ) : selectedSlotsOfToday.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.8rem' }}>
                      No available times on this date.
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      Try selecting another highlighted date on the calendar.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={1}>
                    {selectedSlotsOfToday.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const timeStr = DateTime.fromISO(slot.startAt).setZone(timezone).toFormat("h:mm a");
                      return (
                        <Grid key={slot.id} size={{ xs: 6, sm: 4 }}>
                          <Button
                            onClick={() => setSelectedSlot(slot)}
                            variant={isSelected ? "contained" : "outlined"}
                            color={isSelected ? "primary" : "inherit"}
                            fullWidth
                            size="small"
                            sx={{
                              py: 0.6,
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              fontFamily: "'Fira Code', monospace",
                              background: isSelected
                                ? 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)'
                                : undefined,
                              borderWidth: isSelected ? 0 : 1,
                              boxShadow: isSelected ? '0 2px 8px rgba(255, 62, 0, 0.3)' : 'none',
                            }}
                          >
                            {timeStr}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Card>
            </Box>

            {/* Step 2: Topic & Booking Form */}
            {selectedSlot && (
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontSize: '1.05rem', fontWeight: 800, color: '#FF3E00', fontFamily: "'Fira Code', monospace" }}>
                    2. SESSION DETAILS
                  </Typography>
                </Box>

                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                  <FormError message={formError} />

                  {/* Slot Summary */}
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1.2,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0E1217' : '#F4F6F8',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(246, 241, 215, 0.08)' : '#DDE2E7',
                      borderRadius: 2,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 0.8,
                    }}
                  >
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, fontWeight: 800, fontFamily: "'Fira Code', monospace", fontSize: '0.74rem' }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: '#FF3E00' }} />
                      {DateTime.fromISO(selectedSlot.startAt).setZone(timezone).toFormat("cccc, MMMM d · h:mm a")}
                    </Typography>
                  </Card>

                  <Stack spacing={1.8}>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Your Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Tan"
                          required
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Pronouns (optional)"
                          value={pronouns}
                          onChange={(e) => setPronouns(e.target.value)}
                          placeholder="they/them"
                          size="small"
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@cohort.dev"
                      required
                      size="small"
                      fullWidth
                    />

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', fontFamily: "'Fira Code', monospace", fontSize: '0.68rem' }}>
                          Agenda &amp; Discussion Topics
                        </Typography>
                        <Button
                          onClick={generateAiAgenda}
                          size="small"
                          color="primary"
                          variant="text"
                          startIcon={<AutoAwesomeIcon sx={{ fontSize: 13 }} />}
                          sx={{ fontSize: '0.68rem', p: 0, color: '#FF3E00', fontWeight: 800 }}
                        >
                          Auto-fill Agenda
                        </Button>
                      </Box>
                      <TextField
                        multiline
                        rows={2.5}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={`What would you like to review with ${loaded.host.name}?`}
                        fullWidth
                        size="small"
                      />
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 0.8, fontFamily: "'Fira Code', monospace", fontSize: '0.68rem' }}>
                        Format Preference
                      </Typography>
                      <Grid container spacing={0.8}>
                        {[
                          { label: "Camera Optional", icon: SentimentSatisfiedOutlinedIcon },
                          { label: "Video Call", icon: VideocamOutlinedIcon },
                          { label: "Audio Only", icon: MicNoneOutlinedIcon },
                        ].map((mode) => (
                          <Grid key={mode.label} size={4}>
                            <Button
                              onClick={() => setComfortPreference(mode.label)}
                              variant={comfortPreference === mode.label ? "contained" : "outlined"}
                              color={comfortPreference === mode.label ? "primary" : "inherit"}
                              fullWidth
                              size="small"
                              startIcon={<mode.icon sx={{ fontSize: 14 }} />}
                              sx={{
                                fontSize: '0.68rem',
                                py: 0.5,
                                background: comfortPreference === mode.label
                                  ? 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)'
                                  : undefined,
                              }}
                            >
                              {mode.label}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    <Button
                      onClick={handleConfirm}
                      disabled={bookingBusy}
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={bookingBusy ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
                        py: 0.8,
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        boxShadow: '0 3px 12px rgba(255, 62, 0, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF5722 0%, #FF1744 100%)',
                          boxShadow: '0 0 20px rgba(255, 62, 0, 0.45)',
                        },
                      }}
                    >
                      {bookingBusy ? "Confirming booking..." : "Confirm & Book Session"}
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            )}

            {/* Waitlist Subscription */}
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 800, mb: 0.5 }}>
                Slot Alerts &amp; Waitlist
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 2 }}>
                Can&apos;t find a good time? Subscribe to get notified whenever new slots open.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={async () => {
                    if (!email) {
                      setAlertDialog({
                        isOpen: true,
                        title: "Email Required",
                        message: "Please enter your email address in the booking form first.",
                        type: "info",
                      });
                      return;
                    }
                    try {
                      const enroller = await createEnrollerFn({
                        data: { name: name || "Fellow", email },
                      });
                      try {
                        window.localStorage.setItem("enrollerId", String(enroller.id));
                      } catch {}
                      await subscribeFn({
                        data: { eventTypeId: loaded.eventType.id },
                      });
                      setAlertDialog({
                        isOpen: true,
                        title: "Slot Alerts Active",
                        message: "Subscribed! We will notify you when new mentor office hours drop.",
                        type: "success",
                      });
                    } catch (err) {
                      setAlertDialog({
                        isOpen: true,
                        title: "Subscription Failed",
                        message: err instanceof Error ? err.message : "Failed to subscribe to alerts.",
                        type: "error",
                      });
                    }
                  }}
                >
                  🔔 Subscribe for new slots
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  onClick={async () => {
                    if (!email) {
                      setAlertDialog({
                        isOpen: true,
                        title: "Email Required",
                        message: "Please enter your email address in the booking form first.",
                        type: "info",
                      });
                      return;
                    }
                    try {
                      const enroller = await createEnrollerFn({
                        data: { name: name || "Fellow", email },
                      });
                      try {
                        window.localStorage.setItem("enrollerId", String(enroller.id));
                      } catch {}
                      await createSlotRequestFn({
                        data: {
                          eventTypeId: loaded.eventType.id,
                          message: notes || "Requested custom time",
                        },
                      });
                      setAlertDialog({
                        isOpen: true,
                        title: "Request Submitted",
                        message: "Request sent to mentor! They will review your notes and availability.",
                        type: "success",
                      });
                    } catch (err) {
                      setAlertDialog({
                        isOpen: true,
                        title: "Request Failed",
                        message: err instanceof Error ? err.message : "Failed to submit time request.",
                        type: "error",
                      });
                    }
                  }}
                >
                  📨 Request custom time
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({ isOpen: false, message: "" })}
      />
    </Container>
  );
}
