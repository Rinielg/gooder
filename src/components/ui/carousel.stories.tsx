import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./carousel"

const meta: Meta<typeof Carousel> = {
  title: "UI/Carousel",
  tags: ['autodocs'],
  component: Carousel,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xs mx-auto">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Carousel>

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="flex aspect-square items-center justify-center rounded-md border bg-card p-6">
              <span className="text-3xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const ThirdsLayout: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 9 }).map((_, index) => (
          <CarouselItem key={index} className="basis-1/3">
            <div className="flex aspect-square items-center justify-center rounded-md border bg-card p-2">
              <span className="text-lg font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const Vertical: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-xs mx-auto py-16">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Carousel orientation="vertical" className="w-full max-w-xs">
      <CarouselContent className="-mt-4 h-[200px]">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="pt-4 basis-1/2">
            <div className="flex items-center justify-center rounded-md border bg-card p-6">
              <span className="text-2xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}
