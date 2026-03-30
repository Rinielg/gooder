import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Switch } from "./switch"
import { Label } from "./label"

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  tags: ['autodocs'],
  component: Switch,
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

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
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
}
