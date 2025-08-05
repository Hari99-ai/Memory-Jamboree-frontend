import * as React from "react";
// import { Check, Minus } from "lucide-react"; // Optional: for icons
import { cn } from "../../lib/utils"; // if you're using classnames
import { useEffect, useRef } from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, ...props }, ref) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref || defaultRef) as React.RefObject<HTMLInputElement>;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = !!indeterminate;
      }
    }, [resolvedRef, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        className={cn("peer h-4 w-4 shrink-0 rounded-sm border border-primary", className)}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";
export { Checkbox };
