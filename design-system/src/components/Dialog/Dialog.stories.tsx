import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmDialog, AlertDialog } from "./Dialog";
import { Button } from "../Button/Button";
import { Box } from "@mui/material";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Components/Dialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const DangerConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete Time Slot
        </Button>
        <ConfirmDialog
          isOpen={open}
          type="danger"
          title="Delete Time Slot?"
          message="Are you sure you want to permanently remove this time slot? It will no longer be available for booking."
          confirmText="Delete Slot"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Box>
    );
  },
};

export const SuccessAlert: StoryObj<typeof AlertDialog> = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Show Booking Confirmation
        </Button>
        <AlertDialog
          isOpen={open}
          type="success"
          title="Session Confirmed! 🚀"
          message="Your mentorship session has been scheduled with Google Meet link sent to your email."
          onClose={() => setOpen(false)}
        />
      </Box>
    );
  },
};
