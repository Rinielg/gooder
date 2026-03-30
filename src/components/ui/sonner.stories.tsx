import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { toast } from "sonner"
import { Toaster } from "./sonner"
import { Button } from "./button"

const meta: Meta = {
  title: "UI/Sonner",
  tags: ['autodocs'],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
}

export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast("Event has been created")}>
      Show Toast
    </Button>
  ),
}

export const Success: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.success("Changes saved successfully")}
    >
      Show Success Toast
    </Button>
  ),
}

export const Error: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.error("Something went wrong")}
    >
      Show Error Toast
    </Button>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event created", {
          description: "Monday, January 3rd at 6:00pm",
        })
      }
    >
      Show Toast with Description
    </Button>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast("Default notification")}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("Operation successful")}
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("An error occurred")}
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning("Please review your input")}
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.info("New update available")}
      >
        Info
      </Button>
    </div>
  ),
}
