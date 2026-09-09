import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { CyberSkeleton } from "./CyberSkeleton";

/**
 * Loading Skeleton for Fellows Center (/enrollers & /enrollers/dashboard)
 */
export function FellowsPageSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <CyberSkeleton width={100} height={12} sx={{ mb: 0.8 }} />
            <CyberSkeleton width={220} height={28} sx={{ mb: 0.8 }} />
            <CyberSkeleton width={260} height={14} />
          </Box>
          <CyberSkeleton width={130} height={32} borderRadius={1.5} />
        </Box>

        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <CyberSkeleton width={36} height={36} borderRadius={2} />
                  <Box sx={{ flex: 1 }}>
                    <CyberSkeleton width={100} height={16} sx={{ mb: 0.5 }} />
                    <CyberSkeleton width={120} height={11} />
                  </Box>
                </Box>
                <CyberSkeleton width="100%" height={30} borderRadius={1.5} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}

export default FellowsPageSkeleton;
