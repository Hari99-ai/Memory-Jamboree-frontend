import * as React from "react"
import {
  ContextMenu as RadixContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@radix-ui/react-context-menu"
import { cn } from "../../lib/utils"

export const ContextMenu = RadixContextMenu

export const ContextMenuTriggerWrapper = ContextMenuTrigger

export function ContextMenuContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ContextMenuContent className={cn("rounded-md border bg-background p-2 shadow")}>
      {children}
    </ContextMenuContent>
  )
}

export function ContextMenuItemWrapper(
  props: React.ComponentPropsWithoutRef<typeof ContextMenuItem>
) {
  return <ContextMenuItem className={cn("p-2 cursor-pointer")}{...props} />
}
