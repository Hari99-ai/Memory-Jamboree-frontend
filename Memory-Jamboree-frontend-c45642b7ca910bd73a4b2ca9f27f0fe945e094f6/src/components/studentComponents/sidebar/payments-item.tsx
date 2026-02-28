import { Link } from "react-router-dom"
import { CreditCard } from "lucide-react"
import { cn } from "../../../lib/utils"

interface PaymentsItemProps {
  active?: boolean
}

export default function PaymentsItem({ active = false }: PaymentsItemProps) {
  return (
    <Link
      to="/payments"
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-[#245cab]/10 text-[#245cab]" : "text-[#0F1114DE] hover:bg-[#245cab]/5 hover:text-[#245cab]",
      )}
    >
      <CreditCard className="h-5 w-5" />
      <span>Payments & Subscriptions</span>
    </Link>
  )
}
