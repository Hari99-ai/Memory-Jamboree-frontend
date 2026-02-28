import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils"; // Make sure you have a `cn` utility for className merging

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, ...props }, ref) => (
  <RadixDialog.Portal>
    <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
    <RadixDialog.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-white p-6 rounded-xl shadow-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg",
        className
      )}
      {...props}
    />
  </RadixDialog.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("mb-4", className)}>{children}</div>;

export const DialogTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <RadixDialog.Title className={cn("text-xl font-bold", className)}>
    {children}
  </RadixDialog.Title>
);

export const DialogDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <RadixDialog.Description className={cn("text-sm text-gray-600", className)}>
    {children}
  </RadixDialog.Description>
);

export const DialogFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mt-4 flex justify-end gap-2", className)}>{children}</div>
);

export const DialogClose = RadixDialog.Close;
