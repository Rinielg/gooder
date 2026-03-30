import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Textarea } from "./textarea"
import { Label } from "./label"

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  tags: ['autodocs'],
  component: Textarea,
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {},
}

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Type your message here...",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
}
