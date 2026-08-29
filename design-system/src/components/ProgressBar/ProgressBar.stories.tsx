import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";
import { Box } from "@mui/material";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    currentStep: {
      control: { type: "number", min: 1, max: 3 },
    },
    totalSteps: {
      control: { type: "number", min: 1, max: 5 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const StepOne: Story = {
  args: {
    currentStep: 1,
    totalSteps: 3,
    stepsLabels: ["Select Date & Time", "Invitee Details", "Confirmed"],
  },
  render: (args) => (
    <Box sx={{ maxWidth: 480 }}>
      <ProgressBar {...args} />
    </Box>
  ),
};

export const StepTwo: Story = {
  args: {
    currentStep: 2,
    totalSteps: 3,
    stepsLabels: ["Select Date & Time", "Invitee Details", "Confirmed"],
  },
  render: (args) => (
    <Box sx={{ maxWidth: 480 }}>
      <ProgressBar {...args} />
    </Box>
  ),
};

export const StepThree: Story = {
  args: {
    currentStep: 3,
    totalSteps: 3,
    stepsLabels: ["Select Date & Time", "Invitee Details", "Confirmed"],
  },
  render: (args) => (
    <Box sx={{ maxWidth: 480 }}>
      <ProgressBar {...args} />
    </Box>
  ),
};
