import * as React from "react"
import {
  NavigationMenu as RadixNavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu"
import { cn } from "../../lib/utils"

export const NavigationMenu = RadixNavigationMenu
export const NavigationMenuListWrapper = NavigationMenuList
export const NavigationMenuItemWrapper = NavigationMenuItem
export const NavigationMenuTriggerWrapper = NavigationMenuTrigger
export const NavigationMenuContentWrapper = NavigationMenuContent
export const NavigationMenuLinkWrapper = (props: React.ComponentPropsWithoutRef<typeof NavigationMenuLink>) => (
  <NavigationMenuLink className={cn("px-3 py-1 rounded-md hover:bg-accent")} {...props}/>
)
