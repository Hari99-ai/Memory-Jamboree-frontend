import * as React from "react"
import {
  Menubar as RadixMenubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@radix-ui/react-menubar"
import { cn } from "../../lib/utils"

export const Menubar = RadixMenubar
export const MenubarMenuWrapper = MenubarMenu
export const MenubarTriggerWrapper = MenubarTrigger
export const MenubarContentWrapper = (props: React.ComponentPropsWithoutRef<typeof MenubarContent>) => (
  <MenubarContent className={cn("rounded-md border bg-background p-1 shadow-md")}{...props}/>
)
export const MenubarItemWrapper = (props: React.ComponentPropsWithoutRef<typeof MenubarItem>) => (
  <MenubarItem className={cn("px-2 py-1 cursor-pointer")}{...props}/>
)
