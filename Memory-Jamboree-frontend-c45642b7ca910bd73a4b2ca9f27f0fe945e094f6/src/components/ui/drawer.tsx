import * as React from "react"
import {
  Dialog as RadixDialog,
  DialogTrigger,
  Portal,
  Overlay,
  Content,
  Close,
} from "@radix-ui/react-dialog"
import { cn } from "../../lib/utils"

export const Drawer = RadixDialog
export const DrawerTriggerWrapper = DialogTrigger

export function DrawerContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Portal>
      <Overlay className={cn("fixed inset-0 bg-black/50")} />
      <Content className={cn("fixed right-0 top-0 h-full w-80 bg-background p-4 shadow-lg")}>
        {children}
        <Close className={cn("absolute top-2 right-2")} />
      </Content>
    </Portal>
  )
}
