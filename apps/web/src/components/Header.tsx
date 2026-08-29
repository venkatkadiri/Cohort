import { useEffect, useState, lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import EmailIcon from "@mui/icons-material/Email";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import ThemeToggle from "./ThemeToggle";
import { useNavigation, useSearch, useNotifications, useAuth } from "../context";

// Code-split heavy modals so they are not included in the initial page payload
const SearchModal = lazy(() => import("./SearchModal"));
const NotificationDrawer = lazy(() => import("./NotificationDrawer"));
const NavigationDrawer = lazy(() => import("./NavigationDrawer"));
const AuthModal = lazy(() => import("./AuthModal"));

export default function Header() {
  const { openDrawer, state: navState } = useNavigation();
  const { toggleSearch, openSearch, state: searchState } = useSearch();
  const { openNotifications, unreadCount, state: notifState } = useNotifications();
  const { user, isTeacher, isStudent, isAuthenticated, openAuthModal, logout, isAuthModalOpen } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Keyboard shortcut (⌘K or /) to trigger search via SearchContext
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" &&
          !["INPUT", "TEXTAREA"].includes(
            (e.target as HTMLElement)?.tagName || ""
          ))
      ) {
        e.preventDefault();
        toggleSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearch]);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1.5, sm: 2.5 } }}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 48, sm: 54 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            {/* Left Section: Burger Menu + Brand Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 } }}>
              {/* Google Cloud Console Style Hamburger Button - Visible ONLY when logged in */}
              {isAuthenticated && (
                <Tooltip title="Navigation Menu (Hub, Studio, Fellows)">
                  <IconButton
                    onClick={openDrawer}
                    aria-label="Open navigation menu"
                    size="small"
                    sx={{
                      color: "text.primary",
                      p: 0.6,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(246, 241, 215, 0.04)"
                          : "#FFFFFF",
                      "&:hover": {
                        borderColor: "#FF3E00",
                        color: "#FF3E00",
                        bgcolor: "rgba(255, 62, 0, 0.08)",
                      },
                    }}
                  >
                    <MenuIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Brand Logo */}
              <Link
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(255, 62, 0, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <WhatshotIcon sx={{ fontSize: 18 }} />
                </Box>

                <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{
                        fontSize: "1.08rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      COHORT<span style={{ color: "#FF3E00" }}>.DEV</span>
                    </Typography>
                    <Chip
                      label="PRO"
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: "0.55rem",
                        fontWeight: 900,
                        fontFamily: "'Fira Code', monospace",
                        bgcolor: "rgba(245, 158, 11, 0.12)",
                        color: "#F59E0B",
                        border: "1px solid rgba(245, 158, 11, 0.35)",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.58rem",
                      color: "text.secondary",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      mt: 0.1,
                      fontFamily: "'Fira Code', monospace",
                    }}
                  >
                    1:1 Office Hours
                  </Typography>
                </Box>
              </Link>
            </Box>

            {/* Center Section: Search Bar - Visible ONLY when logged in */}
            {isAuthenticated && (
              <Box
                onClick={openSearch}
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1,
                  maxWidth: 400,
                  mx: 1.5,
                  px: 1.6,
                  py: 0.45,
                  borderRadius: 2.5,
                  cursor: "pointer",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "#0E1217" : "#FFFFFF",
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(246, 241, 215, 0.12)"
                      : "#DDE2E7",
                  transition: "all 0.15s ease",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "none"
                      : "0 1px 4px rgba(14, 18, 23, 0.04)",
                  "&:hover": {
                    borderColor: "#FF3E00",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 62, 0, 0.04)"
                        : "#FFFFFF",
                    boxShadow: "0 0 16px rgba(255, 62, 0, 0.15)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SearchIcon sx={{ color: "#FF3E00", fontSize: 16 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                    }}
                  >
                    Search (/) mentors, tracks, docs...
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Chip
                    label="⌘K"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      fontFamily: "'Fira Code', monospace",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(246, 241, 215, 0.08)"
                          : "#E9ECEF",
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Right Action Tray: Search Mobile Icon, Notification Bell, Theme, Auth / Persona */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.6, sm: 1 } }}>
              {/* Mobile Search Button - Visible ONLY when logged in */}
              {isAuthenticated && (
                <IconButton
                  onClick={openSearch}
                  size="small"
                  sx={{
                    display: { xs: "flex", md: "none" },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 0.6,
                  }}
                >
                  <SearchIcon sx={{ fontSize: 17, color: "#FF3E00" }} />
                </IconButton>
              )}

              {/* Notification Bell with Badge - Visible ONLY when logged in */}
              {isAuthenticated && (
                <Tooltip title={`Notifications (${unreadCount} Unread)`}>
                  <IconButton
                    onClick={openNotifications}
                    aria-label="Open notifications"
                    size="small"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 0.6,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(246, 241, 215, 0.04)"
                          : "#FFFFFF",
                      "&:hover": {
                        borderColor: "#FF3E00",
                        color: "#FF3E00",
                        bgcolor: "rgba(255, 62, 0, 0.08)",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="primary"
                      sx={{
                        "& .MuiBadge-badge": {
                          background:
                            "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                          color: "#FFFFFF",
                          fontWeight: 900,
                          fontSize: "0.55rem",
                          height: 14,
                          minWidth: 14,
                          boxShadow: "0 0 6px rgba(255, 62, 0, 0.6)",
                        },
                      }}
                    >
                      <NotificationsNoneIcon sx={{ fontSize: 18 }} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              <ThemeToggle />

              {/* Role-Based Navigation or Login Button */}
              {isAuthenticated && user ? (
                <>
                  {/* Role Badge + Direct Action Button */}
                  {isTeacher ? (
                    <Link to="/users/$userId" params={{ userId: String(user.id) }} style={{ textDecoration: "none" }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DashboardIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          display: { xs: "none", sm: "inline-flex" },
                          background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                          px: 1.5,
                          py: 0.4,
                          fontWeight: 800,
                          fontSize: "0.76rem",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(255, 62, 0, 0.2)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #FF5722 0%, #FF1744 100%)",
                            boxShadow: "0 0 16px rgba(255, 62, 0, 0.4)",
                          },
                        }}
                      >
                        Teacher Studio
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/enrollers/dashboard" style={{ textDecoration: "none" }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<BookmarkBorderIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          display: { xs: "none", sm: "inline-flex" },
                          background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
                          px: 1.5,
                          py: 0.4,
                          fontWeight: 800,
                          fontSize: "0.76rem",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(6, 182, 212, 0.2)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #0891B2 0%, #2563EB 100%)",
                            boxShadow: "0 0 16px rgba(6, 182, 212, 0.4)",
                          },
                        }}
                      >
                        My Fellows Hub
                      </Button>
                    </Link>
                  )}

                  {/* User Profile Pill with Role Indicator & Dropdown */}
                  <Box
                    onClick={handleOpenMenu}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      p: 0.5,
                      pl: 1.2,
                      pr: 0.8,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: isTeacher ? "rgba(255, 62, 0, 0.4)" : "rgba(6, 182, 212, 0.4)",
                      bgcolor: isTeacher
                        ? (theme) => (theme.palette.mode === "dark" ? "rgba(255, 62, 0, 0.08)" : "rgba(255, 62, 0, 0.04)")
                        : (theme) => (theme.palette.mode === "dark" ? "rgba(6, 182, 212, 0.08)" : "rgba(6, 182, 212, 0.04)"),
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isTeacher ? "rgba(255, 62, 0, 0.14)" : "rgba(6, 182, 212, 0.14)",
                        borderColor: isTeacher ? "#FF3E00" : "#06B6D4",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 900,
                          fontSize: "0.82rem",
                          lineHeight: 1.1,
                          color: "text.primary",
                        }}
                      >
                        {user.name || (isTeacher ? "Ada Lovelace" : "Student")}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.62rem",
                          fontWeight: 900,
                          color: isTeacher ? "#FF3E00" : "#06B6D4",
                          fontFamily: "'Fira Code', monospace",
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {isTeacher ? "👨‍🏫 TEACHER" : "🎓 STUDENT"}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: "0.78rem",
                        fontWeight: 900,
                        bgcolor: isTeacher ? "#FF3E00" : "#06B6D4",
                        color: "#FFFFFF",
                        boxShadow: isTeacher
                          ? "0 2px 8px rgba(255, 62, 0, 0.35)"
                          : "0 2px 8px rgba(6, 182, 212, 0.35)",
                      }}
                    >
                      {(user.name || "A").charAt(0)}
                    </Avatar>
                    <ArrowDropDownIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </Box>

                  {/* Profile Dropdown Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleCloseMenu}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1,
                          minWidth: 200,
                          borderRadius: 2.5,
                          bgcolor: (theme) => (theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF"),
                          border: "1px solid",
                          borderColor: "divider",
                          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.82rem" }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                        {user.email}
                      </Typography>
                    </Box>
                    <Divider />

                    {isTeacher && (
                      <>
                        <Link to="/users/$userId" params={{ userId: String(user.id) }} style={{ textDecoration: "none", color: "inherit" }}>
                          <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon><DashboardIcon fontSize="small" sx={{ color: "#FF3E00" }} /></ListItemIcon>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>Studio Dashboard</Typography>
                          </MenuItem>
                        </Link>
                        <Link to="/users/$userId/availability" params={{ userId: String(user.id) }} style={{ textDecoration: "none", color: "inherit" }}>
                          <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon><CalendarMonthIcon fontSize="small" sx={{ color: "#FF3E00" }} /></ListItemIcon>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>Manage Availability</Typography>
                          </MenuItem>
                        </Link>
                        <Link to="/teachers/requests" style={{ textDecoration: "none", color: "inherit" }}>
                          <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon><EmailIcon fontSize="small" sx={{ color: "#FF3E00" }} /></ListItemIcon>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>Student Requests</Typography>
                          </MenuItem>
                        </Link>
                      </>
                    )}

                    {isStudent && (
                      <>
                        <Link to="/enrollers/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
                          <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon><BookmarkBorderIcon fontSize="small" sx={{ color: "#06B6D4" }} /></ListItemIcon>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>My Subscriptions</Typography>
                          </MenuItem>
                        </Link>
                        <Link to="/enrollers" style={{ textDecoration: "none", color: "inherit" }}>
                          <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon><SchoolIcon fontSize="small" sx={{ color: "#06B6D4" }} /></ListItemIcon>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>Request Custom Slot</Typography>
                          </MenuItem>
                        </Link>
                      </>
                    )}

                    <MenuItem
                      onClick={() => {
                        handleCloseMenu();
                        openAuthModal("login");
                      }}
                    >
                      <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>Switch Account / Persona</Typography>
                    </MenuItem>

                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu();
                        logout();
                      }}
                    >
                      <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "#EF4444" }} /></ListItemIcon>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#EF4444" }}>Log Out</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  {/* Fireship Screenshot 1 Style Gold Outline Login Button */}
                  <Button
                    onClick={() => openAuthModal("login")}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: "50px",
                      borderColor: "#F59E0B",
                      color: "#F59E0B",
                      px: 2,
                      py: 0.4,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      fontSize: "0.76rem",
                      textTransform: "uppercase",
                      fontFamily: "'Fira Code', monospace",
                      "&:hover": {
                        borderColor: "#FBBF24",
                        bgcolor: "rgba(245, 158, 11, 0.12)",
                        boxShadow: "0 0 16px rgba(245, 158, 11, 0.3)",
                      },
                    }}
                  >
                    LOGIN
                  </Button>

                  <Button
                    onClick={() => openAuthModal("register")}
                    variant="contained"
                    size="small"
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      borderRadius: "50px",
                      background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
                      color: "#FFFFFF",
                      px: 1.8,
                      py: 0.4,
                      fontWeight: 800,
                      fontSize: "0.76rem",
                      boxShadow: "0 2px 8px rgba(255, 62, 0, 0.25)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #FF5722 0%, #FF1744 100%)",
                        boxShadow: "0 0 16px rgba(255, 62, 0, 0.45)",
                      },
                    }}
                  >
                    SIGN UP
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Interactive Search Modal - Loaded on demand */}
      <Suspense fallback={null}>
        {searchState.isOpen && <SearchModal />}
      </Suspense>

      {/* Notification Drawer - Loaded on demand */}
      <Suspense fallback={null}>
        {notifState.isOpen && <NotificationDrawer />}
      </Suspense>

      {/* Google Cloud Console Style Multi-Level Burger Drawer - Loaded on demand */}
      <Suspense fallback={null}>
        {navState.isDrawerOpen && <NavigationDrawer />}
      </Suspense>

      {/* Auth Modal for Login & Registration - Loaded on demand */}
      <Suspense fallback={null}>
        {isAuthModalOpen && <AuthModal />}
      </Suspense>
    </>
  );
}
