import { useState } from "react";
import { DateTime } from "luxon";
import { ClientOnly } from "./ClientOnly";

import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface CohortDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: "small" | "medium";
  disabled?: boolean;
}

export default function CohortDatePicker(props: CohortDatePickerProps) {
  return (
    <ClientOnly
      fallback={
        <TextField
          size={props.size || "small"}
          label={props.label}
          value={props.value || ""}
          placeholder={props.placeholder || "Select date"}
          fullWidth={props.fullWidth !== false}
          disabled
        />
      }
    >
      <CohortDatePickerInner {...props} />
    </ClientOnly>
  );
}

function CohortDatePickerInner({
  value,
  onChange,
  label,
  placeholder = "Select date",
  fullWidth = true,
  size = "small",
  disabled = false,
}: CohortDatePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const selectedDt = value ? DateTime.fromISO(value) : null;
  const [viewDate, setViewDate] = useState<DateTime>(
    selectedDt && selectedDt.isValid ? selectedDt : DateTime.local()
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    if (selectedDt && selectedDt.isValid) {
      setViewDate(selectedDt);
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isOpen = Boolean(anchorEl);

  const prevMonth = () => setViewDate((d) => d.minus({ months: 1 }));
  const nextMonth = () => setViewDate((d) => d.plus({ months: 1 }));
  const goToToday = () => {
    const today = DateTime.local();
    setViewDate(today);
    onChange(today.toISODate()!);
    handleClose();
  };

  const selectDay = (dayDt: DateTime) => {
    const iso = dayDt.toISODate();
    if (iso) {
      onChange(iso);
    }
    handleClose();
  };

  // Calendar matrix calculation
  const startOfMonth = viewDate.startOf("month");
  const endOfMonth = viewDate.endOf("month");
  const firstDayOfWeek = startOfMonth.weekday % 7; // Sunday = 0
  const daysInMonth = viewDate.daysInMonth || 30;

  const calendarDays: Array<{
    date: DateTime;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = startOfMonth.minus({ days: i + 1 });
    calendarDays.push({
      date: d,
      isCurrentMonth: false,
      isToday: d.hasSame(DateTime.local(), "day"),
      isSelected: selectedDt ? d.hasSame(selectedDt, "day") : false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = viewDate.set({ day });
    calendarDays.push({
      date: d,
      isCurrentMonth: true,
      isToday: d.hasSame(DateTime.local(), "day"),
      isSelected: selectedDt ? d.hasSame(selectedDt, "day") : false,
    });
  }

  // Next month padding to fill complete weeks (up to 42 cells)
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    const d = endOfMonth.plus({ days: i });
    calendarDays.push({
      date: d,
      isCurrentMonth: false,
      isToday: d.hasSame(DateTime.local(), "day"),
      isSelected: selectedDt ? d.hasSame(selectedDt, "day") : false,
    });
  }

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <TextField
        value={
          selectedDt && selectedDt.isValid
            ? selectedDt.toFormat("cccc, LLL dd, yyyy")
            : ""
        }
        onClick={handleClick}
        label={label}
        placeholder={placeholder}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <CalendarTodayIcon
                  sx={{
                    fontSize: 18,
                    color: isOpen ? "#FF3E00" : "text.secondary",
                  }}
                />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          cursor: disabled ? "default" : "pointer",
          "& .MuiInputBase-input": {
            cursor: disabled ? "default" : "pointer",
            fontWeight: 700,
            fontSize: "0.88rem",
          },
        }}
      />

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              mt: 1,
              width: 320,
              borderRadius: 3,
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
              border: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(246, 241, 215, 0.1)"
                  : "#DDE2E7",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 16px 40px rgba(0, 0, 0, 0.9), 0 0 24px rgba(255, 62, 0, 0.2)"
                  : "0 12px 32px rgba(14, 18, 23, 0.12)",
            },
          },
        }}
      >
        {/* Month Selector */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
            pb: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, fontSize: "0.95rem" }}
          >
            {viewDate.toFormat("MMMM yyyy")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton size="small" onClick={prevMonth} sx={{ p: 0.5 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={nextMonth} sx={{ p: 0.5 }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Weekday Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
            mb: 1,
            textAlign: "center",
          }}
        >
          {weekdays.map((wd) => (
            <Typography
              key={wd}
              variant="caption"
              sx={{
                fontWeight: 800,
                fontSize: "0.72rem",
                color: "text.secondary",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {wd}
            </Typography>
          ))}
        </Box>

        {/* Calendar Matrix */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
          }}
        >
          {calendarDays.map((cell, idx) => (
            <Box
              key={idx}
              onClick={() => selectDay(cell.date)}
              sx={{
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                fontSize: "0.82rem",
                fontWeight: cell.isSelected ? 900 : cell.isToday ? 800 : 600,
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.12s ease",
                background: cell.isSelected
                  ? "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)"
                  : cell.isToday
                    ? "rgba(255, 62, 0, 0.12)"
                    : "transparent",
                color: cell.isSelected
                  ? "#FFFFFF"
                  : !cell.isCurrentMonth
                    ? "text.disabled"
                    : cell.isToday
                      ? "#FF3E00"
                      : "text.primary",
                opacity: !cell.isCurrentMonth ? 0.4 : 1,
                border:
                  cell.isToday && !cell.isSelected
                    ? "1px solid rgba(255, 62, 0, 0.5)"
                    : "1px solid transparent",
                "&:hover": {
                  background: cell.isSelected
                    ? "linear-gradient(135deg, #FF5722 0%, #FF1744 100%)"
                    : "rgba(255, 62, 0, 0.16)",
                  color: cell.isSelected ? "#FFFFFF" : "#FF3E00",
                  transform: "scale(1.05)",
                },
              }}
            >
              {cell.date.day}
            </Box>
          ))}
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            size="small"
            variant="text"
            onClick={goToToday}
            sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#FF3E00" }}
          >
            Today
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={handleClose}
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              color: "text.secondary",
            }}
          >
            Close
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
