import React, { ReactNode } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button } from "../Button/Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <MuiDialog
      open={isOpen}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            p: 1,
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#131823" : "#FFFFFF",
            border: "1px solid",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "#E2E8F0",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 20px 48px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 62, 0, 0.2)"
                : "0 12px 32px rgba(0, 0, 0, 0.15)",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", lineHeight: 1.6 }}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          variant={type === "danger" ? "danger" : "primary"}
          size="sm"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </MuiDialog>
  );
}

export interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  type?: "info" | "success" | "error";
  onClose: () => void;
}

export function AlertDialog({
  isOpen,
  title,
  message,
  buttonText = "Got it",
  type = "info",
  onClose,
}: AlertDialogProps) {
  const icon =
    type === "error"
      ? "⚠️"
      : type === "success"
        ? "✅"
        : "ℹ️";

  return (
    <MuiDialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            p: 1,
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#131823" : "#FFFFFF",
            border: "1px solid",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "#E2E8F0",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 20px 48px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 62, 0, 0.2)"
                : "0 12px 32px rgba(0, 0, 0, 0.15)",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <span>{icon}</span>
        <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
          {title || (type === "error" ? "Action Failed" : "Notification")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", lineHeight: 1.6 }}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="primary" size="sm" onClick={onClose} fullWidth>
          {buttonText}
        </Button>
      </DialogActions>
    </MuiDialog>
  );
}
