import { Link } from "@tanstack/react-router";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import StarIcon from "@mui/icons-material/Star";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";

export interface NavSubsection {
  title: string;
  url: string;
  tag?: string;
  description?: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  subsections: NavSubsection[];
}

/*
// =========================================================================
// PLACEHOLDER / FUTURE EXPANSION SECTIONS (Preserved for future feature releases)
// =========================================================================
const PLACEHOLDER_SECTIONS: NavSection[] = [
  {
    id: "platform",
    label: "Platform & Dev Tools",
    icon: <TerminalOutlinedIcon sx={{ fontSize: 20 }} />,
    subsections: [
      {
        title: "Structured Observability Logs",
        url: "/teachers",
        tag: "PROMETHEUS",
        description: "Distributed tracing, JSON log formatters & correlation IDs.",
      },
      {
        title: "Temporal Distributed Engine",
        url: "/teachers",
        description: "Resilient workflow worker & activity orchestrators.",
      },
      {
        title: "gRPC High-Speed Protocols",
        url: "/teachers",
        description: "Proto definitions & bi-directional streaming stubs.",
      },
      {
        title: "Storybook Design System",
        url: "/teachers",
        tag: "UI DEV",
        description: "Atomic component library with Fireship tokens.",
      },
    ],
  },
];
*/

import { useNavigation, useAuth, useConfig } from "../context";

