import * as React from "react"
import {
  Collapsible as RadixCollapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible"
import { cn } from "../../lib/utils"

export const Collapsible = RadixCollapsible

export function CollapsibleTriggerWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CollapsibleTrigger className={cn("py-2")}>{children}</CollapsibleTrigger>
  )
}

export function CollapsibleContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CollapsibleContent className={cn("pb-2 text-sm")}>{children}</CollapsibleContent>
  )
}
