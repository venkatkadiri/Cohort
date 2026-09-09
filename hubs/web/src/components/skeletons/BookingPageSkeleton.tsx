import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { CyberSkeleton } from "./CyberSkeleton";

/**
 * Loading Skeleton for Booking Flow (/public/$userId/event-types/$eventTypeSlug)
 */
export function BookingPageSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
      {/* Progress Bar Skeleton */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
          <CyberSkeleton width={80} height={12} />
          <CyberSkeleton width={120} height={12} />
        </Box>
        <CyberSkeleton width="100%" height={6} borderRadius={3} />
      </Box>

      <Grid container spacing={2.5}>
        {/* Left Column: Event Type & Host Info Skeleton */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <CyberSkeleton width={120} height={20} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CyberSkeleton width={40} height={40} borderRadius={2} />
              <Box sx={{ flex: 1 }}>
                <CyberSkeleton width={100} height={12} sx={{ mb: 0.5 }} />
                <CyberSkeleton width={180} height={20} />
              </Box>
            </Box>

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
              }}
            >
              <CyberSkeleton width="100%" height={14} sx={{ mb: 0.8 }} />
              <CyberSkeleton width="75%" height={14} sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <CyberSkeleton width={110} height={14} />
                <CyberSkeleton width={160} height={14} />
                <CyberSkeleton width={140} height={14} />
              </Stack>
            </Card>

            <CyberSkeleton width="100%" height={50} borderRadius={2} />
          </Stack>
        </Grid>

        {/* Right Column: Calendar Date & Slots Skeleton */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            {/* Step 1: Calendar Skeleton */}
            <Box>
              <CyberSkeleton width={160} height={20} sx={{ mb: 1 }} />
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
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <CyberSkeleton width={24} height={24} borderRadius={1.5} />
                  <CyberSkeleton width={120} height={20} />
                  <CyberSkeleton width={24} height={24} borderRadius={1.5} />
                </Box>

                {/* Calendar Days Matrix Skeleton */}
                <Grid container spacing={0.6} sx={{ mb: 1.5 }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <Grid key={i} size={12 / 7}>
                      <CyberSkeleton width="100%" height={32} borderRadius={1.5} />
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ pt: 1.2, borderTop: "1px solid", borderColor: "divider" }}>
                  <CyberSkeleton width={100} height={12} sx={{ mb: 0.8 }} />
                  <Box sx={{ display: "flex", gap: 0.8 }}>
                    <CyberSkeleton width={70} height={24} borderRadius={1.5} />
                    <CyberSkeleton width={70} height={24} borderRadius={1.5} />
                    <CyberSkeleton width={70} height={24} borderRadius={1.5} />
                  </Box>
                </Box>
              </Card>
            </Box>

            {/* Time Slot Selector Skeleton */}
            <Box>
              <CyberSkeleton width={180} height={18} sx={{ mb: 1 }} />
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
                }}
              >
                <Grid container spacing={1}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid key={i} size={{ xs: 6, sm: 4 }}>
                      <CyberSkeleton width="100%" height={36} borderRadius={1.5} />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default BookingPageSkeleton;
