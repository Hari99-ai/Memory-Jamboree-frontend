// import { ReactNode, useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Link, NavLink, Outlet } from "react-router-dom";
// import { Sidebar, SidebarBody, SidebarLink } from "../components/sidebar";
// import {
//   // IconArrowLeft,
//   IconHistory,
//   IconCertificate,
//   IconSettings,
//   // IconUserBolt,
//   // IconLogout,
//   IconApps,
//   IconChevronDown,
//   IconMessage,
//   IconCalendar,
//   // IconDotsVertical,
// } from "@tabler/icons-react";
// import { cn } from "../lib/utils";
// import { useLocation } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import { Calendar, Eye, Home, LogOutIcon, Plus, Users } from "lucide-react";
// // import { getUserById } from "../lib/api";
// // import DashboardHero from "./DashboardHero";




// export function AdminDashboard() {
//   const [open, setOpen] = useState(true);
//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-neutral-800 flex">
//       {/* Sidebar - fixed */}
//       <div className="fixed scroll top-0 left-0 h-full pl-5 overflow-y-auto scrollbar-hide hide-scrollbar">
//         <SidebarC setOpenUp={setOpen}/>
//       </div>

//       {/* Main Content - margin-left to avoid sidebar overlap */}
//       <div className={`flex-1 ${open ? "ml-60" : "ml-20"} p-6 transition-all duration-300`}>
//         <div className="relative w-full h-full rounded-xl bg-background focus:outline-none">
//           <div className="flex-1 overflow-auto">
//             <Outlet />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// interface NavItem {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
//   path: string;
//   badge?: number;
// }

// interface NavGroup {
//   id: string;
//   title: string;
//   icon: React.ReactNode;
//   items: NavItem[];
//   defaultOpen?: boolean;
// }



// const navigationConfig: (NavItem | NavGroup)[] = [
//   {
//     id: 'dashboard',
//     label: 'Dashboard',
//     icon: <Home className="w-5 h-5" />,
//     path: '/admin-dashboard',
//   },
//   {
//     id: 'events-group',
//     title: 'Events',
//     icon: <Calendar className="w-5 h-5" />,
//     defaultOpen: false,
//     items: [
//       {
//         id: 'add-event',
//         label: 'Add Event',
//         icon: <Plus className="w-4 h-4" />,
//         path: '/admin-dashboard/events/add',
//       },
//       {
//         id: 'view-events',
//         label: 'View Events',
//         icon: <Eye className="w-4 h-4" />,
//         path: '/admin-dashboard/events/list',
//         badge: 5,
//       },
//     ],
//   },
//   {
//     id: 'users-group',
//     title: 'User Management',
//     icon: <Users className="w-5 h-5" />,
//     items: [
//       {
//         id: 'add-user',
//         label: 'Add User',
//         icon: <Plus className="w-4 h-4" />,
//         path: '/admin-dashboard/users/add',
//       },
//       {
//         id: 'view-users',
//         label: 'View Users',
//         icon: <Eye className="w-4 h-4" />,
//         path: '/admin-dashboard/users/list',
//         badge: 12,
//       },
//     ],
//   },
// ];


// // Static top links
// const staticLinks = [
//   {
//     label: "History",
//     to: "/history",
//     icon: (
//       <IconHistory className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//     ),
//   },
//   {
//     label: "Live Monitoring",
//     to: "/admin-dashboard/live-monitoring",
//     icon: (
//       <IconCertificate className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//     ),
//   },
// ];

// const paymentLinks = [
//   {
//     label: "Settings",
//     to: "/admin-dashboard/settings",
//     icon: (
//       <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//     ),
//   },
//   {
//     label: "Change Password",
//     to: "/certificates",
//     icon: (
//       <IconCertificate className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//     ),
//   },
//   {
//     label: "Help & Support",
//     to: "/certificates",
//     icon: (
//       <IconCertificate className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//     ),
//   },
// ];

