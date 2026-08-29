import { createFileRoute, Link } from "@tanstack/react-router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";

import { listSlotRequestsForTeacherFn } from "#/server/functions/enrollers.fn";
import { EmptyState } from "#/components/ui";
import { RequestsPageSkeleton } from "#/components/skeletons/RequestsPageSkeleton";

export const Route = createFileRoute("/teachers/requests")({
  pendingComponent: RequestsPageSkeleton,
  loader: async () => {
    const requests = await listSlotRequestsForTeacherFn().catch(() => []);
    return { requests: requests ?? [] };
  },
  component: RequestsPage,
});

function RequestsPage() {
  const { requests } = Route.useLoaderData();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Link to="/teachers" style={{ textDecoration: "none" }}>
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: "text.secondary", fontWeight: 700 }}
            >
              Back to Lead Dashboard
            </Button>
          </Link>
        </Box>

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
            // INCOMING_REQUESTS
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.01em" }}>
            Custom Slot Requests ({requests.length})
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Requests from fellows looking for meeting times outside your existing published hours.
          </Typography>
        </Card>

        {requests.length === 0 ? (
          <EmptyState
            title="No slot requests pending"
            description="When students request new slots for your courses or tracks, they will appear here."
          />
        ) : (
          <Stack spacing={2}>
            {requests.map((r) => (
              <Card
                key={r.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(246, 241, 215, 0.1)" : "#DDE2E7"),
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 16, color: "#FF3E00" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {r.enroller?.name ?? "Student"}
                    </Typography>
                    {r.enroller?.email ? (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontFamily: "'Fira Code', monospace",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 12 }} /> {r.enroller.email}
                      </Typography>
                    ) : null}
                  </Box>
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={r.eventType?.title}
                    sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                  />
                </Box>

                {r.message ? (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)"),
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: "'Fira Code', monospace", color: "text.secondary" }}>
                      &ldquo;{r.message}&rdquo;
                    </Typography>
                  </Box>
                ) : null}
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
