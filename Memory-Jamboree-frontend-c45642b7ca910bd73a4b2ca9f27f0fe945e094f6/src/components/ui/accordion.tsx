import * as React from "react"
import {
  Accordion as RadixAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion"
import { cn } from "../../lib/utils"

export const Accordion = RadixAccordion

export function AccordionItemWrapper({
  children,
  value,
}: {
  children: React.ReactNode
  value: string
}) {
  return <AccordionItem value={value}>{children}</AccordionItem>
}

export function AccordionTriggerWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AccordionTrigger className={cn("py-2")}>{children}</AccordionTrigger>
  )
}

export function AccordionContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AccordionContent className={cn("pb-2 text-sm")}>{children}</AccordionContent>
  )
}
