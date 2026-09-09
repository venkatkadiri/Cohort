import { useEffect, useMemo, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WhatshotIcon from "@mui/icons-material/Whatshot";

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "mentors" | "tracks" | "sessions" | "docs";
  tag?: string;
  url: string;
  icon: ReactNode;
}

const DUMMY_SEARCH_ITEMS: SearchItem[] = [
  // Mentors
  {
    id: "m-1",
    title: "Venkat Kadiri",
    subtitle: "Fullstack Tech Lead · Next.js 15, Temporal & gRPC",
    category: "mentors",
    tag: "COHORT LEAD",
    url: "/public/1",
    icon: <PersonOutlinedIcon sx={{ color: "#FF3E00", fontSize: 20 }} />,
  },
  {
    id: "m-2",
    title: "Elena Rostova",
    subtitle: "Principal Systems Architect · Distributed Systems & Rust",
    category: "mentors",
    tag: "TOP RATED",
    url: "/public/1",
    icon: <PersonOutlinedIcon sx={{ color: "#06B6D4", fontSize: 20 }} />,
  },
  {
    id: "m-3",
    title: "Marcus Vance",
    subtitle: "Staff Frontend Engineer · React 19 & Web Performance",
    category: "mentors",
    tag: "MENTOR",
    url: "/public/1",
    icon: <PersonOutlinedIcon sx={{ color: "#F59E0B", fontSize: 20 }} />,
  },
  {
    id: "m-4",
    title: "Sarah Chen",
    subtitle: "Cloud Platform Lead · Kubernetes, Helm & Terraform",
    category: "mentors",
    tag: "INFRA LEAD",
    url: "/public/1",
    icon: <PersonOutlinedIcon sx={{ color: "#10B981", fontSize: 20 }} />,
  },
  // Tracks
  {
    id: "t-1",
    title: "System Architecture & Scale Review",
    subtitle: "Deep-dive into microservices, gRPC protocols and event pipelines",
    category: "tracks",
    tag: "45 MINS",
    url: "/public/1/event-types/system-architecture-scale-review",
    icon: <AccessTimeIcon sx={{ color: "#FF3E00", fontSize: 20 }} />,
  },
  {
    id: "t-2",
    title: "Fullstack Next.js & React 19 1:1",
    subtitle: "Modern server actions, streaming rendering and state patterns",
    category: "tracks",
    tag: "30 MINS",
    url: "/public/1/event-types/fullstack-nextjs-react-19-1-on-1",
    icon: <AccessTimeIcon sx={{ color: "#F59E0B", fontSize: 20 }} />,
  },
  {
    id: "t-3",
    title: "Distributed Workflows with Temporal",
    subtitle: "Resilient state machines, retry policies and saga pattern",
    category: "tracks",
    tag: "60 MINS",
    url: "/public/1",
    icon: <AccessTimeIcon sx={{ color: "#8B5CF6", fontSize: 20 }} />,
  },
  {
    id: "t-4",
    title: "Kubernetes & Cloud Native Deployments",
    subtitle: "Cluster setup, ingress controllers and service mesh",
    category: "tracks",
    tag: "45 MINS",
    url: "/public/1",
    icon: <AccessTimeIcon sx={{ color: "#10B981", fontSize: 20 }} />,
  },
  // Sessions & Bookings
  {
    id: "s-1",
    title: "Booked: Architecture Review with Marcus Vance",
    subtitle: "Tomorrow at 2:00 PM · Google Meet Room confirmed",
    category: "sessions",
    tag: "CONFIRMED",
    url: "/users/1/bookings",
    icon: <EventAvailableIcon sx={{ color: "#10B981", fontSize: 20 }} />,
  },
  {
    id: "s-2",
    title: "Slot Request: Custom Time for Sarah Chen",
    subtitle: "Submitted custom slot request for Saturday morning",
    category: "sessions",
    tag: "PENDING",
    url: "/teachers/requests",
    icon: <EventAvailableIcon sx={{ color: "#F59E0B", fontSize: 20 }} />,
  },
  // Guides & Docs
  {
    id: "d-1",
    title: "Fireship Monorepo Setup & gRPC Protocol",
    subtitle: "Guide on proto schema generation, TypeScript types & Python stubs",
    category: "docs",
    tag: "GUIDE",
    url: "/teachers",
    icon: <DescriptionOutlinedIcon sx={{ color: "#06B6D4", fontSize: 20 }} />,
  },
  {
    id: "d-2",
    title: "Structured Logging with Loki & Prometheus",
    subtitle: "Correlated tracing IDs, JSON formatters and gRPC interceptors",
    category: "docs",
    tag: "OBSERVABILITY",
    url: "/teachers",
    icon: <DescriptionOutlinedIcon sx={{ color: "#FF3E00", fontSize: 20 }} />,
  },
];

import { useSearch } from "../context";

export interface SearchModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function SearchModal({ open: propsOpen, onClose: propsOnClose }: SearchModalProps = {}) {
  const { state: searchState, closeSearch, setQuery, setCategory, setSelectedIndex, addRecentSearch } = useSearch();
  const navigate = useNavigate();

