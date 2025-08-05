import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../components/ui/alert-dialog"
import { LogOutIcon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../hooks/useAuth"
 
export function LogoutDialogButton() {
  const { logout } = useAuth()
 
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="flex w-full items-center gap-3 rounded p-2 text-[12px] text-white  hover:text-blue-200 font-semibold"
        >
          <LogOutIcon className="w-5 h-5 shrink-0 text-white hover:text-blue-200" />
          Logout
        </button>
      </AlertDialogTrigger>
 
      <AlertDialogContent className="max-w-sm">
        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
        <AlertDialogDescription>
          This will end your current session.
        </AlertDialogDescription>
        <div className="flex justify-end mt-4 space-x-2">
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}