import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CohortDatePicker } from "./CohortDatePicker";
import { Box, Typography } from "@mui/material";
import { DateTime } from "luxon";

const meta: Meta<typeof CohortDatePicker> = {
  title: "Components/DatePicker",
  component: CohortDatePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CohortDatePicker>;

export const Interactive: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<string>(
      DateTime.local().toFormat("yyyy-MM-dd")
    );

    return (
      <Box sx={{ maxWidth: 360 }}>
        <CohortDatePicker
          label="Select Office Hours Date"
          value={selectedDate}
          onChange={setSelectedDate}
        />
        <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary" }}>
          Selected ISO Date: <strong>{selectedDate}</strong>
        </Typography>
      </Box>
    );
  },
};
