import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";

import BlockIcon from "@mui/icons-material/Block";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideoCallIcon from "@mui/icons-material/VideoCall";

import {
  cancelBookingFn,
} from "../../../../server/functions/bookings.fn";
import { EmptyState } from "../../../../components/ui";
import { ConfirmDialog } from "../../../../components/Dialog";
import { formatDateTime } from "../../../../lib/format";
import { StudioDashboardSkeleton } from "../../../../components/skeletons/StudioDashboardSkeleton";
import { bookingsQueryOptions, queryKeys } from "../../../../lib/queries";

export const Route = createFileRoute("/users/$userId/bookings/")({
  pendingComponent: StudioDashboardSkeleton,
  loader: async ({ params, context: { queryClient } }) => {
    const hostId = Number(params.userId);
    return queryClient.ensureQueryData(bookingsQueryOptions(hostId));
  },
  component: HostBookingsPage,
});

function HostBookingsPage() {
  const { userId } = Route.useParams();
  const hostId = Number(userId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: bookings } = useSuspenseQuery(bookingsQueryOptions(hostId));

  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (bookingId: number) =>
      cancelBookingFn({
        data: {
          hostId,
          bookingId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.byHost(hostId) });
      setCancellingBookingId(null);
      router.invalidate();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    },
  });

  const busyId = cancelMutation.isPending ? cancellingBookingId : null;

  async function confirmCancelBooking() {
    if (!cancellingBookingId) return;
    setError(null);
    cancelMutation.mutate(cancellingBookingId);
  }

  const sortedBookings = [...bookings].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3.5}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            Scheduled Bookings ({bookings.length})
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Manage all confirmed and upcoming office hours booked by cohort fellows.
          </Typography>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: 2.5 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings recorded"
            description="When fellows book office hours through your public page, they will appear here."
          />
        ) : (
          <Stack spacing={2}>
            {sortedBookings.map((b) => (
              <Card
                key={b.id}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                  gap: 2.5,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
                }}
              >
                <Stack spacing={1.5} sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {b.eventType?.title ?? "Meeting"}
                    </Typography>
                    <Chip
                      size="small"
                      color={
                        b.status === "CANCELLED"
                          ? "error"
                          : b.status === "CONFIRMED"
                            ? "success"
                            : "info"
                      }
                      variant="outlined"
                      label={b.status}
                      sx={{ fontWeight: 800, fontSize: "0.65rem", height: 22 }}
                    />
                  </Box>

                  <Stack direction="row" spacing={2.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <PersonIcon sx={{ fontSize: 16, color: "#FF3E00" }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {b.inviteeName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ color: "text.secondary", fontFamily: "'Fira Code', monospace", fontSize: "0.8rem" }}>
                        {b.inviteeEmail}
                      </Typography>
                    </Box>
                    {b.slot ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: "#FF3E00" }} />
                        <Typography variant="body2" sx={{ color: "#FF3E00", fontWeight: 700, fontFamily: "'Fira Code', monospace", fontSize: "0.8rem" }}>
                          {formatDateTime(b.slot.startAt)} &ndash; {formatDateTime(b.slot.endAt)}
                        </Typography>
                      </Box>
                    ) : null}
                  </Stack>

                  {b.inviteeNotes ? (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.03)"),
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        <strong>Agenda:</strong> {b.inviteeNotes}
                      </Typography>
                    </Box>
                  ) : null}

                  {b.meetLink && b.status !== "CANCELLED" ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <VideoCallIcon sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography
                        component="a"
                        href={b.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        variant="caption"
                        sx={{ color: "primary.main", fontWeight: 700, textDecoration: "underline" }}
                      >
                        {b.meetLink}
                      </Typography>
                    </Box>
                  ) : null}
                </Stack>

                {b.status !== "CANCELLED" ? (
                  <Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={busyId === b.id}
                      onClick={() => setCancellingBookingId(b.id)}
                      startIcon={<BlockIcon fontSize="small" />}
                      sx={{ fontWeight: 800, borderRadius: 2 }}
                    >
                      Cancel Booking
                    </Button>
                  </Box>
                ) : null}
              </Card>
            ))}
          </Stack>
        )}

        <ConfirmDialog
          isOpen={cancellingBookingId !== null}
          title="Cancel This Booking?"
          description="Are you sure you want to cancel this scheduled session? The time slot will be reopened or freed for other fellows."
          confirmText="Yes, Cancel Booking"
          cancelText="Keep Booking"
          variant="danger"
          busy={busyId !== null}
          onConfirm={confirmCancelBooking}
          onClose={() => {
            if (!busyId) setCancellingBookingId(null);
          }}
        />
      </Stack>
    </Container>
  );
}
