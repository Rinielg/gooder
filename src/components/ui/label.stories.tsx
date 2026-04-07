import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Label } from "./label"
import { Input } from "./input"

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  tags: ['autodocs'],
  component: Label,
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: {
    children: "Label text",
  },
}

export const PairedWithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name">Name</Label>
      <Input type="text" id="name" placeholder="Enter your name" />
    </div>
  ),
}
