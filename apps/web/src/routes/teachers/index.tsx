import { createFileRoute, Link } from "@tanstack/react-router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import AddIcon from "@mui/icons-material/Add";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { getSessionFn } from "../../server/functions/auth.fn";
import { listEventTypesFn } from "../../server/functions/eventTypes.fn";
import { listSlotRequestsForTeacherFn } from "../../server/functions/enrollers.fn";
import { listUsers } from "../../server/functions/users.fn";
import { formatDuration } from "../../lib/format";
import { StudioDashboardSkeleton } from "../../components/skeletons/StudioDashboardSkeleton";

export const Route = createFileRoute("/teachers/")({
  pendingComponent: StudioDashboardSkeleton,
  loader: async () => {
    const session = await getSessionFn().catch(() => null);
    const allUsers = await listUsers();
    const currentHost = allUsers[0] ?? null;
    const [eventTypes, requests] = currentHost
      ? await Promise.all([
          listEventTypesFn({ data: currentHost.id }),
          listSlotRequestsForTeacherFn({ data: currentHost.id }),
        ])
      : [[], []];

    return {
      session,
      currentHost,
      eventTypes: eventTypes ?? [],
      requests: requests ?? [],
    };
  },
  component: TeachersAdmin,
});

function TeachersAdmin() {
  const { session, currentHost, eventTypes, requests } = Route.useLoaderData();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={4}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
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
              // COHORT_LEAD_STUDIO
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
              WELCOME, {session?.name ?? currentHost?.name ?? "COHORT LEAD"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Manage your office hours schedule, view fellow slot requests, and customize session tracks.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
            {currentHost ? (
              <Link
                to="/users/$userId"
                params={{ userId: String(currentHost.id) }}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  sx={{
                    fontWeight: 800,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                    color: "#FFFFFF",
                  }}
                >
                  Open Lead Studio
                </Button>
              </Link>
            ) : null}
            <Link to="/teachers/requests" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                startIcon={<MessageOutlinedIcon />}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: "divider",
                }}
              >
                Custom Requests ({requests.length})
              </Button>
            </Link>
          </Stack>
        </Box>

        {currentHost && (
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
              borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Active Host: {currentHost.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontFamily: "'Fira Code', monospace",
                  fontSize: "0.75rem",
                }}
              >
                /{currentHost.slug} · {currentHost.timezone} · {currentHost.email}
              </Typography>
            </Box>

            <Link
              to="/users/$userId/event-types/new"
              params={{ userId: String(currentHost.id) }}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                }}
              >
                New Session Track
              </Button>
            </Link>
          </Card>
        )}

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Configured Session Tracks ({eventTypes.length})
            </Typography>
            {currentHost && (
              <Link
                to="/users/$userId/event-types"
                params={{ userId: String(currentHost.id) }}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="text"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 700, color: "#FF3E00" }}
                >
                  View all tracks
                </Button>
              </Link>
            )}
          </Box>

          {eventTypes.length === 0 ? (
            <Card variant="outlined" sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
              <LayersOutlinedIcon sx={{ fontSize: 36, color: "#FF3E00", mb: 1, opacity: 0.8 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                No Session Tracks Created
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Add your first 1:1 office hours track to let students book time.
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={2}>
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
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
                          {et.title}
                        </Typography>
                        <Chip
                          size="small"
                          color={et.isActive ? "success" : "default"}
                          variant="outlined"
                          label={et.isActive ? "ACTIVE" : "HIDDEN"}
                          sx={{ fontWeight: 800, fontSize: "0.65rem", height: 20 }}
                        />
                      </Box>
                      {et.description ? (
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                          {et.description}
                        </Typography>
                      ) : null}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid",
                        borderColor: "divider",
                        pt: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontFamily: "'Fira Code', monospace",
                          color: "text.secondary",
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 13, color: "#FF3E00" }} /> {formatDuration(et.durationMinutes)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Fira Code', monospace" }}>
                        {et.locationType === "online" ? "Google Meet" : "In person"}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
