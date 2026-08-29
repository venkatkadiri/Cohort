import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number | string;
  className?: string;
  sx?: any;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 2,
  className,
  sx,
}: SkeletonProps) {
  return (
    <Box
      className={`cyber-shimmer ${className || ""}`}
      sx={{
        width,
        height,
        borderRadius,
        display: "inline-block",
        ...sx,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
        borderColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(246, 241, 215, 0.1)"
            : "#DDE2E7",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Skeleton width={44} height={44} borderRadius={2.5} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width={140} height={18} sx={{ mb: 0.8 }} />
          <Skeleton width={200} height={12} />
        </Box>
      </Box>
      <Skeleton width="100%" height={16} sx={{ mb: 1 }} />
      <Skeleton width="75%" height={16} sx={{ mb: 2.5 }} />
      <Skeleton width={100} height={36} borderRadius={2} />
    </Card>
  );
}

export function GridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <CardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}
