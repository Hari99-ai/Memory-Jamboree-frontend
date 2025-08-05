import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input",
        secondary: "bg-muted text-muted-foreground", // ✅ add this line
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);


export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "outline" | "secondary"

}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div className={cn(badgeVariants({ variant }), className)} ref={ref} {...props}>
        {children}
      </div>
    )
  },
)
Badge.displayName = "Badge"
