import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger", "pro", "gold"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const FireshipFlame: Story = {
  args: {
    variant: "primary",
    children: "🔥 Book Office Hours",
  },
};

export const CyberOutline: Story = {
  args: {
    variant: "secondary",
    children: "View Architecture Tracks",
  },
};

export const ProAccess: Story = {
  args: {
    variant: "pro",
    children: "⚡ PRO Mentor Access",
  },
};

export const DangerAction: Story = {
  args: {
    variant: "danger",
    children: "Cancel Slot",
  },
};

export const GhostLink: Story = {
  args: {
    variant: "ghost",
    children: "Dismiss",
  },
};
