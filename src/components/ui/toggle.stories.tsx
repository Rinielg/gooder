import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bold, Italic, Underline } from "lucide-react"
import { Toggle } from "./toggle"

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  tags: ['autodocs'],
  component: Toggle,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    disabled: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
}

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  render: (args) => (
    <Toggle {...args} aria-label="Toggle italic">
      <Italic className="h-4 w-4" />
    </Toggle>
  ),
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
}

export const Large: Story = {
  args: {
    size: "lg",
  },
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
}

export const WithText: Story = {
  render: (args) => (
    <Toggle {...args} aria-label="Toggle underline">
      <Underline className="h-4 w-4" />
      Underline
    </Toggle>
  ),
}

export const Pressed: Story = {
  args: {
    defaultPressed: true,
  },
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
}
