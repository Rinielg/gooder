import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "./input"
import { Label } from "./label"

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  tags: ['autodocs'],
  component: Input,
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
}

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "you@example.com",
  },
}

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
}

export const Number: Story = {
  args: {
    type: "number",
    placeholder: "0",
  },
}

export const Search: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="you@example.com" />
    </div>
  ),
}

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Type something here...",
  },
}
