import * as React from "react";
import {
  DropdownMenu as RadixDropdownMenu,
  DropdownMenuTrigger as RadixDropdownMenuTrigger,
  DropdownMenuContent as RadixDropdownMenuContent,
  DropdownMenuItem as RadixDropdownMenuItem,
  DropdownMenuCheckboxItem as RadixDropdownMenuCheckboxItem,
  DropdownMenuRadioItem as RadixDropdownMenuRadioItem,
  DropdownMenuLabel as RadixDropdownMenuLabel,
  DropdownMenuSeparator as RadixDropdownMenuSeparator,
  DropdownMenuRadioGroup as RadixDropdownMenuRadioGroup,
} from "@radix-ui/react-dropdown-menu";

import { cn } from "../../lib/utils";

// Root wrapper
export const DropdownMenu = RadixDropdownMenu;

// Trigger
export const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenuTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuTrigger>
>((props, ref) => (
  <RadixDropdownMenuTrigger ref={ref} {...props} />
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// Content
export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuContent>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuContent
    ref={ref}
    className={cn("rounded-md border bg-background p-1 shadow-md", className)}
    {...props}
  />
));
DropdownMenuContent.displayName = "DropdownMenuContent";

// Item
export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuItem>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuItem
    ref={ref}
    className={cn("px-2 py-1 cursor-pointer", className)}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

// Checkbox Item
export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenuCheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuCheckboxItem>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuCheckboxItem
    ref={ref}
    className={cn("px-2 py-1", className)}
    {...props}
  />
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

// Radio Group
export const DropdownMenuRadioGroup = RadixDropdownMenuRadioGroup;

// Radio Item
export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenuRadioItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuRadioItem>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuRadioItem
    ref={ref}
    className={cn("px-2 py-1", className)}
    {...props}
  />
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

// Label
export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenuLabel>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuLabel>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuLabel
    ref={ref}
    className={cn("px-2 py-1 text-xs uppercase text-muted-foreground", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

// Separator
export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenuSeparator>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuSeparator>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenuSeparator
    ref={ref}
    className={cn("my-1 h-px bg-border", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
