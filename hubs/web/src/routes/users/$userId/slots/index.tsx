import { useState } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import RefreshIcon from "@mui/icons-material/Refresh";
import LayersIcon from "@mui/icons-material/Layers";

import { regenerateSlotsFn } from "../../../../server/functions/slots.fn";
import CalendarGrid from "../../../../components/CalendarGrid";
import { StudioDashboardSkeleton } from "../../../../components/skeletons/StudioDashboardSkeleton";
import { eventTypesQueryOptions, queryKeys } from "../../../../lib/queries";

export const Route = createFileRoute("/users/$userId/slots/")({
  pendingComponent: StudioDashboardSkeleton,
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(eventTypesQueryOptions(Number(params.userId)));
  },
  component: HostSlotsPage,
});

function HostSlotsPage() {
  const { userId } = Route.useParams();
  const hostId = Number(userId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: eventTypes } = useSuspenseQuery(eventTypesQueryOptions(hostId));

  const [regenSuccessMsg, setRegenSuccessMsg] = useState<string | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [calendarKey, setCalendarKey] = useState(0);

  const activeEventTypes = eventTypes.filter((et: any) => et.isActive);

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateSlotsFn({ data: hostId }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      const count = Array.isArray(result) ? result.length : 0;
      setRegenSuccessMsg(
        count > 0
          ? `Successfully regenerated ${count} bookable slots across ${activeEventTypes.length} active session track(s)!`
          : "Slots regenerated! Note: Slots are generated for upcoming weekdays based on your availability rules and active session tracks."
      );
      setCalendarKey((k) => k + 1);
      router.invalidate();
    },
    onError: (err) => {
      setRegenError(err instanceof Error ? err.message : "Failed to regenerate slots");
    },
  });

  const regenerating = regenerateMutation.isPending;

  function handleRegenerate() {
    setRegenSuccessMsg(null);
    setRegenError(null);
    regenerateMutation.mutate();
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
              Generated Time Slots
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              View generated booking slots or click and drag on the calendar to manually create a slot.
            </Typography>
          </Box>

          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            variant="contained"
            startIcon={regenerating ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
              color: "#FFFFFF",
              px: 2.5,
            }}
          >
            {regenerating ? "Regenerating Slots…" : "Regenerate Next 30 Days"}
          </Button>
        </Box>

        {activeEventTypes.length === 0 ? (
          <Alert
            severity="warning"
            action={
              <Link
                to="/users/$userId/event-types"
                params={{ userId: String(hostId) }}
                style={{ textDecoration: "none" }}
              >
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<LayersIcon fontSize="small" />}
                  sx={{ fontWeight: 800 }}
                >
                  Manage Tracks
                </Button>
              </Link>
            }
            sx={{ borderRadius: 2.5 }}
          >
            You do not have any active Session Tracks. Slots can only be generated for active event tracks.
          </Alert>
        ) : null}

        {regenSuccessMsg ? (
          <Alert severity="success" sx={{ borderRadius: 2.5 }} onClose={() => setRegenSuccessMsg(null)}>
            {regenSuccessMsg}
          </Alert>
        ) : null}

        {regenError ? (
          <Alert severity="error" sx={{ borderRadius: 2.5 }} onClose={() => setRegenError(null)}>
            {regenError}
          </Alert>
        ) : null}

        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
            borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
          }}
        >
          <CalendarGrid
            key={calendarKey}
            userId={hostId}
            onSlotCreated={() => router.invalidate()}
          />
        </Card>
      </Stack>
    </Container>
  );
}
