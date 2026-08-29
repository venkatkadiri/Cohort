import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { CyberSkeleton } from "./CyberSkeleton";

/**
 * Loading Skeleton for Slot Requests (/teachers/requests)
 */
export function RequestsPageSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
      <Stack spacing={2.5}>
        <CyberSkeleton width={140} height={20} />
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
          <CyberSkeleton width={100} height={12} sx={{ mb: 0.8 }} />
          <CyberSkeleton width={220} height={26} sx={{ mb: 0.8 }} />
          <CyberSkeleton width="75%" height={14} />
        </Card>

        <Stack spacing={1.2}>
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(246, 241, 215, 0.1)"
                    : "#DDE2E7",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <CyberSkeleton width={18} height={18} borderRadius="50%" />
                  <CyberSkeleton width={100} height={16} />
                  <CyberSkeleton width={130} height={12} />
                </Box>
                <CyberSkeleton width={70} height={18} borderRadius={1.5} />
              </Box>
              <CyberSkeleton width="100%" height={32} borderRadius={1.5} />
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

export default RequestsPageSkeleton;