// interface DropdownMenuProps {
//   title: string;
//   shortTitle: string;
//   icon: ReactNode;
//   children: ReactNode;
//   defaultOpen: boolean; 
//   open: boolean;
// }

// const DropdownMenu = ({
//   title,
//   shortTitle,
//   icon,
//   children,
//   defaultOpen = false,
//   open: sidebarOpen,
// }: DropdownMenuProps) => {
//   const [isOpen, setIsOpen] = useState(defaultOpen);

//   useEffect(() => {
//     setIsOpen(defaultOpen);
//   }, [defaultOpen]);

//   return (
//     <div className="space-y-0.5">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex w-full items-center justify-between rounded-md p-2 text-[16px] font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700"
//       >
//         <div className="flex items-center gap-2">
//           {icon}
//           {sidebarOpen ? title : shortTitle}
//         </div>
//         {sidebarOpen && (
//           <motion.span
//             animate={{ rotate: isOpen ? 180 : 0 }}
//             className="transition-transform duration-300"
//           >
//             <IconChevronDown className="size-4" />
//           </motion.span>
//         )}
//       </button>

//       <AnimatePresence initial={false}>
//         {isOpen && sidebarOpen && (
//           <motion.ul
//             initial="collapsed"
//             animate="open"
//             exit="collapsed"
//             variants={{
//               open: { height: "auto", opacity: 1 },
//               collapsed: { height: 0, opacity: 0 },
//             }}
//             transition={{ duration: 0.3 }}
//             className="overflow-hidden pl-4 space-y-1"
//           >
//             {children}
//           </motion.ul>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export const SidebarC = ({}) => {
//   const [open, setOpen] = useState(false);
//   const location = useLocation();
//   const { logout } = useAuth();
//   // setOpenUp(open);

//   return (
    
//     <Sidebar open={open} setOpen={setOpen}>
//       <SidebarBody className="flex flex-col h-full overflow-hidden">
//         {/* Main content with flex-1 to take available space */}
//         <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
//           <Link to={"/admin-dashboard"} className="mb-4">
//             {open ? <h2>Hello Admin</h2> : <h2 className="text-center">A</h2>}
//           </Link>
//           <div className="flex flex-col gap-2">
//             <DropdownMenu
//               title="Events"
//               icon={<IconApps className="size-5" />}
//               shortTitle="E"
//               open={open}
//               defaultOpen={location.pathname.includes("/events")}
//             >
//               <SidebarLink
//                 link={{
//                   label: "Add Events",
//                   to: "/admin-dashboard/events/add",
//                   icon: <IconMessage className="size-5" />,
//                 }}
//                 active={location.pathname === "/admin-dashboard/events/add"}
//               />
//               <SidebarLink
//                 link={{
//                   label: "View Events",
//                   to: "/admin-dashboard/events/list",
//                   icon: <IconCalendar className="size-5" />,
//                 }}
//                 active={location.pathname === "/admin-dashboard/events/list"}
//               />
//             </DropdownMenu>
//           </div>

//           <div className="mt-4 flex flex-col gap-2">
//             <NavLink
//               to="/admin-dashboard/disciplines"
//               className={({ isActive }) =>
//                 cn(
//                   "flex items-center gap-3 rounded p-2 text-[16px] text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
//                   isActive && "bg-neutral-200 dark:bg-neutral-700 font-semibold"
//                 )
//               }
//               active={location.pathname === "/admin-dashboard/disciplines"}
//             >
//               {/* Add an icon here, if you have one */}
//               <IconHistory className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//               <span className="truncate">Disciplines</span>
              
//             </NavLink>

//             {/* You can add other links or content here */}
//           </div>

