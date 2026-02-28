
import React, { type Dispatch, type SetStateAction } from "react";
import { cn } from "../../lib/utils"; // Make sure your 'utils' path is correct
import { NavLink } from "react-router-dom";

// Sidebar main container
interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}

export const Sidebar = ({ open, setOpen, children }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white p-4 transition-all dark:border-neutral-700 dark:bg-neutral-900",
        open ? "w-60" : "w-16",
        "border-neutral-200" // keep borders consistent
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="mb-4 rounded p-2 text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
      >
        {open ? "<" : ">"}
      </button>

      {children}
    </aside>
  );
};

// Sidebar body (for links and content)
interface SidebarBodyProps {
  className?: string;
  children: React.ReactNode;
}

export const SidebarBody = ({ children, className }: SidebarBodyProps) => {
  return (
    <div className={cn("flex flex-col", className)}>
      {children}
    </div>
  );
};

// Sidebar link
interface SidebarLinkProps {
  link: {
    label: string;
    to: string;
    icon: React.ReactNode;
  };
}

export const SidebarLink = ({ link }: SidebarLinkProps) => {
  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded p-2 text-[16px] text-neutral-900 hover:bg-neutral-100 dark:text-neutral-200 cursor-pointer dark:hover:bg-neutral-800",
          isActive && "bg-neutral-200 dark:bg-neutral-700 font-semibold"
        )
      }
    >
      {link.icon}
      <span className="truncate text-black text-sm font-semibold">{link.label}</span>
    </NavLink>
  );
};