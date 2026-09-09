import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { createEventTypeFn } from "../../../../server/functions/eventTypes.fn";
import type { CreateEventTypeDto } from "../../../../dtos/event-type.dto";
import EventTypeForm, {
  type EventTypeFormValues,
} from "../../../../components/EventTypeForm";

export const Route = createFileRoute("/users/$userId/event-types/new")({
  component: NewEventTypePage,
});

const DEFAULT_VALUES: EventTypeFormValues = {
  title: "",
  description: "",
  durationMinutes: 30,
  locationType: "online",
  locationValue: "",
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  isActive: true,
  slug: "",
};

function NewEventTypePage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const hostId = Number(userId);

  async function handleSubmit(values: CreateEventTypeDto): Promise<string | null> {
    setBusy(true);
    try {
      await createEventTypeFn({
        data: {
          hostId,
          body: values,
        },
      });
      navigate({
        to: "/users/$userId/event-types",
        params: { userId },
      });
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Failed to create event type";
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Box>
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
              New Event Type
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Set up the details for your new bookable meeting track.
            </Typography>
          </Box>

          <EventTypeForm
            initial={DEFAULT_VALUES}
            submitLabel="Create Event Type"
            onSubmit={handleSubmit}
            busy={busy}
          />
        </Card>
      </Stack>
    </Container>
  );
}
