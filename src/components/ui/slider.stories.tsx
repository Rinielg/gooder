import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Slider } from "./slider"

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  tags: ['autodocs'],
  component: Slider,
  argTypes: {
    max: { control: "number" },
    step: { control: "number" },
  },
}

export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <Slider {...args} />
    </div>
  ),
}

export const CustomMaxAndStep: Story = {
  args: {
    defaultValue: [5],
    max: 10,
    step: 0.5,
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <Slider {...args} />
    </div>
  ),
}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <Slider {...args} />
    </div>
  ),
}

export const SmallRange: Story = {
  args: {
    defaultValue: [10],
    max: 100,
    step: 10,
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <Slider {...args} />
    </div>
  ),
}
