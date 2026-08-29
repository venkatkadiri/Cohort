import React, { useState } from "react";
import { DateTime } from "luxon";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

export interface CohortDatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (newDate: string) => void;
  label?: string;
  minDate?: string;
}

export function CohortDatePicker({
  value,
  onChange,
  label = "Date",
  minDate,
}: CohortDatePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const selectedDt = value ? DateTime.fromISO(value) : DateTime.local();
  const [viewDate, setViewDate] = useState<DateTime>(
    selectedDt.isValid ? selectedDt : DateTime.local()
  );

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (selectedDt.isValid) setViewDate(selectedDt);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePrevMonth = () => {
    setViewDate((d) => d.minus({ months: 1 }));
  };

  const handleNextMonth = () => {
    setViewDate((d) => d.plus({ months: 1 }));
  };

  const handleSelectDay = (dayDt: DateTime) => {
    onChange(dayDt.toFormat("yyyy-MM-dd"));
    handleClose();
  };

  const startOfMonth = viewDate.startOf("month");
  const firstDayOfGrid = startOfMonth.minus({ days: startOfMonth.weekday % 7 });
  const gridDays: DateTime[] = Array.from({ length: 42 }, (_, i) =>
    firstDayOfGrid.plus({ days: i })
  );

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const todayISO = DateTime.local().toFormat("yyyy-MM-dd");

  const minDt = minDate ? DateTime.fromISO(minDate) : null;

  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 0.8,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "text.secondary",
            fontFamily: "'Fira Code', monospace",
            fontSize: "0.72rem",
          }}
        >
          {label}
        </Typography>
      )}

      {/* Trigger Button */}
      <Box
        onClick={handleOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.2,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: Boolean(anchorEl) ? "#FF3E00" : "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#181F2A" : "#FFFFFF",
          cursor: "pointer",
          transition: "all 0.15s ease",
          "&:hover": {
            borderColor: "#FF3E00",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 62, 0, 0.08)"
                : "rgba(255, 62, 0, 0.04)",
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: "0.88rem",
            color: value ? "text.primary" : "text.disabled",
          }}
        >
          {selectedDt.isValid
            ? selectedDt.toFormat("cccc, LLL dd, yyyy")
            : "Select a date"}
        </Typography>
        <CalendarTodayOutlinedIcon
          sx={{ fontSize: 18, color: "#FF3E00", opacity: 0.9 }}
        />
      </Box>

      {/* Popover */}
      <Popover
        open={Boolean(anchorEl)}
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
        {/* Month Header */}
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
            <IconButton size="small" onClick={handlePrevMonth} sx={{ p: 0.5 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleNextMonth} sx={{ p: 0.5 }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Weekday Names */}
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

        {/* Calendar Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
          }}
        >
          {gridDays.map((day, idx) => {
            const dayISO = day.toFormat("yyyy-MM-dd");
            const isCurrentMonth = day.month === viewDate.month;
            const isSelected = value === dayISO;
            const isToday = todayISO === dayISO;
            const isDisabled = Boolean(minDt && day < minDt.startOf("day"));

            return (
              <Box
                key={idx}
                onClick={() => !isDisabled && handleSelectDay(day)}
                sx={{
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  fontSize: "0.82rem",
                  fontWeight: isSelected ? 900 : isToday ? 800 : 600,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  userSelect: "none",
                  transition: "all 0.12s ease",
                  background: isSelected
                    ? "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)"
                    : isToday
                      ? "rgba(255, 62, 0, 0.12)"
                      : "transparent",
                  color: isSelected
                    ? "#FFFFFF"
                    : isDisabled
                      ? "text.disabled"
                      : !isCurrentMonth
                        ? "text.disabled"
                        : isToday
                          ? "#FF3E00"
                          : "text.primary",
                  opacity: isDisabled ? 0.35 : !isCurrentMonth ? 0.45 : 1,
                  border:
                    isToday && !isSelected
                      ? "1px solid rgba(255, 62, 0, 0.5)"
                      : "1px solid transparent",
                  "&:hover": !isDisabled
                    ? {
                        background: isSelected
                          ? "linear-gradient(135deg, #FF5722 0%, #FF1744 100%)"
                          : "rgba(255, 62, 0, 0.16)",
                        color: isSelected ? "#FFFFFF" : "#FF3E00",
                        transform: "scale(1.05)",
                      }
                    : undefined,
                }}
              >
                {day.day}
              </Box>
            );
          })}
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
            onClick={() => handleSelectDay(DateTime.local())}
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
