import * as React from "react"
import * as BreadcrumbPrimitive from "@radix-ui/react-navigation-menu"
import { cn } from "../../lib/utils"

export function Breadcrumb({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbPrimitive.Root className={cn("flex space-x-2")}>
      {children}
    </BreadcrumbPrimitive.Root>
  )
}

export function BreadcrumbItem({ children }: { children: React.ReactNode }) {
  return <BreadcrumbPrimitive.Item>{children}</BreadcrumbPrimitive.Item>
}

export function BreadcrumbLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} className={cn("text-sm hover:underline")} />
}
