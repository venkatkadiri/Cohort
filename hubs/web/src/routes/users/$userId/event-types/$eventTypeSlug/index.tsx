import { useState } from "react";
import { createFileRoute, notFound, useNavigate, useRouter, Link } from "@tanstack/react-router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LaunchIcon from "@mui/icons-material/Launch";

import {
  getEventTypeForHostBySlugFn,
  updateEventTypeFn,
} from "../../../../../server/functions/eventTypes.fn";
import type { CreateEventTypeDto } from "../../../../../dtos/event-type.dto";
import EventTypeForm, {
  toFormValues,
} from "../../../../../components/EventTypeForm";
import { StudioDashboardSkeleton } from "../../../../../components/skeletons/StudioDashboardSkeleton";

export const Route = createFileRoute(
  "/users/$userId/event-types/$eventTypeSlug/",
)({
  pendingComponent: StudioDashboardSkeleton,
  loader: async ({ params }) => {
    const hostId = Number(params.userId);
    const eventType = await getEventTypeForHostBySlugFn({
      data: { hostId, slug: params.eventTypeSlug },
    }).catch(() => null);
    if (!eventType) throw notFound();
    return { eventType };
  },
  component: EditEventTypePage,
});

function EditEventTypePage() {
  const { eventType } = Route.useLoaderData();
  const { userId } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const hostId = Number(userId);

  async function handleSubmit(values: CreateEventTypeDto): Promise<string | null> {
    setBusy(true);
    setSuccess(false);
    try {
      const updated = await updateEventTypeFn({
        data: {
          hostId,
          id: eventType.id,
          body: values,
        },
      });
      setSuccess(true);
      await router.invalidate();
      if (updated.slug !== eventType.slug) {
        navigate({
          to: "/users/$userId/event-types/$eventTypeSlug",
          params: { userId, eventTypeSlug: updated.slug },
          replace: true,
        });
      }
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Failed to update event type";
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            to="/users/$userId/event-types"
            params={{ userId }}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: "text.secondary", fontWeight: 700 }}
            >
              Back to Event Types
            </Button>
          </Link>

          <Link
            to="/public/$userId/event-types/$eventTypeSlug"
            params={{ userId, eventTypeSlug: eventType.slug }}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="outlined"
              size="small"
              endIcon={<LaunchIcon fontSize="small" />}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              View Public Page
            </Button>
          </Link>
        </Box>

        <Card
          variant="outlined"
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
            borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.01em" }}>
              Edit Event Type
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Updating &ldquo;{eventType.title}&rdquo; (/{eventType.slug})
            </Typography>
          </Box>

          {success ? (
            <Alert severity="success" sx={{ borderRadius: 2.5, mb: 3 }} onClose={() => setSuccess(false)}>
              Changes saved successfully!
            </Alert>
          ) : null}

          <EventTypeForm
            key={eventType.id}
            initial={toFormValues(eventType as unknown as Record<string, unknown>)}
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
            busy={busy}
          />
        </Card>
      </Stack>
    </Container>
  );
}
