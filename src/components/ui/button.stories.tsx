import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Loader2, ChevronRight, Mail } from "lucide-react"
import { Button } from "./button"

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  tags: ['autodocs'],
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
}

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
}

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
}

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
}

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
}

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
}

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
}

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
}

export const Icon: Story = {
  args: {
    size: "icon",
    variant: "outline",
  },
  render: (args) => (
    <Button {...args}>
      <ChevronRight className="h-4 w-4" />
    </Button>
  ),
}

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <Button {...args}>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Please wait
    </Button>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Button>
      <Mail className="mr-2 h-4 w-4" />
      Login with Email
    </Button>
  ),
}

export const AsChild: Story = {
  render: () => (
    <Button asChild>
      <a href="/">Go Home</a>
    </Button>
  ),
}
