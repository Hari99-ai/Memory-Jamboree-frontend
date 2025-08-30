import { useState, useEffect } from "react"
import {
  Award,
  Calendar,
  // ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  // CreditCard,
  GamepadIcon,
  LayoutDashboard,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"
import { useQuery } from "@tanstack/react-query"
import { getUserById } from "../../lib/api"

type SidebarItem = {
  title: string
  icon: React.ElementType
  path: string
  // hasSubItems?: boolean;
  // subItems?: {
  //   title: string;
  //   path: string;
  //   key: string;
  // }[];
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  // const [expandedHistory, setExpandedHistory] = useState(false)
  // const [userName, setUserName] = useState({ firstName: "" })

  const navigate = useNavigate()

  const items: SidebarItem[] = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { title: "My Events", icon: Calendar, path: "/dashboard/events" },
    { title: "Practice Tests", icon: GamepadIcon, path: "/dashboard/practiceTests" },
    { title: "Results & Certificates", icon: Award, path: "/dashboard/results" },
    { title: "My Practices", icon: Clock, path: "/dashboard/history"},
    // {
    // title: "History",
    // icon: Clock,
    // path: "/dashboard/history",
    // hasSubItems: true,
    // subItems: [
    //   {
    //     title: "Practice Test History",
    //     path: "/dashboard/history/practice-tests", // ✅ Correct path
    //     key: "history-practice",
    //   },
    //   // {
    //   //   title: "Event History",
    //   //   path: "/dashboard/history/events", // ✅ Added missing path
    //   //   key: "history-events",
    //   // },
    // ],
  // },
    // { title: "Payments & Subscriptions", icon: CreditCard, path: "/dashboard/payments" },
  ]

  const [id, setId] = useState(() => sessionStorage.getItem("userId"));
  const [token, setToken] = useState(() =>
    sessionStorage.getItem("auth_token")
  );

  useEffect(() => {
    const storedId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("auth_token");
    if (storedId || token) {
      setId(storedId);
      setToken(token);
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id!, token!),
    refetchOnWindowFocus: false,
  });

  // Provide default values or wait for user to load
  // const image = user?.image || "";
  const name = user?.fname || "";
  // const email = user?.email || "";

  // useEffect(() => {
  //   const storedName = sessionStorage.getItem("user_name")
  //   if (storedName) {
  //     setUserName({ firstName: storedName.split(" ")[0] })
  //   }

  //   const fetchName = async () => {
  //     const token = sessionStorage.getItem("auth_token")
  //     const userId = sessionStorage.getItem("userId")
  //     try {
  //       const res = await fetch(
  //         `https://aidev.gravitinfosystems.com:5000/admin/get-user/${userId}`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       )
  //       if (!res.ok) throw new Error("Failed to fetch profile.")
  //       const data = await res.json()
  //       setUserName({ firstName: data.fname || "" })
  //       sessionStorage.setItem("user_name", `${data.fname} ${data.lname}`)
  //     } catch (err) {
  //       console.error("Error fetching Name:", err)
  //     }
  //   }
  //   fetchName()
  // }, [])

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-blue-200 transition-all duration-300 ",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className="flex flex-col">
        <div className={cn("p-4", collapsed && "p-2")}>
          {!collapsed && (
            <div className="mb-6 text-lg font-medium">
              Hi{" "}
              <span className="font-bold text-[#040c13]">
                {name}
              </span>
            </div>
          )}
        </div>

        <nav className={cn("space-y-1", collapsed ? "px-1" : "px-2")}>
          {items.map((item) => {
            // const isHistory = item.path === "/dashboard/history"

            return (
              <div key={item.path}>
                <button
                  onClick={() => {
                    // if (isHistory) {
                    //   setExpandedHistory((prev) => !prev)
                    // } else {
                      navigate(item.path)
                    // }
                  }}
                  className={cn(
                    "flex items-center w-full text-left gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-[#245cab]/10 hover:text-[#245cab]",
                    collapsed && "justify-center px-2",
                  )}
                >
                  {collapsed ? (
                    <item.icon className="h-5 w-5" />
                  ) : (
                    <>
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1">{item.title}</span>
                    </>
                  )}
                  {/* {!collapsed && (
                    <>
                      {item.hasSubItems && (
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", expandedHistory ? "rotate-180" : "rotate-0")}
                        />
                      )}
                    </>
                  )} */}
                </button>

                {/* Sub-items for History */}
                {/* {isHistory && expandedHistory && !collapsed && item.subItems && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.key}
                        onClick={() => navigate(subItem.path)}
                        className="block w-full text-left text-sm px-3 py-2 rounded-md hover:bg-[#245cab]/10 hover:text-[#245cab] transition-colors"
                      >
                        {subItem.title}
                      </button>
                    ))}
                  </div>
                )} */}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}


