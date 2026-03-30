import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { AspectRatio } from "./aspect-ratio"

const meta: Meta<typeof AspectRatio> = {
  title: "UI/AspectRatio",
  tags: ['autodocs'],
  component: AspectRatio,
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof AspectRatio>

export const Ratio16by9: Story = {
  name: "16:9",
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-md">
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          16:9 Aspect Ratio
        </div>
      </AspectRatio>
    </div>
  ),
}

export const Ratio4by3: Story = {
  name: "4:3",
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={4 / 3} className="bg-muted rounded-md">
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          4:3 Aspect Ratio
        </div>
      </AspectRatio>
    </div>
  ),
}

export const Ratio1by1: Story = {
  name: "1:1",
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1} className="bg-muted rounded-md">
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          1:1 Aspect Ratio
        </div>
      </AspectRatio>
    </div>
  ),
}

export const WithImage: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Placeholder"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
}
