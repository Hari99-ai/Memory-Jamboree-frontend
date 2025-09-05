import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarBody } from "../../components/sidebar";
import {
  IconHistory,
  IconApps,
  IconMessage,
  IconCalendar,
  IconSettings,
  IconChevronDown,
} from "@tabler/icons-react";
import { cn } from "../../lib/utils";
import { useLocation } from "react-router-dom";
import { Award, LockKeyhole, MonitorPlay, ClipboardPen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { LogoutDialogButton } from "./AlertDialog";
import { motion, AnimatePresence } from "framer-motion";

// Define main menu structure (without bottom items)
const menuItems = [
  {
    id: "events",
    type: "dropdown",
    title: "Events",
    icon: <IconApps className="size-5" />,
    children: [
      {
        label: "Add Events",
        to: "/admin/events/add",
        icon: <IconMessage className="size-5" />,
      },
      {
        label: "View Events",
        to: "/admin/events/view",
        icon: <IconCalendar className="size-5" />,
      },
    ],
  },
  {
    id: "monitoring",
    type: "single",
    label: "Live Monitoring",
    to: "/admin/monitoring-logs",
    icon: <MonitorPlay className="w-5 h-5 shrink-0" />,
  },
  {
    id: "paractice-test",
    type: "single",
    label: "Practice Test",
    to: "/admin/paractice-test-performance",
    icon: <ClipboardPen className="w-5 h-5 shrink-0" />,
  },
  {
    id: "results",
    type: "single",
    label: "Results",
    to: "/admin/results",
    icon: <Award className="w-5 h-5 shrink-0" />,
  },
  {
    id: "disciplines",
    type: "single",
    label: "Disciplines",
    to: "/admin/disciplines",
    icon: <IconHistory className="w-5 h-5 shrink-0" />,
  },
  {
    id: "library",
    type: "dropdown",
    title: "Library",
    icon: <IconApps className="size-5" />,
    children: [
      {
        label: "Words",
        to: "/admin/lib/words",
        icon: <IconCalendar className="size-5" />,
      },
      {
        label: "Images",
        to: "/admin/lib/images",
        icon: <IconCalendar className="size-5" />,
      },
    ],
  },
  {
    id: "user",
    type: "dropdown",
    title: "User",
    icon: <IconApps className="size-5" />,
    children: [
      {
        label: "Add User",
        to: "/admin/users/add",
        icon: <IconMessage className="size-5" />,
      },
      {
        label: "View User",
        to: "/admin/users/view",
        icon: <IconCalendar className="size-5" />,
      },
    ],
  },
];

// Define bottom menu items (with increased spacing)
const bottomMenuItems = [
  {
    id: "change_password",
    type: "single",
    label: "Change Password",
    to: "/admin/change_password",
    icon: <LockKeyhole className="w-5 h-5 shrink-0" />,
  },
  {
    id: "settings",
    type: "single",
    label: "Settings",
    to: "/admin/settings",
    icon: <IconSettings className="w-5 h-5 shrink-0" />,
  },
];

// Enhanced Dropdown Component
interface EnhancedDropdownProps {
  item: any;
  isOpen: boolean;
  onToggle: () => void;
  sidebarOpen: boolean;
  location: any;
}

const EnhancedDropdown = ({
  item,
  isOpen,
  onToggle,
  sidebarOpen,
  location,
}: EnhancedDropdownProps) => {
  // Check if any child is currently active
  const isAnyChildActive = item.children?.some((child: any) =>
    location.pathname === child.to || location.pathname.startsWith(child.to + '/')
  );

  return (
    <div className="space-y-0.5">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-md py-1 px-2 text-[12px] font-semibold transition-all duration-200",
          !sidebarOpen && "justify-center",
          // Only show subtle active state on parent - no bold background
          isAnyChildActive
            ? "text-blue-200 bg-white/5"
            : "text-white hover:text-blue-200 hover:bg-white/10"
        )}
        title={!sidebarOpen ? item.title : undefined}
      >
        <div className="flex items-center gap-2">
          <span className={cn(
            "transition-colors",
            isAnyChildActive ? "text-blue-200" : ""
          )}>
            {item.icon}
          </span>
          {sidebarOpen && item.title}
        </div>
        {sidebarOpen && (
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="transition-transform duration-300"
          >
            <IconChevronDown className="size-4" />
          </motion.span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && sidebarOpen && (
          <motion.ul
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: "auto", opacity: 1 },
              collapsed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.3 }}
            className="pl-4 space-y-1 overflow-hidden"
          >
            {item.children.map((child: any, index: any) => (
              <li key={index}>
                <EnhancedChildLink link={child} location={location} />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Child Link Component for dropdown items
interface EnhancedChildLinkProps {
  link: any;
  location: any;
}

const EnhancedChildLink = ({ link, location }: EnhancedChildLinkProps) => {
  const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');

  return (
    <Link
      to={link.to}
      className={cn(
        "flex items-center gap-2 rounded-md py-2 px-2 text-[12px] font-medium transition-all duration-200",
        isActive
          ? "bg-white text-blue-600 shadow-md font-semibold"
          : "text-gray-300 hover:text-white hover:bg-white/10"
      )}
    >
      <span className="transition-colors flex-shrink-0">
        {link.icon}
      </span>
      <span className="truncate">
        {link.label}
      </span>
    </Link>
  );
};

// Enhanced Single Link Component
interface EnhancedSingleLinkProps {
  item: any;
  sidebarOpen: boolean;
  location: any;
}

const EnhancedSingleLink = ({
  item,
  sidebarOpen,
  location,
}: EnhancedSingleLinkProps) => {
  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');

  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-2 rounded-md py-1 px-2 text-[12px] font-semibold transition-all duration-200",
        !sidebarOpen && "justify-center",
        isActive
          ? "bg-white text-blue-600 shadow-md"
          : "text-white hover:text-blue-200 hover:bg-white/10"
      )}
      title={!sidebarOpen ? item.label : undefined}
    >
      <span className="transition-colors flex-shrink-0">
        {item.icon}
      </span>
      {sidebarOpen && (
        <span className="truncate">
          {item.label}
        </span>
      )}
    </Link>
  );
};

interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AdminSidebar({ open, setOpen }: SidebarProps) {
  const [openDropdowns, setOpenDropdowns] = useState(new Set());
  const location = useLocation();

  useEffect(() => {
    const newOpenDropdowns = new Set();
    const allMenuItems = [...menuItems, ...bottomMenuItems];

    allMenuItems.forEach((item) => {
      if (item.type === "dropdown" && "children" in item && Array.isArray(item.children)) {
        const shouldBeOpen = item.children.some((child) =>
          location.pathname === child.to || location.pathname.startsWith(child.to + '/')
        );
        if (shouldBeOpen) {
          newOpenDropdowns.add(item.id);
        }
      }
    });

    setOpenDropdowns(newOpenDropdowns);
  }, [location.pathname]);

  const handleDropdownToggle = (dropdownId: any) => {
    if (!open) {
      setOpen(true);
    }
    setOpenDropdowns((prev) => {
      const newSet = new Set();
      if (!prev.has(dropdownId)) {
        newSet.add(dropdownId);
      }
      return newSet;
    });
  };

  const renderMenuItem = (item: any) => {
    if (item.type === "dropdown") {
      return (
        <EnhancedDropdown
          key={item.id}
          item={item}
          isOpen={openDropdowns.has(item.id)}
          onToggle={() => handleDropdownToggle(item.id)}
          sidebarOpen={open}
          location={location}
        />
      );
    } else {
      return (
        <EnhancedSingleLink
          key={item.id}
          item={item}
          sidebarOpen={open}
          location={location}
        />
      );
    }
  };

  return (
    <div className="relative h-full">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="flex flex-col h-full overflow-hidden">
          <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
            {/* TOP: Logo + App Name */}
            <Link
              to="/admin"
              className="flex items-center px-1 py-2 border-b border-white/20"
            >
              <img
                src="/Landing/memoryChampion_2.png"
                alt="Memory Jamboree Logo"
                className="object-contain w-24 h-24"
              />
              {open && (
                <span className="text-xl font-bold tracking-tight text-white">
                  Memory jamboree
                </span>
              )}
            </Link>

            {/* MAIN MENU SECTION: Dynamic rendering */}
            <div className="flex flex-col flex-1 px-4 mt-4 space-y-2">
              {menuItems.map(renderMenuItem)}
            </div>

            {/* BOTTOM SECTION: Change Password, Settings, Logout */}
            <div className="px-4 mt-auto space-y-2">
              {bottomMenuItems.map(renderMenuItem)}
              <div className="flex flex-col gap-1">
                <LogoutDialogButton />
              </div>

              {/* NEW: COLLAPSE BUTTON IN FOOTER */}
              <div className="pt-2 mt-2 border-t border-white/20">
                <button
                  onClick={() => setOpen(!open)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md py-2 px-2 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-white/10",
                    !open && "justify-center"
                  )}
                  aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                >
                  <span>
                    {open ? (
                      <PanelLeftClose className="w-5 h-5 shrink-0" />
                    ) : (
                      <PanelLeftOpen className="w-5 h-5 shrink-0" />
                    )}
                  </span>
                  <AnimatePresence>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="truncate"
                      >
                        Collapse
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}