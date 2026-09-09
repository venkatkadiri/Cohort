import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { CyberSkeleton } from "./CyberSkeleton";

/**
 * Loading Skeleton for Public Mentor Profile (/public/$userId)
 */
export function MentorProfileSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
      <Stack spacing={3.5}>
        {/* Mentor Profile Header Banner */}
        <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CyberSkeleton width={68} height={68} borderRadius="50%" sx={{ mb: 1.5 }} />
          <CyberSkeleton width={200} height={30} sx={{ mb: 0.8 }} />
          <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
            <CyberSkeleton width={70} height={20} borderRadius={1.5} />
            <CyberSkeleton width={110} height={20} borderRadius={1.5} />
            <CyberSkeleton width={90} height={20} borderRadius={1.5} />
          </Box>
          <CyberSkeleton width={220} height={28} borderRadius={2} />
        </Box>

        {/* Tracks List Skeleton */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
            <CyberSkeleton width={180} height={22} />
            <CyberSkeleton width={70} height={20} borderRadius={1.5} />
          </Box>
          <Grid container spacing={1.5}>
            {[1, 2].map((i) => (
              <Grid key={i} size={{ xs: 12 }}>
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
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", gap: 0.8, mb: 0.8 }}>
                        <CyberSkeleton width={70} height={18} borderRadius={1.5} />
                        <CyberSkeleton width={100} height={18} borderRadius={1.5} />
                      </Box>
                      <CyberSkeleton width="55%" height={22} sx={{ mb: 0.8 }} />
                      <CyberSkeleton width="80%" height={14} sx={{ mb: 1.2 }} />
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <CyberSkeleton width={90} height={12} />
                        <CyberSkeleton width={110} height={12} />
                      </Box>
                    </Box>
                    <CyberSkeleton width={110} height={32} borderRadius={2} sx={{ alignSelf: { sm: "center" } }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Feedback Skeleton */}
        <Card
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(246, 241, 215, 0.08)"
                : "#DDE2E7",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <CyberSkeleton width={160} height={20} />
            <CyberSkeleton width={70} height={18} />
          </Box>
          <Grid container spacing={1.5}>
            {[1, 2].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                    borderColor: "divider",
                  }}
                >
                  <CyberSkeleton width="100%" height={14} sx={{ mb: 0.8 }} />
                  <CyberSkeleton width="75%" height={14} sx={{ mb: 1.5 }} />
                  <CyberSkeleton width={90} height={12} sx={{ mb: 0.4 }} />
                  <CyberSkeleton width={120} height={10} />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Stack>
    </Container>
  );
}

export default MentorProfileSkeleton;