//           <div className="mt-4 flex flex-col gap-2">
//             <DropdownMenu
//               title="Library"
//               icon={<IconApps className="size-5" />}
//               shortTitle="L"
//               open={open}
//               defaultOpen={location.pathname.includes("/lib")}
//             >
//               <SidebarLink
//                 link={{
//                   label: "Words",
//                   to: "lib/words",
//                   icon: <IconCalendar className="size-5" />,
//                 }}
//                 active={location.pathname === "lib/words"}
//               />
//               <SidebarLink
//                 link={{
//                   label: "Images",
//                   to: "lib/images",
//                   icon: <IconCalendar className="size-5" />,
//                 }}
//                 active={location.pathname === "lib/images"}
//               />
//             </DropdownMenu>
//           </div>
//           <div className="mt-4 flex flex-col gap-2">
//             {staticLinks.map((link, idx) => (
//               <SidebarLink
//                 key={idx}
//                 link={{
//                   ...link,
//                   label: open ? link.label : link.label.charAt(0),
//                 }}
//                 active={location.pathname === link.to}
//               />
//             ))}
//           </div>

//           <div className="mt-4 flex flex-col gap-2">
//             <DropdownMenu
//               title="Results"
//               icon={<IconApps className="size-5" />}
//               shortTitle="R"
//               open={open}
//               defaultOpen={location.pathname.includes("/results")}
//             >
//               <SidebarLink
//                 link={{
//                   label: "Generate",
//                   to: "/admin-dashboard/result/generate",
//                   icon: <IconMessage className="size-5" />,
//                 }}
//                 active={location.pathname === "/result/generate"}
//               />
//               <SidebarLink
//                 link={{
//                   label: "Publish",
//                   to: "/admin-dashboard/result/publish",
//                   icon: <IconCalendar className="size-5" />,
//                 }}
//                 active={location.pathname === "/result/publish"}
//               />
//               <SidebarLink
//                 link={{
//                   label: "Certificate",
//                   to: "/results/certificate",
//                   icon: <IconCalendar className="size-5" />,
//                 }}
//                 active={location.pathname === "/results/certificate"}
//               />
//             </DropdownMenu>
//           </div>

//           <div className="mt-4 flex flex-col gap-2">
//             <DropdownMenu
//               title="User"
//               icon={<IconApps className="size-5" />}
//               shortTitle="U"
//               open={open}
//               defaultOpen={location.pathname.includes("/user")}
//             >
//               <SidebarLink
//                 link={{
//                   label: "Add User",
//                   to: "/admin-dashboard/user/add",
//                   icon: <IconMessage className="size-5" />,
//                 }}
//                 active={location.pathname === "/user/add"}
//               />
//               <SidebarLink
//                 link={{
//                   label: "View User",
//                   to: "/admin-dashboard/user/view",
//                   icon: <IconCalendar className="size-5" />,
//                 }}
//                 active={location.pathname === "/user/view"}
//               />
//             </DropdownMenu>
//           </div>

//           <div className="mt-4 flex flex-col gap-2">
//             {/* {open ? <h3>SETTINGS</h3> : <h3 className="text-center">S</h3>} */}
//             {paymentLinks.map((link, idx) => (
//               <SidebarLink
//                 key={idx}
//                 link={{
//                   ...link,
//                   label: open ? link.label : link.label.charAt(0),
//                 }}
//                 active={location.pathname === link.to}
//               />
//             ))}
//           </div>

//           <div className="mt-2 flex gap-2">
//             <button onClick={logout}  className={
//               "flex items-center gap-3 rounded p-2 text-[16px] text-neutral-700 hover:dark:hover:bg-neutral-800  hover:bg-neutral-200 hover:dark:bg-neutral-700 font-semibold"
//               }>
//               <LogOutIcon className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/> Logout
//             </button>
//           </div>



//         </div>


//         {/* Footer profile section - Always at bottom */}
//         <div className="mt-auto border-t">
       
              
           
//               <div className="flex items-center gap-2 justify-center items-center py-3">
//                 <img
//                   src="/images/deno.jpeg"
//                   className="h-10 w-10 rounded-full object-cover"
//                   width={30}
//                   height={30}
//                   alt="Avatar"
//                 />
//               {open && (
//                 <span className="font-medium">Admin</span>
//               )}
//               </div>
           
         
//         </div>
//       </SidebarBody>
//     </Sidebar>
   
//   );
// };



// export default AdminDashboard;
