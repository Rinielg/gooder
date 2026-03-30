import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion"

const meta: Meta<typeof Accordion> = {
  title: "UI/Accordion",
  tags: ['autodocs'],
  component: Accordion,
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof Accordion>

export const SingleCollapsible: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the other components.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It is animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>
          Content for the first section. Multiple items can be open at once.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>
          Content for the second section. Try opening this alongside others.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third section</AccordionTrigger>
        <AccordionContent>
          Content for the third section. All three can be expanded simultaneously.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const SingleNonCollapsible: Story = {
  render: () => (
    <Accordion type="single" defaultValue="item-1" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Always one open</AccordionTrigger>
        <AccordionContent>
          This accordion requires one item to always be open.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Click to switch</AccordionTrigger>
        <AccordionContent>
          Clicking another item will close the previous one.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
