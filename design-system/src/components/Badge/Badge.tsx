import * as React from "react";
import MuiChip from "@mui/material/Chip";

export interface BadgeProps {
  tone?: "flame" | "pro" | "cyan" | "purple" | "success" | "warning" | "danger" | "neutral" | "red" | "gold" | "info";
  className?: string;
  children: React.ReactNode;
  sx?: any;
}

export function Badge({
  tone = "neutral",
  className,
  children,
  sx,
}: BadgeProps) {
  let customSx: any = {};

  if (tone === "flame" || tone === "red") {
    customSx = {
      bgcolor: "rgba(255, 62, 0, 0.12)",
      color: "#FF3E00",
      border: "1px solid rgba(255, 62, 0, 0.35)",
    };
  } else if (tone === "pro" || tone === "warning" || tone === "gold") {
    customSx = {
      bgcolor: "rgba(245, 158, 11, 0.12)",
      color: "#F59E0B",
      border: "1px solid rgba(245, 158, 11, 0.35)",
    };
  } else if (tone === "cyan" || tone === "info") {
    customSx = {
      bgcolor: "rgba(6, 182, 212, 0.12)",
      color: "#06B6D4",
      border: "1px solid rgba(6, 182, 212, 0.35)",
    };
  } else if (tone === "purple") {
    customSx = {
      bgcolor: "rgba(139, 92, 246, 0.12)",
      color: "#A78BFA",
      border: "1px solid rgba(139, 92, 246, 0.35)",
    };
  } else if (tone === "success") {
    customSx = {
      bgcolor: "rgba(16, 185, 129, 0.12)",
      color: "#10B981",
      border: "1px solid rgba(16, 185, 129, 0.35)",
    };
  } else if (tone === "danger") {
    customSx = {
      bgcolor: "rgba(239, 68, 68, 0.12)",
      color: "#EF4444",
      border: "1px solid rgba(239, 68, 68, 0.35)",
    };
  } else {
    customSx = {
      bgcolor: (theme: any) =>
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.04)",
      color: "text.secondary",
      border: "1px solid",
      borderColor: "divider",
    };
  }

  return (
    <MuiChip
      label={children}
      size="small"
      sx={{
        fontFamily: "'Fira Code', ui-monospace, monospace",
        fontWeight: 700,
        fontSize: "0.62rem",
        letterSpacing: "0.01em",
        height: 20,
        borderRadius: 1.2,
        ...customSx,
        ...sx,
      }}
      className={className}
    />
  );
}
