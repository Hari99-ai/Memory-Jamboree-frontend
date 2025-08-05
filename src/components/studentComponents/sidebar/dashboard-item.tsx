import {Link} from  "react-router-dom"
import { LucideIcon, Home, Calendar, Edit, BarChart } from "lucide-react"
import { cn } from "../../../lib/utils"

const icons: Record<string, LucideIcon> = {
  home: Home,
  calendar: Calendar,
  edit: Edit,
  "bar-chart": BarChart,
}

export interface DashboardItemProps {
  title: string
  href: string
  icon: string
}

export default function DashboardItem({ title, href, icon }: DashboardItemProps) {
  const Icon = icons[icon]
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-2 rounded-md p-2 hover:bg-gray-300",
      )}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {title}
    </Link>
  )
}
