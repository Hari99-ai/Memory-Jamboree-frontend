import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "../../lib/utils"

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root className={cn("relative overflow-hidden", className)} {...props} ref={ref}>
    <ScrollAreaPrimitive.Viewport className="w-full h-full">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="w-2">
      <ScrollAreaPrimitive.Thumb className="rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Scrollbar orientation="horizontal" className="h-2">
      <ScrollAreaPrimitive.Thumb className="rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner className="bg-background" />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = "ScrollArea"
