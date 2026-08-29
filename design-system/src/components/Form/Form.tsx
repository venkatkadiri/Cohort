import * as React from "react";
import type { ComponentProps, ReactNode } from "react";
import MuiTypography from "@mui/material/Typography";
import MuiBox from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export function Label({ className, children, ...props }: ComponentProps<"label">) {
  return (
    <MuiTypography
      component="label"
      sx={{
        display: "block",
        mb: 0.8,
        fontSize: "0.75rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "text.primary",
        fontFamily: "'Fira Code', monospace",
      }}
      className={className}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export function Input({ className, style, ...props }: ComponentProps<"input">) {
  return (
    <input
      style={{
        width: "100%",
        minHeight: "44px",
        borderRadius: "10px",
        border: "1px solid var(--line)",
        backgroundColor: "var(--bg-card)",
        padding: "10px 14px",
        fontSize: "14px",
        color: "var(--sea-ink)",
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        ...style,
      }}
      className={`focus:border-[#FF3E00] focus:ring-2 focus:ring-[#FF3E00]/20 ${className ?? ""}`}
      {...props}
    />
  );
}

export function Select({ className, style, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      style={{
        width: "100%",
        minHeight: "44px",
        borderRadius: "10px",
        border: "1px solid var(--line)",
        backgroundColor: "var(--bg-card)",
        padding: "10px 14px",
        fontSize: "14px",
        color: "var(--sea-ink)",
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        ...style,
      }}
      className={`focus:border-[#FF3E00] focus:ring-2 focus:ring-[#FF3E00]/20 ${className ?? ""}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, style, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      style={{
        width: "100%",
        borderRadius: "10px",
        border: "1px solid var(--line)",
        backgroundColor: "var(--bg-card)",
        padding: "10px 14px",
        fontSize: "14px",
        color: "var(--sea-ink)",
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
        outline: "none",
        minHeight: "88px",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        ...style,
      }}
      className={`focus:border-[#FF3E00] focus:ring-2 focus:ring-[#FF3E00]/20 ${className ?? ""}`}
      {...props}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return <CircularProgress size={18} color="inherit" className={className} sx={{ color: "#FF3E00" }} />;
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <MuiBox
      sx={{
        mb: 2,
        borderRadius: 2.5,
        border: "1px solid rgba(239, 68, 68, 0.4)",
        bgcolor: "rgba(239, 68, 68, 0.1)",
        p: 1.5,
        fontSize: "0.78rem",
        fontWeight: 700,
        color: "#EF4444",
        fontFamily: "'Fira Code', monospace",
      }}
    >
      ⚠️ {message}
    </MuiBox>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <MuiBox
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 3,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#131823" : "#F8FAFC",
        p: { xs: 4, sm: 6 },
        textAlign: "center",
      }}
    >
      <MuiTypography variant="h5" sx={{ mb: 1, letterSpacing: "0.02em", fontWeight: 800 }}>
        {title}
      </MuiTypography>
      {description ? (
        <MuiTypography
          sx={{
            mb: 3,
            maxWidth: 380,
            fontSize: "0.85rem",
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {description}
        </MuiTypography>
      ) : null}
      {action}
    </MuiBox>
  );
}
