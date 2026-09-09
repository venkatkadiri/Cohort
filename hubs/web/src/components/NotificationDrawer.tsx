import { Link } from "@tanstack/react-router";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import WhatshotIcon from "@mui/icons-material/Whatshot";

import { useNotifications, type NotificationItem } from "../context";

export type { NotificationItem };

export interface NotificationDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function NotificationDrawer({
  open: propsOpen,
  onClose: propsOnClose,
}: NotificationDrawerProps = {}) {
  const {
    state: notifState,
    unreadCount,
    filteredNotifications,
    closeNotifications,
    setFilter,
    markAllAsRead,
    clearAll,
    toggleRead,
  } = useNotifications();

  const isOpen = propsOpen !== undefined ? propsOpen : notifState.isOpen;
  const handleClose = propsOnClose || closeNotifications;
  const filter = notifState.filter;
  const notifications = notifState.notifications;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleClose}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 100,
      }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 420 },
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
            borderLeft: "1px solid",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(246, 241, 215, 0.1)"
                : "#DDE2E7",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 20px 60px rgba(0, 0, 0, 0.9)"
                : "0 16px 40px rgba(14, 18, 23, 0.12)",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(255, 62, 0, 0.3)",
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              Notifications
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontFamily: "'Fira Code', monospace",
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              {unreadCount} UNREAD ALERTS
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {unreadCount > 0 && (
            <Button
              size="small"
              variant="text"
              onClick={markAllAsRead}
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#FF3E00",
                p: 0.8,
              }}
            >
              Read all
            </Button>
          )}
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8",
          overflowX: "auto",
        }}
      >
        {[
          { key: "all", label: `All (${notifications.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "mentorship", label: "Mentorship" },
          { key: "system", label: "System" },
        ].map((tab) => {
          const isSelected = filter === tab.key;
          return (
            <Chip
              key={tab.key}
              label={tab.label}
              size="small"
              onClick={() => setFilter(tab.key as any)}
              sx={{
                fontSize: "0.7rem",
                fontWeight: 800,
                fontFamily: "'Fira Code', monospace",
                cursor: "pointer",
                bgcolor: isSelected
                  ? "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)"
                  : (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(246, 241, 215, 0.06)"
                        : "#FFFFFF",
                color: isSelected ? "#FFFFFF" : "text.secondary",
                border: "1px solid",
                borderColor: isSelected
                  ? "#FF3E00"
                  : (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(246, 241, 215, 0.1)"
                        : "#DDE2E7",
                "&:hover": {
                  borderColor: "#FF3E00",
                },
              }}
            />
          );
        })}
      </Box>

      {/* Notification Items List */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            <WhatshotIcon
              sx={{ fontSize: 36, color: "#FF3E00", opacity: 0.5, mb: 1 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              All caught up!
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              No new alerts in this filter view.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredNotifications.map((notif) => (
              <Box
                key={notif.id}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: (theme) =>
                    !notif.isRead
                      ? theme.palette.mode === "dark"
                        ? "rgba(255, 62, 0, 0.08)"
                        : "rgba(255, 62, 0, 0.04)"
                      : theme.palette.mode === "dark"
                      ? "#0E1217"
                      : "#F4F6F8",
                  border: "1px solid",
                  borderColor: (theme) =>
                    !notif.isRead
                      ? "rgba(255, 62, 0, 0.35)"
                      : theme.palette.mode === "dark"
                      ? "rgba(246, 241, 215, 0.08)"
                      : "#DDE2E7",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "#FF3E00",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 0.8,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {!notif.isRead && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#FF3E00",
                          boxShadow: "0 0 8px #FF3E00",
                        }}
                      />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.86rem" }}>
                      {notif.title}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontFamily: "'Fira Code', monospace",
                      fontSize: "0.68rem",
                      flexShrink: 0,
                    }}
                  >
                    {notif.time}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.8rem",
                    lineHeight: 1.5,
                    mb: 1.5,
                  }}
                >
                  {notif.description}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {notif.actionLabel && notif.actionUrl ? (
                    <Link
                      to={notif.actionUrl as any}
                      onClick={handleClose}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          py: 0.4,
                          px: 1.5,
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          borderRadius: 2,
                          borderColor: "rgba(255, 62, 0, 0.4)",
                          color: "#FF3E00",
                        }}
                      >
                        {notif.actionLabel} &rarr;
                      </Button>
                    </Link>
                  ) : (
                    <Box />
                  )}

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => toggleRead(notif.id)}
                    sx={{
                      fontSize: "0.68rem",
                      color: "text.secondary",
                      fontWeight: 700,
                    }}
                  >
                    {notif.isRead ? "Mark unread" : "Mark read"}
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8",
          }}
        >
          <Button
            size="small"
            variant="text"
            onClick={clearAll}
            startIcon={<DeleteOutlinedIcon fontSize="small" />}
            sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 700 }}
          >
            Clear all notifications
          </Button>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "'Fira Code', monospace",
              fontSize: "0.68rem",
              color: "text.secondary",
            }}
          >
            Real-time SSE Live
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}
