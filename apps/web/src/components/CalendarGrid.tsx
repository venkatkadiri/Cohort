import { useEffect, useState } from "react";
import { Calendar, Views, luxonLocalizer } from "react-big-calendar";
import { DateTime } from "luxon";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import { listEventTypesFn } from "#/server/functions/eventTypes.fn";
import { getUserById } from "#/server/functions/users.fn";
import {
  createSlotFn,
  updateSlotFn,
  deleteSlotFn,
  listSlotsFn,
} from "#/server/functions/slots.fn";
import CohortDatePicker from "./CohortDatePicker";
import { AlertDialog, ConfirmDialog } from "./Dialog";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { ClientOnly } from "./ClientOnly";
import { StudioDashboardSkeleton } from "./skeletons/StudioDashboardSkeleton";

const localizer = luxonLocalizer(DateTime as any);

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const totalMins = i * 15;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const timeValue = `${hh}:${mm}`;

  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const label = `${String(h12).padStart(2, "0")}:${mm} ${period}`;
  return { value: timeValue, label };
});

function roundTo15MinString(timeStr: string): string {
  if (!timeStr) return "09:00";
  const parts = timeStr.split(":");
  const h = parseInt(parts[0] || "9", 10);
  const m = parseInt(parts[1] || "0", 10);
  const roundedM = Math.round(m / 15) * 15;
  const finalH = roundedM === 60 ? (h + 1) % 24 : h;
  const finalM = roundedM === 60 ? 0 : roundedM;
  return `${String(finalH).padStart(2, "0")}:${String(finalM).padStart(2, "0")}`;
}

type Slot = {
  id: string;
  startAt: string | Date;
  endAt: string | Date;
  status?: string;
  eventTypeId?: number;
  eventType?: {
    id: number;
    title: string;
    durationMinutes: number;
    slug: string;
  };
};