  const isOpen = propsOpen !== undefined ? propsOpen : searchState.isOpen;
  const handleClose = propsOnClose || closeSearch;
  const query = searchState.query;
  const activeCategory = searchState.category;
  const selectedIndex = searchState.selectedIndex;

  // Filter items
  const filteredItems = useMemo(() => {
    return DUMMY_SEARCH_ITEMS.filter((item) => {
      const matchCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        (item.tag && item.tag.toLowerCase().includes(query.toLowerCase()));
      return matchCategory && matchQuery;
    });
  }, [query, activeCategory]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(
          selectedIndex < filteredItems.length - 1 ? selectedIndex + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          selectedIndex > 0 ? selectedIndex - 1 : filteredItems.length - 1
        );
      } else if (e.key === "Enter") {
        if (filteredItems[selectedIndex]) {
          e.preventDefault();
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, setSelectedIndex]);

  const handleSelect = (item: SearchItem) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    handleClose();
    navigate({ to: item.url as any });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
            border: "1px solid",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(246, 241, 215, 0.12)"
                : "#DDE2E7",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 32px rgba(255, 62, 0, 0.2)"
                : "0 20px 48px rgba(14, 18, 23, 0.16)",
            overflow: "hidden",
            maxHeight: "85vh",
          },
        },
      }}
    >
      {/* Search Input Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2.5,
          py: 1.8,
          borderBottom: "1px solid",
          borderColor: "divider",
          gap: 1.5,
        }}
      >
        <SearchIcon sx={{ color: "#FF3E00", fontSize: 22 }} />
        <InputBase
          autoFocus
          placeholder="Search mentors, session tracks, bookings, docs... (Type to filter)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          sx={{
            flex: 1,
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "text.primary",
            "& input::placeholder": {
              color: "text.secondary",
              opacity: 0.8,
            },
          }}
        />
        {query ? (
          <IconButton size="small" onClick={() => setQuery("")}>
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : (
          <Chip
            label="ESC"
            size="small"
            onClick={handleClose}
            sx={{
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 800,
              fontFamily: "'Fira Code', monospace",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(246, 241, 215, 0.08)"
                  : "#E9ECEF",
              color: "text.secondary",
              cursor: "pointer",
            }}
          />
        )}
      </Box>

      {/* Category Filter Chips */}
      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8",
          overflowX: "auto",
        }}
      >
        {[
          { key: "all", label: "All Results" },
          { key: "mentors", label: "Mentors" },
          { key: "tracks", label: "Tracks" },
          { key: "sessions", label: "Sessions" },
          { key: "docs", label: "Docs & Guides" },
        ].map((cat) => {
          const isSelected = activeCategory === cat.key;
          return (
            <Chip
              key={cat.key}
              label={cat.label}
              size="small"
              onClick={() => {
                setCategory(cat.key as any);
              }}
              sx={{
                fontSize: "0.72rem",
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

      {/* Results List */}
      <Box sx={{ maxHeight: 380, overflowY: "auto", p: 1.5 }}>
        {filteredItems.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
            <WhatshotIcon sx={{ fontSize: 32, color: "#FF3E00", opacity: 0.5, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              No matches found for &ldquo;{query}&rdquo;
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Try searching by mentor name, tech stack (Next.js, Temporal, Kubernetes), or track title.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.8}>
            {filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <Box
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    bgcolor: isSelected
                      ? (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 62, 0, 0.12)"
                            : "rgba(255, 62, 0, 0.06)"
                      : "transparent",
                    border: "1px solid",
                    borderColor: isSelected
                      ? (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 62, 0, 0.4)"
                            : "#FF3E00"
                      : "transparent",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.8, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "#0E1217"
                            : "#F4F6F8",
                        border: "1px solid",
                        borderColor: "divider",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.88rem",
                            color: isSelected ? "#FF3E00" : "text.primary",
                          }}
                          noWrap
                        >
                          {item.title}
                        </Typography>
                        {item.tag && (
                          <Chip
                            label={item.tag}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.6rem",
                              fontWeight: 800,
                              fontFamily: "'Fira Code', monospace",
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 62, 0, 0.12)"
                                  : "#E9ECEF",
                              color: "#FF3E00",
                              border: "1px solid rgba(255, 62, 0, 0.25)",
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          fontSize: "0.74rem",
                          lineHeight: 1.3,
                        }}
                        noWrap
                      >
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  <ArrowForwardIosIcon
                    sx={{
                      fontSize: 12,
                      color: isSelected ? "#FF3E00" : "text.disabled",
                      opacity: isSelected ? 1 : 0.4,
                      ml: 1,
                      flexShrink: 0,
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Footer Navigation Helper */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#0E1217" : "#F4F6F8",
          fontSize: "0.72rem",
          color: "text.secondary",
          fontFamily: "'Fira Code', monospace",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <span>
            <strong style={{ color: "#FF3E00" }}>&uarr;&darr;</strong> to navigate
          </span>
          <span>
            <strong style={{ color: "#FF3E00" }}>&crarr;</strong> to select
          </span>
          <span>
            <strong style={{ color: "#FF3E00" }}>ESC</strong> to close
          </span>
        </Box>
        <span>{filteredItems.length} results</span>
      </Box>
    </Dialog>
  );
}
