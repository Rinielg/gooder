import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  tags: ['autodocs'],
  component: Avatar,
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://github.com/shadcn.png"
        alt="@shadcn"
      />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/nonexistent.png" alt="User" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

export const Small: Story = {
  render: () => (
    <Avatar className="h-6 w-6">
      <AvatarImage
        src="https://github.com/shadcn.png"
        alt="@shadcn"
      />
      <AvatarFallback className="text-xs">CN</AvatarFallback>
    </Avatar>
  ),
}

export const Large: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarImage
        src="https://github.com/shadcn.png"
        alt="@shadcn"
      />
      <AvatarFallback className="text-lg">CN</AvatarFallback>
    </Avatar>
  ),
}

export const ExtraLarge: Story = {
  render: () => (
    <Avatar className="h-24 w-24">
      <AvatarImage
        src="https://github.com/shadcn.png"
        alt="@shadcn"
      />
      <AvatarFallback className="text-2xl">CN</AvatarFallback>
    </Avatar>
  ),
}

export const Group: Story = {
  render: () => (
    <div className="flex -space-x-3">
      <Avatar className="border-2 border-background">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback>EF</AvatarFallback>
      </Avatar>
    </div>
  ),
}
