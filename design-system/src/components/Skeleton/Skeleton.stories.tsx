import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, CardSkeleton, GridSkeleton } from "./Skeleton";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 400 }}>
      <Skeleton width="60%" height={28} borderRadius={1.5} />
      <Skeleton width="100%" height={16} />
      <Skeleton width="85%" height={16} />
      <Skeleton width="40%" height={16} />
    </Stack>
  ),
};

export const CardLoadingState: Story = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <CardSkeleton />
    </Box>
  ),
};

export const GridLoadingState: Story = {
  render: () => <GridSkeleton count={3} />,
};
