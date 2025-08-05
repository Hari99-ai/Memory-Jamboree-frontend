import * as React from "react"
import {
  Slider as RadixSlider,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from "@radix-ui/react-slider"
import { cn } from "../../lib/utils"

export const Slider = React.forwardRef<
  React.ElementRef<typeof RadixSlider>,
  React.ComponentPropsWithoutRef<typeof RadixSlider>
>(({ className, ...props }, ref) => (
  <RadixSlider className={cn("relative flex w-full touch-none select-none items-center", className)} {...props} ref={ref}>
    <SliderTrack className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
      <SliderRange className="absolute h-full bg-primary" />
    </SliderTrack>
    <SliderThumb className="block h-5 w-5 rounded-[10px] bg-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
  </RadixSlider>
))
Slider.displayName = "Slider"
