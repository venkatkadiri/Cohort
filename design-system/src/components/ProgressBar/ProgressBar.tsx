import * as React from "react";
import MuiBox from "@mui/material/Box";
import MuiLinearProgress from "@mui/material/LinearProgress";

export interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  stepsLabels?: string[];
}

export function ProgressBar({
  currentStep,
  totalSteps = 3,
  stepsLabels = ["Select Time Slot", "Topic & Details", "Confirmed"],
}: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  const currentLabel = stepsLabels[currentStep - 1] || `Step ${currentStep}`;

  return (
    <MuiBox sx={{ mb: 3 }}>
      <MuiBox
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
          fontSize: "0.75rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "text.secondary",
          fontFamily: "'Fira Code', monospace",
        }}
      >
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span style={{ color: "#FF3E00" }}>{currentLabel}</span>
      </MuiBox>
      <MuiLinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.06)"
              : "rgba(0, 0, 0, 0.06)",
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)",
            borderRadius: 4,
          },
        }}
      />
    </MuiBox>
  );
}
