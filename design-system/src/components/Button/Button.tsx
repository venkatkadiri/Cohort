import * as React from "react";
import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";

export interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "pro" | "gold" | "contained" | "outlined" | "text";
  size?: "sm" | "md" | "lg" | "small" | "medium" | "large";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", sx, children, ...props }, ref) => {
    let muiVariant: "contained" | "outlined" | "text" = "contained";
    let muiColor: "primary" | "secondary" | "error" | "inherit" = "primary";
    let customSx: any = {};

    if (variant === "primary" || variant === "contained") {
      muiVariant = "contained";
      muiColor = "primary";
      customSx = {
        background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
        color: "#FFFFFF",
        border: "none",
        boxShadow: "0 4px 14px rgba(255, 62, 0, 0.25)",
        "&:hover": {
          background: "linear-gradient(135deg, #FF5722 0%, #FF1744 100%)",
          boxShadow: "0 0 24px rgba(255, 62, 0, 0.45)",
          transform: "translateY(-1px)",
        },
      };
    } else if (variant === "secondary" || variant === "outlined") {
      muiVariant = "outlined";
      muiColor = "inherit";
      customSx = {
        bgcolor: (theme: any) =>
          theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)",
        borderColor: (theme: any) =>
          theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0",
        color: "text.primary",
        "&:hover": {
          borderColor: "#FF3E00",
          bgcolor: "rgba(255, 62, 0, 0.08)",
          color: "#FF3E00",
          transform: "translateY(-1px)",
        },
      };
    } else if (variant === "ghost" || variant === "text") {
      muiVariant = "text";
      muiColor = "inherit";
      customSx = {
        color: "text.secondary",
        "&:hover": {
          color: "#FF3E00",
          bgcolor: "rgba(255, 62, 0, 0.08)",
        },
      };
    } else if (variant === "danger") {
      muiVariant = "outlined";
      muiColor = "error";
      customSx = {
        borderColor: "rgba(239, 68, 68, 0.4)",
        color: "#EF4444",
        "&:hover": {
          bgcolor: "rgba(239, 68, 68, 0.12)",
          borderColor: "#EF4444",
          boxShadow: "0 0 16px rgba(239, 68, 68, 0.3)",
        },
      };
    } else if (variant === "pro" || variant === "gold") {
      muiVariant = "contained";
      customSx = {
        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        color: "#000000",
        fontWeight: 800,
        boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
        "&:hover": {
          background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
          boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)",
          transform: "translateY(-1px)",
        },
      };
    }

    const muiSize =
      size === "sm" || size === "small"
        ? "small"
        : size === "lg" || size === "large"
          ? "large"
          : "medium";

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={muiColor}
        size={muiSize}
        sx={{
          minHeight: muiSize === "small" ? 30 : muiSize === "large" ? 42 : 36,
          px: muiSize === "small" ? 1.5 : 2,
          py: muiSize === "small" ? 0.35 : 0.6,
          borderRadius: 2,
          fontWeight: 700,
          letterSpacing: "0.01em",
          textTransform: "none",
          fontSize: muiSize === "small" ? "0.74rem" : muiSize === "large" ? "0.84rem" : "0.8rem",
          transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
          ...customSx,
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);
Button.displayName = "Button";
