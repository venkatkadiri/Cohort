import * as React from "react";
import MuiCard, { type CardProps as MuiCardProps } from "@mui/material/Card";

export interface CardProps extends MuiCardProps {
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  sx,
  ...props
}) => {
  return (
    <MuiCard
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2.5,
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
        borderColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(246, 241, 215, 0.1)"
            : "#DDE2E7",
        backgroundImage: "none",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "none"
            : "0 2px 8px rgba(14, 18, 23, 0.04)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        ...(interactive && {
          cursor: "pointer",
          "&:hover": {
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 62, 0, 0.55)"
                : "#FF3E00",
            transform: "translateY(-2px)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 16px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 62, 0, 0.2)"
                : "0 12px 28px rgba(14, 18, 23, 0.09)",
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
};
