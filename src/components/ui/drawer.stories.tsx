import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "./button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer"

const meta: Meta<typeof Drawer> = {
  title: "UI/Drawer",
  tags: ['autodocs'],
  component: Drawer,
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof Drawer>

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move Goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Adjust the slider to set your daily step goal. The recommended
            amount is 10,000 steps per day.
          </p>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const WithFormContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Add Item</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add New Item</DrawerTitle>
          <DrawerDescription>
            Fill in the details below to add a new item to your list.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title</label>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              placeholder="Enter title"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Enter description"
              rows={3}
            />
          </div>
        </div>
        <DrawerFooter>
          <Button>Save</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}
