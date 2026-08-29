import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Label, Input, Select, Textarea, FormError, EmptyState, Spinner } from "./Form";
import { Button } from "../Button/Button";
import { Box } from "@mui/material";

const meta: Meta = {
  title: "Components/Form",
  tags: ["autodocs"],
};

export default meta;

export const InputsAndControls = {
  render: () => (
    <Box sx={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Label>Invitee Full Name</Label>
        <Input placeholder="e.g. Grace Hopper" defaultValue="Ada Lovelace" />
      </Box>

      <Box>
        <Label>Preferred Meeting Mode</Label>
        <Select defaultValue="google-meet">
          <option value="google-meet">Google Meet (Auto-generated Link)</option>
          <option value="zoom">Zoom Video</option>
          <option value="in-person">In-Person Office</option>
        </Select>
      </Box>

      <Box>
        <Label>Session Agenda & Questions</Label>
        <Textarea placeholder="What specific sprint blockers or architecture questions would you like to cover?" />
      </Box>

      <FormError message="A session slot is already booked for this time." />

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button variant="primary" size="md">
          Submit Details
        </Button>
        <Spinner />
      </Box>
    </Box>
  ),
};

export const EmptyStateExample = {
  render: () => (
    <Box sx={{ maxWidth: 500 }}>
      <EmptyState
        title="No Available Slots Found"
        description="This mentor currently has no bookable office hour slots for the selected week. Please check back next week or request a slot."
        action={
          <Button variant="primary" size="sm">
            Request Custom Slot
          </Button>
        }
      />
    </Box>
  ),
};
