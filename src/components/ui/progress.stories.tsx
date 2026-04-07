import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Progress } from "./progress"

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  tags: ['autodocs'],
  component: Progress,
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
}

export default meta
type Story = StoryObj<typeof Progress>

export const Empty: Story = {
  args: {
    value: 0,
  },
}

export const Quarter: Story = {
  args: {
    value: 25,
  },
}

export const Half: Story = {
  args: {
    value: 50,
  },
}

export const ThreeQuarters: Story = {
  args: {
    value: 75,
  },
}

export const Full: Story = {
  args: {
    value: 100,
  },
}
