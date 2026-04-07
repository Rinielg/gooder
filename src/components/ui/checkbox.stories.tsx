import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Checkbox } from "./checkbox"
import { Label } from "./label"

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  tags: ['autodocs'],
  component: Checkbox,
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Unchecked: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}