export interface NavigationDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function NavigationDrawer({
  open: propsOpen,
  onClose: propsOnClose,
}: NavigationDrawerProps = {}) {
  const {
    state: navState,
    closeDrawer,
    setActiveSection,
  } = useNavigation();
  const { isFeatureEnabled } = useConfig();
  const { user, isTeacher } = useAuth();
  const hostId = user?.id || 1;

  // Implemented Real Functional Navigation Sections with Dynamic Feature Flag Gating
  const teacherSections: NavSection[] = [
    ...(isFeatureEnabled('lead_studio')
      ? [
          {
            id: "studio",
            label: "Lead Studio",
            icon: <SchoolOutlinedIcon sx={{ fontSize: 20 }} />,
            subsections: [
              {
                title: "Lead Studio Hub",
                url: "/teachers",
                tag: "HOST",
                description: "Primary workspace for mentors & instructors.",
              },
              {
                title: "Mentor Overview",
                url: `/users/${hostId}`,
                description: "Personal metrics, track performance, and active links.",
              },
              {
                title: "Session Tracks Builder",
                url: `/users/${hostId}/event-types`,
                description: "Configure durations, meeting locations & descriptions.",
              },
              {
                title: "Working Hours & Rules",
                url: `/users/${hostId}/availability`,
                description: "Set recurring weekly schedules & blackout intervals.",
              },
              ...(isFeatureEnabled('slot_requests')
                ? [
                    {
                      title: "Custom Slot Requests",
                      url: "/teachers/requests",
                      tag: "REQUESTS",
                      description: "Review custom time requests from students.",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(isFeatureEnabled('calendar_grid')
      ? [
          {
            id: "calendar",
            label: "Schedule & Calendar",
            icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />,
            subsections: [
              {
                title: "Interactive Calendar Grid",
                url: `/users/${hostId}/slots`,
                tag: "LIVE",
                description: "BigCalendar day/week matrix with quick slot editors.",
              },
              {
                title: "Availability Rules Engine",
                url: `/users/${hostId}/availability`,
                description: "Dynamic slot generation algorithm & constraints.",
              },
              {
                title: "Recent Bookings & Confirmations",
                url: `/users/${hostId}/bookings`,
                description: "Google Meet link dispatches and participant notes.",
              },
            ],
          },
        ]
      : []),
    ...(isFeatureEnabled('lectures_vault') || isFeatureEnabled('lecture_upload')
      ? [
          {
            id: "lectures",
            label: "Lectures & Masterclasses",
            icon: <VideoLibraryOutlinedIcon sx={{ fontSize: 20 }} />,
            subsections: [
              ...(isFeatureEnabled('lecture_upload')
                ? [
                    {
                      title: "Lecture Studio & Upload",
                      url: "/teachers/lectures",
                      tag: "UPLOAD",
                      description: "Upload videos & transcode into multi-bitrate HLS streams.",
                    },
                  ]
                : []),
              ...(isFeatureEnabled('lectures_vault')
                ? [
                    {
                      title: "Masterclass Vault",
                      url: "/lectures",
                      description: "Watch recorded lectures and syllabus modules.",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(isFeatureEnabled('fellows_hub')
      ? [
          {
            id: "hub",
            label: "Cohort Hub",
            icon: <HubOutlinedIcon sx={{ fontSize: 20 }} />,
            subsections: [
              {
                title: "Overview & Catalog",
                url: "/",
                description: "Browse verified mentors and active office hours.",
              },
              {
                title: "Fellows Directory",
                url: "/enrollers",
                description: "Explore enrolled students and active mentorship tracks.",
              },
            ],
          },
        ]
      : []),
    {
      id: "leaderboard",
      label: "EXP & Leaderboard",
      icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 20 }} />,
      subsections: [
        {
          title: "Live Leaderboard Standings",
          url: "/leaderboard",
          tag: "WS LIVE",
          description: "Real-time fellowship standings, EXP progression, and badges.",
        },
        {
          title: "Buy Cohort Credits",
          url: "/credits/buy",
          tag: "STORE 🎟️",
          description: "Purchase 1:1 office hours passes and EXP boost packs.",
        },
      ],
    },
    {
      id: "config",
      label: "Platform Configuration",
      icon: <TuneOutlinedIcon sx={{ fontSize: 20 }} />,
      subsections: [
        {
          title: "Configuration Hub",
          url: "/config",
          tag: "ROLES",
          description: "Configure role-based feature flags & platform toggles.",
        },
      ],
    },
  ];

  const studentSections: NavSection[] = [
    {
      id: "leaderboard",
      label: "EXP & Leaderboard",
      icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 20 }} />,
      subsections: [
        {
          title: "Live Leaderboard Standings",
          url: "/leaderboard",
          tag: "WS LIVE",
          description: "Real-time fellowship standings, EXP progression, and badges.",
        },
        {
          title: "Buy Cohort Credits",
          url: "/credits/buy",
          tag: "STORE 🎟️",
          description: "Purchase 1:1 office hours passes and EXP boost packs.",
        },
      ],
    },
    ...(isFeatureEnabled('fellows_hub')
      ? [
          {
            id: "fellows",
            label: "Fellows Hub",
            icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />,
            subsections: [
              {
                title: "Fellows Center & Mentors",
                url: "/enrollers",
                description: "Directory of available mentors and tracks.",
              },
              ...(isFeatureEnabled('drop_alerts')
                ? [
                    {
                      title: "My Subscriptions & Alerts",
                      url: "/enrollers/dashboard",
                      tag: "ALERTS",
                      description: "Manage notification triggers for dropped office hours.",
                    },
                  ]
                : []),
              {
                title: "Public Booking Matrix",
                url: `/public/${hostId}`,
                description: "Direct booking page for 1:1 office hours.",
              },
            ],
          },
        ]
      : []),
    ...(isFeatureEnabled('lectures_vault')
      ? [
          {
            id: "lectures",
            label: "Lecture Vault",
            icon: <VideoLibraryOutlinedIcon sx={{ fontSize: 20 }} />,
            subsections: [
              {
                title: "Masterclass Vault",
                url: "/lectures",
                tag: "HLS",
                description: "Stream recorded lectures from subscribed instructors.",
              },
            ],
          },
        ]
      : []),
    ...(isFeatureEnabled('fellows_hub')
      ? [
          {
            id: "hub",
            label: "Cohort Hub",
            icon: <HubOutlinedIcon sx={{ fontSize: 20 }} />,
            subsections: [
              {
                title: "Overview & Catalog",
                url: "/",
                description: "Browse verified mentors and active office hours.",
              },
            ],
          },
        ]
      : []),
    {
      id: "config",
      label: "Platform Configuration",
      icon: <TuneOutlinedIcon sx={{ fontSize: 20 }} />,
      subsections: [
        {
          title: "Configuration Hub",
          url: "/config",
          tag: "ROLES",
          description: "Inspect active feature flags & platform toggles.",
        },
      ],
    },
  ];

  const dynamicSections = isTeacher ? teacherSections : studentSections;

  const pinnedFavorites = isTeacher
    ? [
        { label: "Studio Dashboard", url: `/users/${hostId}` },
        { label: "Lecture Studio", url: "/teachers/lectures" },
        { label: "Manage Availability", url: `/users/${hostId}/availability` },
        { label: "Student Requests", url: "/teachers/requests" },
        { label: "Calendar Schedule", url: `/users/${hostId}/slots` },
      ]
    : [
        { label: "Fellows Hub", url: "/enrollers" },
        { label: "Lecture Vault", url: "/lectures" },
        { label: "My Subscriptions", url: "/enrollers/dashboard" },
        { label: "Explore Mentors", url: "/" },
        { label: "Book 1:1 Slot", url: `/public/${hostId}` },
      ];

  const isOpen = propsOpen !== undefined ? propsOpen : navState.isDrawerOpen;
  const handleClose = propsOnClose || closeDrawer;
  const activeSectionId = navState.activeSectionId;

  const activeSection =
    dynamicSections.find((s) => s.id === activeSectionId) || dynamicSections[0];

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            top: { xs: "48px", sm: "54px" },
            height: { xs: "calc(100vh - 48px)", sm: "calc(100vh - 54px)" },
            width: { xs: "100%", sm: 540, md: 620 },
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8",
            borderRight: "1px solid",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(246, 241, 215, 0.1)"
                : "#DDE2E7",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 24px 60px rgba(0, 0, 0, 0.9)"
                : "0 16px 40px rgba(14, 18, 23, 0.12)",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Top User Profile Bar & Drawer Controls */}
      <Box
        sx={{
          p: 1.8,
          px: 2.5,
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: isTeacher ? "#FF3E00" : "#06B6D4",
              color: "#FFFFFF",
              width: 38,
              height: 38,
              fontWeight: 900,
              fontSize: "0.95rem",
              boxShadow: isTeacher
                ? "0 2px 10px rgba(255, 62, 0, 0.35)"
                : "0 2px 10px rgba(6, 182, 212, 0.35)",
            }}
          >
            {(user?.name || "A").charAt(0)}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 900,
                fontSize: "0.92rem",
                lineHeight: 1.2,
                color: "text.primary",
              }}
            >
              {user?.name || (isTeacher ? "Ada Lovelace" : "Student Fellow")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
              <Chip
                label={isTeacher ? "👨‍🏫 TEACHER STUDIO" : "🎓 FELLOWS HUB"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.62rem",
                  fontWeight: 900,
                  fontFamily: "'Fira Code', monospace",
                  bgcolor: isTeacher ? "rgba(255, 62, 0, 0.12)" : "rgba(6, 182, 212, 0.12)",
                  color: isTeacher ? "#FF3E00" : "#06B6D4",
                  border: "1px solid",
                  borderColor: isTeacher ? "rgba(255, 62, 0, 0.3)" : "rgba(6, 182, 212, 0.3)",
                }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 600 }}>
                {user?.email || "ada@lovelace.dev"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close navigation"
          sx={{
            color: "text.secondary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            "&:hover": {
              borderColor: "#FF3E00",
              color: "#FF3E00",
              bgcolor: "rgba(255, 62, 0, 0.08)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Two-Pane Google Cloud Style Navigation Layout */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Left Primary Section Rail */}
        <Box
          sx={{
            width: { xs: 150, sm: 190 },
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#0E1217" : "#FFFFFF",
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflowY: "auto",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                px: 1,
                py: 0.5,
                fontWeight: 800,
                fontSize: "0.65rem",
                color: "text.secondary",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              Main Navigation
            </Typography>

            <Stack spacing={0.6} sx={{ mt: 1 }}>
              {dynamicSections.map((sec) => {
                const isActive = sec.id === activeSection.id;
                return (
                  <Box
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1.2,
                      py: 1,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: isActive
                        ? (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255, 62, 0, 0.12)"
                              : "rgba(255, 62, 0, 0.08)"
                        : "transparent",
                      color: isActive ? "#FF3E00" : "text.primary",
                      border: "1px solid",
                      borderColor: isActive
                        ? "rgba(255, 62, 0, 0.4)"
                        : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.04)"
                            : "rgba(0, 0, 0, 0.03)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box sx={{ color: isActive ? "#FF3E00" : "text.secondary", display: "flex" }}>
                        {sec.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 800 : 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {sec.label}
                      </Typography>
                    </Box>
                    <ChevronRightIcon
                      sx={{
                        fontSize: 16,
                        opacity: isActive ? 1 : 0.3,
                        transform: isActive ? "translateX(2px)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>

            {/* Pinned Real Shortcuts */}
            <Typography
              variant="caption"
              sx={{
                display: "block",
                px: 1,
                mt: 3,
                mb: 1,
                fontWeight: 800,
                fontSize: "0.65rem",
                color: "text.secondary",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              Pinned Favorites
            </Typography>

            <Stack spacing={0.4}>
              {pinnedFavorites.map((fav) => (
                <Link
                  key={fav.label}
                  to={fav.url as any}
                  onClick={handleClose}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1.2,
                      py: 0.7,
                      borderRadius: 1.5,
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "text.secondary",
                      "&:hover": {
                        color: "#FF3E00",
                        bgcolor: "rgba(255, 62, 0, 0.05)",
                      },
                    }}
                  >
                    <span>{fav.label}</span>
                    <StarIcon sx={{ fontSize: 13, color: "#F59E0B" }} />
                  </Box>
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Bottom Action */}
          <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Link
              to={(isTeacher ? `/users/${hostId}/availability` : "/enrollers") as any}
              onClick={handleClose}
              style={{ textDecoration: "none" }}
            >
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<WhatshotIcon sx={{ color: "#FF3E00" }} />}
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  py: 0.8,
                  borderColor: "rgba(255, 62, 0, 0.3)",
                  color: "#FF3E00",
                }}
              >
                {isTeacher ? "Manage Hours" : "Browse Sessions"}
              </Button>
            </Link>
          </Box>
        </Box>

        {/* Right Active Subsections Details Pane */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflowY: "auto",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#0A0D12" : "#F4F6F8",
          }}
        >
          <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "rgba(255, 62, 0, 0.12)",
                color: "#FF3E00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {activeSection.icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                {activeSection.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontFamily: "'Fira Code', monospace",
                  fontSize: "0.68rem",
                }}
              >
                // {activeSection.subsections.length} DIRECT ACCESS PATHS
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1.5}>
            {activeSection.subsections.map((sub) => (
              <Link
                key={sub.title}
                to={sub.url}
                onClick={handleClose}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 4px 14px rgba(0, 0, 0, 0.3)"
                        : "0 2px 8px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.15s ease",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "#FF3E00",
                      transform: "translateX(3px)",
                      boxShadow: "0 6px 20px rgba(255, 62, 0, 0.15)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, fontSize: "0.85rem", color: "text.primary" }}
                      >
                        {sub.title}
                      </Typography>
                      {sub.tag && (
                        <Chip
                          label={sub.tag}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.58rem",
                            fontWeight: 900,
                            fontFamily: "'Fira Code', monospace",
                            bgcolor: "rgba(255, 62, 0, 0.12)",
                            color: "#FF3E00",
                            border: "1px solid rgba(255, 62, 0, 0.3)",
                          }}
                        />
                      )}
                    </Box>
                    <ArrowForwardIcon sx={{ fontSize: 15, color: "#FF3E00" }} />
                  </Box>

                  {sub.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.74rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {sub.description}
                    </Typography>
                  )}
                </Box>
              </Link>
            ))}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
