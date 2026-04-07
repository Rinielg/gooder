import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Calendar } from "./calendar"

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  tags: ['autodocs'],
  component: Calendar,
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    )
  },
}

export const NoSelectedDate: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    )
  },
}

export const DisabledPastDates: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={{ before: new Date() }}
        className="rounded-md border"
      />
    )
  },
}
