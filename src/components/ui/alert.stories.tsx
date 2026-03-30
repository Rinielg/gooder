import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { AlertCircle, Info, Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./alert"

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  tags: ['autodocs'],
  component: Alert,
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: () => (
    <Alert className="w-[450px]">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-[450px]">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

export const WithInfoIcon: Story = {
  render: () => (
    <Alert className="w-[450px]">
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is an informational alert with additional context for the user.
      </AlertDescription>
    </Alert>
  ),
}

export const DescriptionOnly: Story = {
  render: () => (
    <Alert className="w-[450px]">
      <AlertDescription>
        A simple alert with only a description and no title.
      </AlertDescription>
    </Alert>
  ),
}
