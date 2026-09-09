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
import Chip from "@mui/material/Chip";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from "@mui/icons-material/Add";
import LaunchIcon from "@mui/icons-material/Launch";
import SettingsIcon from "@mui/icons-material/Settings";

import { EmptyState } from "../../components/ui";
import { initials } from "../../lib/format";
import { CatalogPageSkeleton } from "../../components/skeletons/CatalogPageSkeleton";
import { usersQueryOptions } from "../../lib/queries";

export const Route = createFileRoute("/users/")({
  pendingComponent: CatalogPageSkeleton,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(usersQueryOptions());
  },
  component: UsersIndexPage,
});

function UsersIndexPage() {
  const { data: users } = useSuspenseQuery(usersQueryOptions());

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            Hosts Directory
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Select a host to manage their event types, availability, slots, and bookings.
          </Typography>
        </Box>

        <Link to="/" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
              color: "#FFFFFF",
              borderRadius: 2,
              px: 2.5,
            }}
          >
            Create New Host
          </Button>
        </Link>
      </Box>

      {users.length === 0 ? (
        <EmptyState
          title="No hosts found"
          description="Create your first host on the main dashboard."
          action={
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                  fontWeight: 800,
                }}
              >
                Go to Dashboard
              </Button>
            </Link>
          }
        />
      ) : (
        <Grid container spacing={2.5}>
          {users.map((user) => (
            <Grid key={user.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.8 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {initials(user.name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                      {user.email}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontFamily: "'Fira Code', monospace",
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      <CalendarMonthIcon sx={{ fontSize: 13, color: "#FF3E00" }} /> /{user.slug} · {user.timezone}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.8 }}>
                  <Chip
                    size="small"
                    label={`${user._count?.eventTypes ?? 0} event types`}
                    sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: 1.5 }}
                  />
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={`${user._count?.bookings ?? 0} bookings`}
                    sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: 1.5 }}
                  />
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Link
                    to="/users/$userId"
                    params={{ userId: String(user.id) }}
                    style={{ textDecoration: "none", flex: 1 }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={<SettingsIcon fontSize="small" />}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                      }}
                    >
                      Manage
                    </Button>
                  </Link>

                  <Link
                    to="/public/$userId"
                    params={{ userId: String(user.id) }}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LaunchIcon fontSize="small" />}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        borderColor: "divider",
                      }}
                    >
                      Public
                    </Button>
                  </Link>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
