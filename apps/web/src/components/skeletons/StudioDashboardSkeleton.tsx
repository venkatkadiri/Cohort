import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { CyberSkeleton } from "./CyberSkeleton";

/**
 * Loading Skeleton for Mentor Studio Dashboard (/users/$userId & /teachers)
 */
export function StudioDashboardSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
      <Stack spacing={3}>
        {/* Studio Top Banner Skeleton */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CyberSkeleton width={42} height={42} borderRadius={2} />
            <Box>
              <CyberSkeleton width={150} height={22} sx={{ mb: 0.5 }} />
              <CyberSkeleton width={200} height={14} />
            </Box>
          </Box>
          <CyberSkeleton width={120} height={30} borderRadius={1.5} />
        </Box>

        {/* Studio Metrics Row Skeleton */}
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(246, 241, 215, 0.1)"
                      : "#DDE2E7",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <CyberSkeleton width={40} height={40} borderRadius={2} />
                <Box sx={{ flex: 1 }}>
                  <CyberSkeleton width={36} height={22} sx={{ mb: 0.4 }} />
                  <CyberSkeleton width={90} height={12} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Two Column Grid Skeleton */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(246, 241, 215, 0.1)"
                    : "#DDE2E7",
              }}
            >
              <CyberSkeleton width={140} height={18} sx={{ mb: 2 }} />
              <Stack spacing={1.2}>
                {[1, 2, 3].map((i) => (
                  <CyberSkeleton key={i} width="100%" height={48} borderRadius={1.5} />
                ))}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(246, 241, 215, 0.1)"
                    : "#DDE2E7",
              }}
            >
              <CyberSkeleton width={140} height={18} sx={{ mb: 2 }} />
              <Stack spacing={1.2}>
                {[1, 2, 3].map((i) => (
                  <CyberSkeleton key={i} width="100%" height={48} borderRadius={1.5} />
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

export default StudioDashboardSkeleton;
