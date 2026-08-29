import Box, { type BoxProps } from "@mui/material/Box";

export interface CyberSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number | string;
  sx?: BoxProps["sx"];
  className?: string;
}

export function CyberSkeleton({
  width = "100%",
  height = 20,
  borderRadius = 2,
  sx = {},
  className = "",
}: CyberSkeletonProps) {
  return (
    <Box
      className={`cyber-shimmer ${className}`.trim()}
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

export default CyberSkeleton;
