import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Label } from "./label"

const meta: Meta<typeof RadioGroup> = {
  title: "UI/RadioGroup",
  tags: ['autodocs'],
  component: RadioGroup,
}

export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithDisabledItem: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="d1" />
        <Label htmlFor="d1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="d2" disabled />
        <Label htmlFor="d2">Option 2 (disabled)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="d3" />
        <Label htmlFor="d3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="sm" className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="sm" id="h1" />
        <Label htmlFor="h1">Small</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="md" id="h2" />
        <Label htmlFor="h2">Medium</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="lg" id="h3" />
        <Label htmlFor="h3">Large</Label>
      </div>
    </RadioGroup>
  ),
}
