import { useState } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import {
  deleteEventTypeFn,
  updateEventTypeFn,
} from "../../../../server/functions/eventTypes.fn";
import { EmptyState } from "../../../../components/ui";
import { ConfirmDialog } from "../../../../components/Dialog";
import { formatDuration } from "../../../../lib/format";
import { StudioDashboardSkeleton } from "../../../../components/skeletons/StudioDashboardSkeleton";
import { eventTypesQueryOptions, queryKeys } from "../../../../lib/queries";

export const Route = createFileRoute("/users/$userId/event-types/")({
  pendingComponent: StudioDashboardSkeleton,
  loader: async ({ params, context: { queryClient } }) => {
    const hostId = Number(params.userId);
    return queryClient.ensureQueryData(eventTypesQueryOptions(hostId));
  },
  component: HostEventTypesPage,
});

function HostEventTypesPage() {
  const { userId } = Route.useParams();
  const hostId = Number(userId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: eventTypes } = useSuspenseQuery(eventTypesQueryOptions(hostId));

  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEventTypeFn({ data: { hostId, id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes.byHost(hostId) });
      setDeleteTarget(null);
      router.invalidate();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to delete track");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (variables: { id: number; isActive: boolean }) =>
      updateEventTypeFn({
        data: {
          hostId,
          id: variables.id,
          body: { isActive: variables.isActive },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes.byHost(hostId) });
      router.invalidate();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to toggle track");
    },
  });

  async function confirmDeleteEventType() {
    if (!deleteTarget) return;
    setError(null);
    setBusyId(deleteTarget.id);
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setBusyId(null),
    });
  }

  async function handleToggleActive(id: number, currentActive: boolean) {
    setError(null);
    setBusyId(id);
    toggleActiveMutation.mutate(
      { id, isActive: !currentActive },
      {
        onSettled: () => setBusyId(null),
      },
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3.5}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
              Session Tracks ({eventTypes.length})
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Configure different types of 1:1 sessions, sprint reviews, and office hours you offer to fellows.
            </Typography>
          </Box>

          <Link
            to="/users/$userId/event-types/new"
            params={{ userId }}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                color: "#FFFFFF",
                px: 2.5,
              }}
            >
              New Session Track
            </Button>
          </Link>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: 2.5 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        {eventTypes.length === 0 ? (
          <EmptyState
            title="No session tracks created"
            description="Create your first session track to start offering bookable office hours to fellows."
            action={
              <Link
                to="/users/$userId/event-types/new"
                params={{ userId }}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 2,
                    background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                    fontWeight: 800,
                  }}
                >
                  Create Session Track
                </Button>
              </Link>
            }
          />
        ) : (
          <Grid container spacing={2.5}>
            {eventTypes.map((et) => (
              <Grid key={et.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    gap: 2,
                    bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                    borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#FF3E00",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {et.title}
                      </Typography>
                      <Chip
                        clickable
                        onClick={() => handleToggleActive(et.id, et.isActive)}
                        size="small"
                        color={et.isActive ? "success" : "default"}
                        variant="outlined"
                        label={et.isActive ? "Active" : "Draft"}
                        sx={{ fontWeight: 800, fontSize: "0.65rem", height: 22 }}
                      />
                    </Box>

                    {et.description ? (
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem", lineClamp: 2, mb: 1.5 }}>
                        {et.description}
                      </Typography>
                    ) : null}

                    <Stack spacing={0.8} sx={{ color: "text.secondary", fontSize: "0.75rem", fontFamily: "'Fira Code', monospace" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: "#FF3E00" }} />
                        <span>{formatDuration(et.durationMinutes)}</span>
                        {et.bufferBeforeMinutes > 0 || et.bufferAfterMinutes > 0 ? (
                          <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                            (+{et.bufferBeforeMinutes}m / +{et.bufferAfterMinutes}m buffers)
                          </span>
                        ) : null}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        {et.locationType === "online" ? (
                          <VideoCameraFrontIcon sx={{ fontSize: 14, color: "primary.main" }} />
                        ) : (
                          <PlaceOutlinedIcon sx={{ fontSize: 14, color: "primary.main" }} />
                        )}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {et.locationValue ?? (et.locationType === "online" ? "Google Meet Link" : "In person")}
                        </span>
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.8 }}>
                        Slug: /{et.slug}
                      </Typography>
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Link
                      to="/users/$userId/event-types/$eventTypeSlug"
                      params={{ userId, eventTypeSlug: et.slug }}
                      style={{ textDecoration: "none", flex: 1 }}
                    >
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<EditIcon fontSize="small" />}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      >
                        Edit
                      </Button>
                    </Link>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={busyId === et.id}
                      onClick={() => setDeleteTarget({ id: et.id, title: et.title })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <ConfirmDialog
          isOpen={deleteTarget !== null}
          title="Delete Session Track?"
          description={`Are you sure you want to delete "${deleteTarget?.title}"? All associated generated slots and history will be removed.`}
          confirmText="Delete Track"
          cancelText="Keep Track"
          variant="danger"
          busy={busyId !== null}
          onConfirm={confirmDeleteEventType}
          onClose={() => {
            if (!busyId) setDeleteTarget(null);
          }}
        />
      </Stack>
    </Container>
  );
}
