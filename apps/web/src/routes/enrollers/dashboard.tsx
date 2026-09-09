import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SchoolIcon from "@mui/icons-material/School";

import {
  listSubscriptionsForEnrollerFn,
  unsubscribeFn,
} from "#/server/functions/enrollers.fn";
import { EmptyState } from "#/components/ui";
import { ConfirmDialog, AlertDialog } from "#/components/Dialog";
import { FellowsPageSkeleton } from "#/components/skeletons/FellowsPageSkeleton";
import { CreditProgressBar } from "#/components/CreditProgressBar";

export const Route = createFileRoute("/enrollers/dashboard")({
  pendingComponent: FellowsPageSkeleton,
  loader: async () => {
    const subs = await listSubscriptionsForEnrollerFn().catch(() => []);
    return { subs: subs ?? [] };
  },
  component: EnrollerDashboard,
});

function EnrollerDashboard() {
  const { subs } = Route.useLoaderData();
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [unsubTarget, setUnsubTarget] = useState<{
    enrollerId: number;
    eventTypeId: number;
    subId: number;
    title: string;
  } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "info" | "success" | "error";
  }>({ isOpen: false, message: "" });

  async function confirmUnsubscribe() {
    if (!unsubTarget) return;
    setBusyId(unsubTarget.subId);
    try {
      await unsubscribeFn({
        data: {
          enrollerId: unsubTarget.enrollerId,
          eventTypeId: unsubTarget.eventTypeId,
        },
      });
      setUnsubTarget(null);
      await router.invalidate();
    } catch (err) {
      setUnsubTarget(null);
      setAlertDialog({
        isOpen: true,
        title: "Unsubscribe Failed",
        message: err instanceof Error ? err.message : "Failed to unsubscribe.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Link to="/enrollers" style={{ textDecoration: "none" }}>
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: "text.secondary", fontWeight: 700 }}
            >
              Back to Fellows Portal
            </Button>
          </Link>
        </Box>

        {/* Fellow Credit Status & Progress */}
        <CreditProgressBar />

        <Card
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
            borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "#FF3E00",
              fontFamily: "'Fira Code', monospace",
              display: "block",
              mb: 0.5,
            }}
          >
            // NOTIFICATIONS_DISPATCH
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.01em" }}>
            YOUR SUBSCRIPTIONS &amp; ALERTS ({subs.length})
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            You receive instant notifications when mentors open new available office hours for these tracks.
          </Typography>
        </Card>

        {subs.length === 0 ? (
          <EmptyState
            title="No active subscriptions yet"
            description="Browse mentors and subscribe to tracks to be first in line when new office hours drop."
            action={
              <Link to="/enrollers" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  sx={{
                    mt: 2,
                    background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                    fontWeight: 800,
                  }}
                >
                  Browse Mentors
                </Button>
              </Link>
            }
          />
        ) : (
          <Stack spacing={2}>
            {subs.map((s) => (
              <Card
                key={s.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(255, 62, 0, 0.1)",
                      color: "#FF3E00",
                      border: "1px solid rgba(255, 62, 0, 0.25)",
                    }}
                  >
                    <NotificationsActiveIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {s.eventType?.title}
                    </Typography>
                    {s.eventType?.description ? (
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.2 }}>
                        {s.eventType.description}
                      </Typography>
                    ) : null}
                    <Chip
                      size="small"
                      color="success"
                      variant="outlined"
                      label="ACTIVE ALERTS"
                      sx={{ fontWeight: 800, fontSize: "0.65rem", mt: 1, height: 22 }}
                    />
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={busyId === s.id}
                  onClick={() =>
                    setUnsubTarget({
                      enrollerId: s.enrollerId,
                      eventTypeId: s.eventTypeId,
                      subId: s.id,
                      title: s.eventType?.title ?? "Slot Alert",
                    })
                  }
                  startIcon={<NotificationsOffIcon fontSize="small" />}
                  sx={{
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Unsubscribe
                </Button>
              </Card>
            ))}
          </Stack>
        )}

        <ConfirmDialog
          isOpen={unsubTarget !== null}
          title="Cancel Slot Alerts?"
          description={`Are you sure you want to stop receiving notifications for "${unsubTarget?.title}"?`}
          confirmText="Unsubscribe"
          cancelText="Keep Alerts"
          variant="danger"
          busy={busyId !== null}
          onConfirm={confirmUnsubscribe}
          onClose={() => {
            if (!busyId) setUnsubTarget(null);
          }}
        />

        <AlertDialog
          isOpen={alertDialog.isOpen}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          onClose={() => setAlertDialog({ isOpen: false, message: "" })}
        />
      </Stack>
    </Container>
  );
}
