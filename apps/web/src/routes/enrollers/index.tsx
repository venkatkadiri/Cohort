import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

import { initials } from "../../lib/format";
import { FellowsPageSkeleton } from "../../components/skeletons/FellowsPageSkeleton";
import { usersQueryOptions } from "../../lib/queries";

export const Route = createFileRoute("/enrollers/")({
  pendingComponent: FellowsPageSkeleton,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(usersQueryOptions());
  },
  component: EnrollersPage,
});

function EnrollersPage() {
  const { data: hosts } = useSuspenseQuery(usersQueryOptions());

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
              // FELLOWS_PORTAL
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
              Cohort Fellow Center
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Browse cohort mentors, manage slot notifications, and track your booked office hours.
            </Typography>
          </Box>

          <Link to="/enrollers/dashboard" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              startIcon={<NotificationsActiveIcon />}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                color: "#FFFFFF",
                px: 2.5,
              }}
            >
              My Subscriptions
            </Button>
          </Link>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Available Mentors ({hosts.length})
          </Typography>

          <Grid container spacing={2}>
            {hosts.map((host) => (
              <Grid key={host.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                      }}
                    >
                      {initials(host.name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800 }}>
                        {host.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontFamily: "'Fira Code', monospace",
                          fontSize: "0.72rem",
                        }}
                      >
                        /{host.slug} · {host._count?.eventTypes ?? 0} tracks
                      </Typography>
                    </Box>
                  </Box>

                  <Link
                    to="/public/$userId"
                    params={{ userId: String(host.id) }}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      startIcon={<BookOnlineIcon fontSize="small" />}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        borderColor: "divider",
                        "&:hover": {
                          borderColor: "#FF3E00",
                          color: "#FF3E00",
                        },
                      }}
                    >
                      View Office Hours
                    </Button>
                  </Link>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
}