function CustomToolbar(toolbar: any) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const goToBack = () => toolbar.onNavigate("PREV");
  const goToNext = () => toolbar.onNavigate("NEXT");
  const goToCurrent = () => toolbar.onNavigate("TODAY");

  const currentDateISO = DateTime.fromJSDate(toolbar.date).toFormat("yyyy-MM-dd");

  const handleOpenPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  const handleSelectDate = (dateStr: string) => {
    const selected = DateTime.fromISO(dateStr).toJSDate();
    toolbar.onNavigate("DATE", selected);
    handleClosePicker();
  };

  // Mini calendar calculation for header dropdown
  const viewDt = DateTime.fromJSDate(toolbar.date);
  const [pickerViewDate, setPickerViewDate] = useState<DateTime>(viewDt);

  const startOfMonth = pickerViewDate.startOf("month");
  const firstDayOfGrid = startOfMonth.minus({ days: startOfMonth.weekday % 7 });
  const gridDays: DateTime[] = Array.from({ length: 42 }, (_, i) =>
    firstDayOfGrid.plus({ days: i })
  );
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const todayISO = DateTime.local().toFormat("yyyy-MM-dd");

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 2,
        pb: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Navigation Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={goToCurrent}
          startIcon={<TodayIcon fontSize="small" />}
          sx={{
            fontWeight: 800,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            borderRadius: 2,
            px: 1.5,
            py: 0.6,
          }}
        >
          Today
        </Button>

        <ButtonGroup variant="outlined" size="small" sx={{ borderRadius: 2 }}>
          <IconButton
            size="small"
            onClick={goToBack}
            aria-label="Previous"
            sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={goToNext}
            aria-label="Next"
            sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
      </Box>

      {/* Date Header with Theme-Matched Mini Calendar Popover */}
      <Tooltip title="Click to jump to any date" arrow>
        <Box
          onClick={handleOpenPicker}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.8,
            borderRadius: 2.5,
            cursor: "pointer",
            border: "1px solid transparent",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "action.hover",
              borderColor: "divider",
              transform: "translateY(-1px)",
            },
          }}
        >
          <CalendarMonthIcon sx={{ fontSize: 20, color: "#FF3E00" }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1rem", sm: "1.2rem" },
              letterSpacing: "0.02em",
              color: "text.primary",
              userSelect: "none",
            }}
          >
            {toolbar.label}
          </Typography>
        </Box>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              mt: 1,
              width: 310,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 12px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(229, 9, 20, 0.25)"
                  : "0 12px 32px rgba(0, 0, 0, 0.12)",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
            {pickerViewDate.toFormat("MMMM yyyy")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton size="small" onClick={() => setPickerViewDate((d) => d.minus({ months: 1 }))} sx={{ p: 0.5 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setPickerViewDate((d) => d.plus({ months: 1 }))} sx={{ p: 0.5 }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 1, textAlign: "center" }}>
          {weekdays.map((wd) => (
            <Typography key={wd} variant="caption" sx={{ fontWeight: 800, fontSize: "0.72rem", color: "text.secondary", fontFamily: "'Fira Code', monospace" }}>
              {wd}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
          {gridDays.map((day, idx) => {
            const dayISO = day.toFormat("yyyy-MM-dd");
            const isCurrentMonth = day.month === pickerViewDate.month;
            const isSelected = currentDateISO === dayISO;
            const isToday = todayISO === dayISO;

            return (
              <Box
                key={idx}
                onClick={() => handleSelectDate(dayISO)}
                sx={{
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  fontSize: "0.8rem",
                  fontWeight: isSelected ? 900 : isToday ? 800 : 600,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.12s ease",
                  background: isSelected ? "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)" : isToday ? "rgba(255, 62, 0, 0.12)" : "transparent",
                  color: isSelected ? "#FFFFFF" : !isCurrentMonth ? "text.disabled" : isToday ? "#FF3E00" : "text.primary",
                  border: isToday && !isSelected ? "1px solid rgba(255, 62, 0, 0.4)" : "1px solid transparent",
                  "&:hover": {
                    background: isSelected ? "linear-gradient(135deg, #FF5722 0%, #FF1744 100%)" : "rgba(255, 62, 0, 0.16)",
                    color: isSelected ? "#FFFFFF" : "#FF3E00",
                    transform: "scale(1.05)",
                  },
                }}
              >
                {day.day}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            size="small"
            variant="text"
            onClick={() => handleSelectDate(todayISO)}
            sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#FF3E00" }}
          >
            Today
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={handleClosePicker}
            sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.secondary" }}
          >
            Close
          </Button>
        </Box>
      </Popover>

      {/* View Switcher */}
      <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: 2 }}>
        <Button
          variant={toolbar.view === Views.WEEK ? "contained" : "outlined"}
          color={toolbar.view === Views.WEEK ? "primary" : "inherit"}
          onClick={() => toolbar.onView(Views.WEEK)}
          sx={{
            fontWeight: 800,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            px: 1.8,
            py: 0.6,
          }}
        >
          Week
        </Button>
        <Button
          variant={toolbar.view === Views.DAY ? "contained" : "outlined"}
          color={toolbar.view === Views.DAY ? "primary" : "inherit"}
          onClick={() => toolbar.onView(Views.DAY)}
          sx={{
            fontWeight: 800,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            px: 1.8,
            py: 0.6,
          }}
        >
          Day
        </Button>
      </ButtonGroup>
    </Box>
  );
}

function CustomCalendarEvent({ event }: { event: any }) {
  const isBooked = event.status === "BOOKED";

  const startFormatted = DateTime.fromJSDate(event.start).toFormat("HH:mm");
  let endFormatted = DateTime.fromJSDate(event.end).toFormat("HH:mm");

  if (startFormatted === endFormatted) {
    const dur = event.durationMinutes || 30;
    endFormatted = DateTime.fromJSDate(event.start).plus({ minutes: dur }).toFormat("HH:mm");
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        p: "6px 8px",
        overflow: "hidden",
        lineHeight: 1.2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.6, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, minWidth: 0 }}>
          {isBooked ? (
            <LockIcon sx={{ fontSize: 14, color: "#60A5FA", flexShrink: 0 }} />
          ) : (
            <CheckCircleIcon sx={{ fontSize: 14, color: "#EF4444", flexShrink: 0 }} />
          )}
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: "0.01em",
              color: isBooked ? "#93C5FD" : "#FFFFFF",
            }}
          >
            {event.trackTitle || "Session Track"}
          </Typography>
        </Box>
        <EditOutlinedIcon sx={{ fontSize: 12, opacity: 0.6, "&:hover": { opacity: 1 } }} />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 0.8,
          pt: 0.4,
          borderTop: "1px solid",
          borderColor: isBooked ? "rgba(96, 165, 250, 0.25)" : "rgba(239, 68, 68, 0.25)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.68rem",
            color: isBooked ? "#BFDBFE" : "rgba(255, 255, 255, 0.9)",
            display: "flex",
            alignItems: "center",
            gap: 0.3,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 11 }} />
          {startFormatted} – {endFormatted}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 900,
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            px: 0.7,
            py: 0.15,
            borderRadius: 1,
            bgcolor: isBooked ? "rgba(59, 130, 246, 0.3)" : "rgba(229, 9, 20, 0.35)",
            color: "#FFFFFF",
          }}
        >
          {isBooked ? "Booked" : "Open · Edit"}
        </Typography>
      </Box>
    </Box>
  );
}

