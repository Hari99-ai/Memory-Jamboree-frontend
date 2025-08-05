import * as React from "react"
import {
  RadioGroup as RadixRadioGroup,
  RadioGroupItem,
} from "@radix-ui/react-radio-group"
import { cn } from "../../lib/utils"

export const RadioGroup = RadixRadioGroup

export const RadioGroupItemWrapper = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  React.ComponentPropsWithoutRef<typeof RadioGroupItem>
>(({ className, ...props }, ref) => (
  <RadioGroupItem
    ref={ref}
    className={cn("h-4 w-4 rounded-full border border-input focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}
    {...props}
  />
))
RadioGroupItemWrapper.displayName = "RadioGroupItem"
