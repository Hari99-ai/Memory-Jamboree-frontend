import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "../../lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    {...props}
    ref={ref}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full transition-transform bg-primary", indicatorClassName)}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName
