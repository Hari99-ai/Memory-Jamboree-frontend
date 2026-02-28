// import { IconChevronDown } from "@tabler/icons-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ReactNode, useState, useEffect } from "react";
 
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
//         className="flex w-full items-center justify-between rounded-md p-2 text-[12px] font-semibold text-white  hover:text-blue-200"
//       >
//         <div className="flex items-center gap-2 ">
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
//             className="pl-4 space-y-1 overflow-hidden"
//           >
//             {children}
//           </motion.ul>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };
 
 
// export default DropdownMenu


import { IconChevronDown } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
 
interface DropdownMenuProps {
  title: string;
  shortTitle: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen: boolean;
  open: boolean;
}
 
const DropdownMenu = ({
  title,
  shortTitle,
  icon,
  children,
  defaultOpen = false,
  open: sidebarOpen,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
 
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);
 
  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md p-2 text-[12px] font-semibold text-white  hover:text-blue-200"
      >
        <div className="flex items-center gap-2 ">
          {icon}
          {sidebarOpen ? title : shortTitle}
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
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
 
 
export default DropdownMenu