export default function CalendarGrid(props: {
  userId: number | string;
  initialSlots?: Slot[];
  onSlotCreated?: () => void;
}) {
  return (
    <ClientOnly fallback={<StudioDashboardSkeleton />}>
      <CalendarGridInner {...props} />
    </ClientOnly>
  );
}

function CalendarGridInner({
  userId,
  initialSlots,
  onSlotCreated,
}: {
  userId: number | string;
  initialSlots?: Slot[];
  onSlotCreated?: () => void;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<any>(Views.WEEK);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  // Dialog states
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "info" | "success" | "error";
  }>({ isOpen: false, message: "" });

  const [createSlotState, setCreateSlotState] = useState<{
    isOpen: boolean;
    eventTypeId: number;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    busy: boolean;
  } | null>(null);

  // Edit Slot State
  const [editSlotState, setEditSlotState] = useState<{
    isOpen: boolean;
    id: string;
    hostId: number;
    eventTypeId: number;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    status: string;
    busy: boolean;
  } | null>(null);

  const [deleteConfirmSlotId, setDeleteConfirmSlotId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    loadEventTypes();
  }, [userId]);

  async function loadEventTypes() {
    try {
      const list = await listEventTypesFn({ data: Number(userId) }).catch(() => []);
      setEventTypes(list ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  function mapSlotsToEvents(slotsData: any[]) {
    return (slotsData ?? []).map((slot) => {
      const trackTitle =
        slot.eventType?.title ||
        (slot.eventTypeId ? `Track #${slot.eventTypeId}` : "Session Slot");
      const isBooked = slot.status === "BOOKED";
      const statusText = isBooked ? "Booked" : "Available";

      return {
        id: slot.id,
        rawSlot: slot,
        title: `${trackTitle} (${statusText})`,
        trackTitle,
        eventTypeId: slot.eventTypeId || slot.eventType?.id,
        durationMinutes: slot.eventType?.durationMinutes,
        status: slot.status,
        start: new Date(slot.startAt),
        end: new Date(slot.endAt),
        allDay: false,
      };
    });
  }

  useEffect(() => {
    if (initialSlots) {
      setEvents(mapSlotsToEvents(initialSlots));
      return;
    }
    fetchSlotsForDate(date);
  }, [date, initialSlots, timezone, userId]);

  async function fetchSlotsForDate(d: Date) {
    const dt = DateTime.fromJSDate(d);
    const startISO = dt.minus({ days: 30 }).toISODate() ?? undefined;
    const endISO = dt.plus({ days: 60 }).toISODate() ?? undefined;

    try {
      const data = await listSlotsFn({
        data: {
          hostId: Number(userId),
          from: startISO,
          to: endISO,
        },
      });
      setEvents(mapSlotsToEvents(data ?? []));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const user = await getUserById({ data: Number(userId) }).catch(() => null);
        if (user?.timezone) setTimezone(user.timezone);
      } catch (err) {
        /* ignore */
      }
    })();
  }, [userId]);

  // Converts date into local Date representing the target timezone's wall-clock time
  function toTz(dateVal: Date | string): Date {
    const dt = typeof dateVal === "string" ? DateTime.fromISO(dateVal) : DateTime.fromJSDate(dateVal);
    const targetDt = dt.setZone(timezone);
    return new Date(
      targetDt.year,
      targetDt.month - 1,
      targetDt.day,
      targetDt.hour,
      targetDt.minute,
      targetDt.second || 0,
      targetDt.millisecond || 0
    );
  }

  async function handleConfirmCreateSlot() {
    if (!createSlotState) return;
    setCreateSlotState((prev) => (prev ? { ...prev, busy: true } : null));

    try {
      const startDateTime = DateTime.fromISO(`${createSlotState.date}T${createSlotState.startTime}`, { zone: timezone });
      let endDateTime = DateTime.fromISO(`${createSlotState.date}T${createSlotState.endTime}`, { zone: timezone });
      
      if (endDateTime <= startDateTime) {
        const selectedEt = eventTypes.find((et) => et.id === createSlotState.eventTypeId);
        endDateTime = startDateTime.plus({ minutes: selectedEt?.durationMinutes || 30 });
      }

      await createSlotFn({
        data: {
          hostId: Number(userId),
          eventTypeId: createSlotState.eventTypeId,
          startAt: startDateTime.toUTC().toISO()!,
          endAt: endDateTime.toUTC().toISO()!,
        },
      });

      const slotDateObj = DateTime.fromISO(createSlotState.date).toJSDate();
      setDate(slotDateObj);
      setCreateSlotState(null);
      await fetchSlotsForDate(slotDateObj);
      onSlotCreated?.();
    } catch (err) {
      console.error(err);
      setCreateSlotState(null);
      setAlertDialog({
        isOpen: true,
        title: "Slot Creation Failed",
        message: err instanceof Error ? err.message : "Failed to create slot.",
        type: "error",
      });
    }
  }

  function handleSelectEvent(calEvent: any) {
    const slot = calEvent.rawSlot || calEvent;
    const initialEventTypeId =
      slot.eventTypeId ||
      slot.eventType?.id ||
      (eventTypes.length > 0 ? eventTypes[0].id : 1);

    const startDt = (typeof slot.startAt === "string" ? DateTime.fromISO(slot.startAt) : DateTime.fromJSDate(calEvent.start)).setZone(timezone);
    let endDt = (typeof slot.endAt === "string" ? DateTime.fromISO(slot.endAt) : DateTime.fromJSDate(calEvent.end)).setZone(timezone);

    if (endDt <= startDt) {
      const et = eventTypes.find((t) => t.id === initialEventTypeId);
      endDt = startDt.plus({ minutes: et?.durationMinutes || 30 });
    }

    setEditSlotState({
      isOpen: true,
      id: slot.id,
      hostId: Number(userId),
      eventTypeId: initialEventTypeId,
      date: startDt.toFormat("yyyy-MM-dd"),
      startTime: roundTo15MinString(startDt.toFormat("HH:mm")),
      endTime: roundTo15MinString(endDt.toFormat("HH:mm")),
      status: slot.status || "AVAILABLE",
      busy: false,
    });
  }

  async function handleSaveEditSlot() {
    if (!editSlotState) return;
    setEditSlotState((prev) => (prev ? { ...prev, busy: true } : null));

    try {
      const startDateTime = DateTime.fromISO(`${editSlotState.date}T${editSlotState.startTime}`, { zone: timezone });
      let endDateTime = DateTime.fromISO(`${editSlotState.date}T${editSlotState.endTime}`, { zone: timezone });
      
      if (endDateTime <= startDateTime) {
        const selectedEt = eventTypes.find((et) => et.id === editSlotState.eventTypeId);
        endDateTime = startDateTime.plus({ minutes: selectedEt?.durationMinutes || 30 });
      }

      await updateSlotFn({
        data: {
          id: editSlotState.id,
          hostId: editSlotState.hostId,
          eventTypeId: editSlotState.eventTypeId,
          startAt: startDateTime.toUTC().toISO()!,
          endAt: endDateTime.toUTC().toISO()!,
          status: editSlotState.status,
        },
      });

      const slotDateObj = DateTime.fromISO(editSlotState.date).toJSDate();
      setDate(slotDateObj);
      setEditSlotState(null);
      await fetchSlotsForDate(slotDateObj);
      onSlotCreated?.();
    } catch (err) {
      setEditSlotState((prev) => (prev ? { ...prev, busy: false } : null));
      setAlertDialog({
        isOpen: true,
        title: "Update Failed",
        message: err instanceof Error ? err.message : "Failed to update slot.",
        type: "error",
      });
    }
  }

  async function handleDeleteSlot(slotId: string) {
    setDeleteBusy(true);
    try {
      await deleteSlotFn({
        data: {
          id: slotId,
          hostId: Number(userId),
        },
      });

      setDeleteConfirmSlotId(null);
      setEditSlotState(null);
      fetchSlotsForDate(date);
      onSlotCreated?.();
    } catch (err) {
      setAlertDialog({
        isOpen: true,
        title: "Delete Failed",
        message: err instanceof Error ? err.message : "Failed to delete slot.",
        type: "error",
      });
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Calendar Header Controls */}
      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase", color: "text.secondary" }}>
            Timezone:
          </Typography>
          <FormControl size="small">
            <Select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                borderRadius: 2,
                height: 34,
                "& .MuiSelect-select": { py: 0.5, px: 1.5 },
              }}
            >
              <MenuItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
              {eventTypes.length > 0 && eventTypes[0].host?.timezone && (
                <MenuItem value={eventTypes[0].host.timezone}>
                  Host ({eventTypes[0].host.timezone})
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            size="small"
            icon={<span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FF3E00", display: "inline-block" }} />}
            label="Available Slot (Click to Edit)"
            sx={{
              fontWeight: 800,
              fontSize: "0.72rem",
              fontFamily: "'Fira Code', monospace",
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255, 62, 0, 0.12)" : "rgba(255, 62, 0, 0.08)"),
              color: "#FF3E00",
              border: "1px solid rgba(255, 62, 0, 0.3)",
            }}
          />
          <Chip
            size="small"
            icon={<span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3B82F6", display: "inline-block" }} />}
            label="Booked Session"
            sx={{
              fontWeight: 800,
              fontSize: "0.72rem",
              fontFamily: "'Fira Code', monospace",
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)"),
              color: "#3B82F6",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          />
        </Box>
      </Box>

      {/* Calendar Area */}
      <Box
        sx={{
          height: { xs: 700, md: 850 },
          width: "100%",
          position: "relative",
        }}
      >
        <Calendar
          localizer={localizer as any}
          events={events.map((ev) => ({
            ...ev,
            start: toTz(ev.rawSlot?.startAt || ev.start),
            end: toTz(ev.rawSlot?.endAt || ev.end),
            allDay: false,
          }))}
          allDayAccessor={() => false}
          showMultiDayTimes={false}
          components={{
            toolbar: CustomToolbar,
            event: CustomCalendarEvent,
          }}
          eventPropGetter={(event: any) => {
            const isBooked = event.status === "BOOKED";
            return {
              className: isBooked ? "cohort-slot-booked" : "cohort-slot-available",
            };
          }}
          view={view}
          onView={(v: any) => setView(v)}
          views={[Views.WEEK, Views.DAY]}
          step={30}
          timeslots={2}
          date={toTz(date)}
          onNavigate={(d: Date | string) => {
            const newD = typeof d === "string" ? new Date(d) : d;
            setDate(newD);
            fetchSlotsForDate(newD);
          }}
          selectable
          onSelectEvent={(event: any) => handleSelectEvent(event)}
          onSelectSlot={async ({ start, end }: { start: Date; end: Date }) => {
            if (!eventTypes || eventTypes.length === 0) {
              setAlertDialog({
                isOpen: true,
                title: "No Session Tracks",
                message: "No active event types or session tracks are configured for this mentor. Please create a session track first.",
                type: "info",
              });
              return;
            }

            const startH = String(start.getHours()).padStart(2, "0");
            const startM = String(start.getMinutes()).padStart(2, "0");
            const startTimeStr = roundTo15MinString(`${startH}:${startM}`);

            const endH = String(end.getHours()).padStart(2, "0");
            const endM = String(end.getMinutes()).padStart(2, "0");
            let endTimeStr = roundTo15MinString(`${endH}:${endM}`);

            if (endTimeStr <= startTimeStr) {
              const dur = eventTypes[0]?.durationMinutes || 30;
              const endLuxon = DateTime.fromISO(`2000-01-01T${startTimeStr}`).plus({ minutes: dur });
              endTimeStr = endLuxon.toFormat("HH:mm");
            }

            const dateStr = DateTime.fromObject({
              year: start.getFullYear(),
              month: start.getMonth() + 1,
              day: start.getDate(),
            }).toFormat("yyyy-MM-dd");

            setCreateSlotState({
              isOpen: true,
              eventTypeId: eventTypes[0].id,
              date: dateStr,
              startTime: startTimeStr,
              endTime: endTimeStr,
              busy: false,
            });
          }}
          popup
          style={{ height: "100%" }}
        />
      </Box>

      {/* Create Slot Modal */}
      {createSlotState && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            alignItems: { xs: "flex-end", sm: "center" },
            justifyContent: "center",
            p: { xs: 0, sm: 2 },
          }}
        >
          <Box
            onClick={() => {
              if (!createSlotState.busy) setCreateSlotState(null);
            }}
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(4px)",
            }}
          />
          <Box
            role="dialog"
            aria-modal="true"
            sx={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              maxWidth: 480,
              borderRadius: { xs: "24px 24px 0 0", sm: 4 },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              p: 3.5,
              boxShadow: 24,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setCreateSlotState(null)}
              disabled={createSlotState.busy}
              sx={{ position: "absolute", right: 16, top: 16 }}
            >
              <X size={18} />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  bgcolor: "rgba(255, 62, 0, 0.12)",
                  color: "#FF3E00",
                  border: "1px solid rgba(255, 62, 0, 0.3)",
                }}
              >
                <CalendarIcon size={20} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.1 }}>
                  Create Time Slot
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Add a custom bookable slot for this mentor.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 800, textTransform: "uppercase", color: "text.secondary" }}>
                  Session Track
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={createSlotState.eventTypeId}
                    onChange={(e) =>
                      setCreateSlotState({
                        ...createSlotState,
                        eventTypeId: Number(e.target.value),
                      })
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    {eventTypes.map((et) => (
                      <MenuItem key={et.id} value={et.id}>
                        {et.title} ({et.durationMinutes} mins)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Custom Theme-Matched Date Picker */}
              <CohortDatePicker
                label="Date"
                value={createSlotState.date}
                onChange={(d) =>
                  setCreateSlotState({
                    ...createSlotState,
                    date: d,
                  })
                }
              />

              {/* Start & End Time Dropdowns with Theme Styling */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 800, textTransform: "uppercase", color: "text.secondary" }}>
                    Start Time
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={createSlotState.startTime}
                      onChange={(e) =>
                        setCreateSlotState({
                          ...createSlotState,
                          startTime: e.target.value,
                        })
                      }
                      sx={{ borderRadius: 2, fontSize: "0.85rem" }}
                      MenuProps={{ slotProps: { paper: { sx: { maxHeight: 260, borderRadius: 2 } } } }}
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <MenuItem key={`create-start-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 800, textTransform: "uppercase", color: "text.secondary" }}>
                    End Time
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={createSlotState.endTime}
                      onChange={(e) =>
                        setCreateSlotState({
                          ...createSlotState,
                          endTime: e.target.value,
                        })
                      }
                      sx={{ borderRadius: 2, fontSize: "0.85rem" }}
                      MenuProps={{ slotProps: { paper: { sx: { maxHeight: 260, borderRadius: 2 } } } }}
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <MenuItem key={`create-end-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5, mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Button
                variant="outlined"
                onClick={() => setCreateSlotState(null)}
                disabled={createSlotState.busy}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmCreateSlot}
                disabled={createSlotState.busy}
                sx={{ borderRadius: 2, fontWeight: 800 }}
              >
                {createSlotState.busy ? "Creating..." : "Create Slot"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Edit Slot Modal */}
      {editSlotState && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            alignItems: { xs: "flex-end", sm: "center" },
            justifyContent: "center",
            p: { xs: 0, sm: 2 },
          }}
        >
          <Box
            onClick={() => {
              if (!editSlotState.busy) setEditSlotState(null);
            }}
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(4px)",
            }}
          />
          <Box
            role="dialog"
            aria-modal="true"
            sx={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              maxWidth: 480,
              borderRadius: { xs: "24px 24px 0 0", sm: 4 },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              p: 3.5,
              boxShadow: 24,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setEditSlotState(null)}
              disabled={editSlotState.busy}
              sx={{ position: "absolute", right: 16, top: 16 }}
            >
              <X size={18} />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  bgcolor: "rgba(255, 62, 0, 0.12)",
                  color: "#FF3E00",
                  border: "1px solid rgba(255, 62, 0, 0.3)",
                }}
              >
                <EditOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.1 }}>
                  Edit Time Slot
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Modify session track, scheduled time, or remove this slot.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Session Track Select */}
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 800, textTransform: "uppercase", color: "text.secondary" }}>
                  Session Track
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={editSlotState.eventTypeId}
                    onChange={(e) =>
                      setEditSlotState({
                        ...editSlotState,
                        eventTypeId: Number(e.target.value),
                      })
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    {eventTypes.map((et) => (
                      <MenuItem key={et.id} value={et.id}>
                        {et.title} ({et.durationMinutes} mins)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Custom Theme-Matched Date Picker */}
              <CohortDatePicker
                label="Date"
                value={editSlotState.date}
                onChange={(d) =>
                  setEditSlotState({
                    ...editSlotState,
                    date: d,
                  })
                }
              />

              {/* Start & End Time Dropdowns with Theme Styling */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 800, textTransform: "uppercase", color: "text.secondary" }}>
                    Start Time
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={editSlotState.startTime}
                      onChange={(e) =>
                        setEditSlotState({
                          ...editSlotState,
                          startTime: e.target.value,
                        })
                      }
                      sx={{ borderRadius: 2, fontSize: "0.85rem" }}
                      MenuProps={{ slotProps: { paper: { sx: { maxHeight: 260, borderRadius: 2 } } } }}
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <MenuItem key={`edit-start-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 800, textTransform: "uppercase", color: "text.secondary" }}>
                    End Time
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={editSlotState.endTime}
                      onChange={(e) =>
                        setEditSlotState({
                          ...editSlotState,
                          endTime: e.target.value,
                        })
                      }
                      sx={{ borderRadius: 2, fontSize: "0.85rem" }}
                      MenuProps={{ slotProps: { paper: { sx: { maxHeight: 260, borderRadius: 2 } } } }}
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <MenuItem key={`edit-end-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Status Select */}
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 800, textTransform: "uppercase", color: "text.secondary" }}>
                  Slot Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={editSlotState.status}
                    onChange={(e) =>
                      setEditSlotState({
                        ...editSlotState,
                        status: e.target.value,
                      })
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="AVAILABLE">AVAILABLE (Open for booking)</MenuItem>
                    <MenuItem value="BLOCKED">BLOCKED (Hidden from booking)</MenuItem>
                    <MenuItem value="BOOKED">BOOKED (Reserved)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Modal Actions */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                mt: 3.5,
                pt: 2.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlinedIcon fontSize="small" />}
                onClick={() => setDeleteConfirmSlotId(editSlotState.id)}
                disabled={editSlotState.busy || editSlotState.status === "BOOKED"}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Delete
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => setEditSlotState(null)}
                  disabled={editSlotState.busy}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveEditSlot}
                  disabled={editSlotState.busy}
                  sx={{ borderRadius: 2, fontWeight: 800 }}
                >
                  {editSlotState.busy ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Delete Slot Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmSlotId !== null}
        title="Delete Time Slot?"
        description="Are you sure you want to permanently remove this time slot? It will no longer be available for student or peer booking."
        confirmText="Delete Slot"
        cancelText="Cancel"
        variant="danger"
        busy={deleteBusy}
        onConfirm={() => {
          if (deleteConfirmSlotId) handleDeleteSlot(deleteConfirmSlotId);
        }}
        onClose={() => {
          if (!deleteBusy) setDeleteConfirmSlotId(null);
        }}
      />

      {/* Modern Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({ isOpen: false, message: "" })}
      />
    </Box>
  );
}
