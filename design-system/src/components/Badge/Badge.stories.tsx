import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";
import { Box } from "@mui/material";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const FireshipBadges: Story = {
  render: () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      <Badge tone="flame">🔥 FLAME</Badge>
      <Badge tone="pro">⚡ PRO</Badge>
      <Badge tone="purple">TypeScript</Badge>
      <Badge tone="cyan">45 MINS</Badge>
      <Badge tone="success">CONFIRMED</Badge>
      <Badge tone="danger">BLOCKED</Badge>
      <Badge tone="neutral">[UTC+7]</Badge>
    </Box>
  ),
};
