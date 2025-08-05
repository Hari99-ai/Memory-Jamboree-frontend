import * as React from "react";
import { Switch as RadixSwitch } from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof RadixSwitch> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<
  React.ElementRef<typeof RadixSwitch>,
  SwitchProps
>(({ className, checked, onCheckedChange, ...props }, ref) => (
  <RadixSwitch
    ref={ref}
    checked={checked}
    onCheckedChange={onCheckedChange}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=checked]:bg-primary",
      className
    )}
    {...props}
  >
    <span
      className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 translate-x-0 data-[state=checked]:translate-x-5"
      )}
    />
  </RadixSwitch>
));
Switch.displayName = "Switch";
