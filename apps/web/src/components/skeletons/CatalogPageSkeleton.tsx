import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { CyberSkeleton } from "./CyberSkeleton";

/**
 * Loading Skeleton for Homepage / Catalog (/)
 */
export function CatalogPageSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
      <Stack spacing={3}>
        {/* Hero Section Skeleton */}
        <Card
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(246, 241, 215, 0.1)"
                : "#DDE2E7",
          }}
        >
          <Box sx={{ maxWidth: 780 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
              <CyberSkeleton width={150} height={20} borderRadius={1.5} />
              <CyberSkeleton width={90} height={20} borderRadius={1.5} />
            </Box>
            <CyberSkeleton width="85%" height={38} borderRadius={2} sx={{ mb: 1 }} />
            <CyberSkeleton width="60%" height={38} borderRadius={2} sx={{ mb: 2 }} />
            <CyberSkeleton width="95%" height={16} sx={{ mb: 0.8 }} />
            <CyberSkeleton width="70%" height={16} sx={{ mb: 3 }} />

            {/* Metric Counters Skeleton */}
            <Grid container spacing={1.5}>
              {[1, 2, 3, 4].map((i) => (
                <Grid key={i} size={{ xs: 6, sm: 3 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8",
                      borderColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(246, 241, 215, 0.08)"
                          : "#DDE2E7",
                    }}
                  >
                    <CyberSkeleton width={50} height={26} borderRadius={1.5} sx={{ mb: 0.8 }} />
                    <CyberSkeleton width={70} height={12} borderRadius={1} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Card>

        {/* Main 2-Column Section */}
        <Grid container spacing={2.5}>
          {/* Left: Create Studio Form Skeleton */}
          <Grid size={{ xs: 12, md: 5 }}>
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
                <CyberSkeleton width={32} height={32} borderRadius={2} />
                <Box sx={{ flex: 1 }}>
                  <CyberSkeleton width={140} height={18} sx={{ mb: 0.4 }} />
                  <CyberSkeleton width={180} height={12} />
                </Box>
              </Box>
              <Stack spacing={1.8}>
                <CyberSkeleton width="100%" height={36} borderRadius={2} />
                <CyberSkeleton width="100%" height={36} borderRadius={2} />
                <CyberSkeleton width="100%" height={36} borderRadius={2} />
                <CyberSkeleton width="100%" height={38} borderRadius={2} />
              </Stack>
            </Card>
          </Grid>

          {/* Right: Mentor Catalog Grid Skeleton */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                <CyberSkeleton width={160} height={20} />
                <CyberSkeleton width={50} height={20} borderRadius={1.5} />
              </Box>

              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 1.8,
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                    borderColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(246, 241, 215, 0.1)"
                        : "#DDE2E7",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                      <CyberSkeleton width={40} height={40} borderRadius={2} />
                      <Box sx={{ flex: 1 }}>
                        <CyberSkeleton width={120} height={18} sx={{ mb: 0.5 }} />
                        <CyberSkeleton width={160} height={12} />
                      </Box>
                    </Box>
                    <CyberSkeleton width={85} height={30} borderRadius={2} />
                  </Box>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

export default CatalogPageSkeleton;
