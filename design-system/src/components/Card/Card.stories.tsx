import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Typography, Box } from "@mui/material";
import { Button } from "../Button/Button";
import { Badge } from "../Badge/Badge";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card sx={{ maxWidth: 440 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Badge tone="flame">PRO Track</Badge>
        <Badge tone="cyan">45 mins</Badge>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        Fullstack System Architecture
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5, lineHeight: 1.6 }}>
        Deep-dive into microservice orchestration, gRPC streaming, and distributed caching patterns with lead mentors.
      </Typography>
      <Button variant="primary" size="sm">
        Book Session
      </Button>
    </Card>
  ),
};

export const InteractiveGlow: Story = {
  render: () => (
    <Card interactive sx={{ maxWidth: 380 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Badge tone="purple">Code Critique</Badge>
        <span style={{ fontSize: "1.2rem" }}>⚡</span>
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
        Next.js &amp; Tailwind Mastery
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
        1:1 code review over Google Meet
      </Typography>
      <Button variant="secondary" size="sm" fullWidth>
        Select Slot &rarr;
      </Button>
    </Card>
  ),
};
