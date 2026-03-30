import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "./chart"

const barData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const meta: Meta<typeof ChartContainer> = {
  title: "UI/Chart",
  tags: ['autodocs'],
  component: ChartContainer,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof ChartContainer>

export const BarChartDefault: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart data={barData}>
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
}

export const LineChartDefault: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <LineChart data={barData}>
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="desktop"
          stroke="var(--color-desktop)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="mobile"
          stroke="var(--color-mobile)"
          strokeWidth={2}
        />
      </LineChart>
    </ChartContainer>
  ),
}

export const SingleSeries: Story = {
  render: () => {
    const singleConfig = {
      desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig

    return (
      <ChartContainer config={singleConfig} className="min-h-[300px] w-full">
        <BarChart data={barData}>
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        </BarChart>
      </ChartContainer>
    )
  },
}
