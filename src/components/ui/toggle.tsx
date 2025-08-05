import * as React from "react"
import {
  ToggleGroup as RadixToggleGroup,
  ToggleGroupItem,
} from "@radix-ui/react-toggle-group"
import { cn } from "../../lib/utils"


export const ToggleGroup = RadixToggleGroup

export const ToggleGroupItemWrapper = React.forwardRef<
  React.ElementRef<typeof ToggleGroupItem>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupItem>
>(({ className, ...props }, ref) => (
  <ToggleGroupItem
    ref={ref}
    className={cn("px-3 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground", className)}
    {...props}
  />
))
ToggleGroupItemWrapper.displayName = "ToggleGroupItem"
