// import React, { type Dispatch, type SetStateAction } from "react";
// import { cn } from "../lib/utils"; // Make sure your 'utils' path is correct
// import { NavLink } from "react-router-dom";
 
// // Sidebar main container
// export interface SidebarProps {
//   open: boolean;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   children: React.ReactNode;
// }
 
// export const Sidebar = ({ open, children }: SidebarProps) => {
//   return (
//     <aside
//       className={cn(
//         "flex flex-col  transition-all duration-300",
//         open ? "w-14" : "w-60",
       
//       )}
//     >
//       {/* Toggle button */}
//       {/* <button
//         onClick={() => setOpen(!open)}
//         className="text-xl font-extrabold"
//       >
//         {open ? "<<" : ">>"}
//       </button> */}
 
//       {children}
//     </aside>
//   );
// };
 
// // Sidebar body (for links and content)
// interface SidebarBodyProps {
//   className?: string;
//   children: React.ReactNode;
// }
 
// export const SidebarBody = ({ children, className }: SidebarBodyProps) => {
//   return (
//     <div className={cn("flex flex-col", className)}>
//       {children}
//     </div>
//   );
// };
 
// // Sidebar link
// interface SidebarLinkProps {
//   link: {
//     label: string;
//     to: string;
//     icon: React.ReactNode;
//   };
// }
 
// export const SidebarLink = ({ link }: SidebarLinkProps) => {
//   return (
//     <NavLink
//       to={link.to}
//       className={({ isActive }) =>
//         cn(
//           "flex items-center gap-3 rounded p-2 text-[12px]  cursor-pointer text-white hover:text-blue-200 ",
//           isActive && " font-semibold"
//         )
//       }
//     >
//       {link.icon}
//       <span className="text-sm font-semibold truncate  ">{link.label}</span>
//     </NavLink>
//   );
// };





import React, { type Dispatch, type SetStateAction } from "react";
import { cn } from "../lib/utils";
import { NavLink } from "react-router-dom";
 
// Sidebar main container
interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}
 
export const Sidebar = ({ open, children }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-300 ease-in-out",
        open ? "w-60" : "w-14"
      )}
    >
      {/* Toggle button */}
      {/* <button
        onClick={() => setOpen(!open)}
        className={cn(
          "text-xl font-extrabold p-2 hover:bg-gray-100 transition-colors",
          "flex items-center justify-center h-12"
        )}
      >
        {open ? "<<" : ">>"}
      </button> */}
 
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
          "flex items-center gap-3 rounded py-1 text-[12px] cursor-pointer text-white hover:text-blue-200   transition-colors",
          isActive && "font-semibold"
        )
      }
    >
      {link.icon}
      <span className=" font-semibold truncate">{link.label}</span>
    </NavLink>
  );
};