// // eventusercolumns.ts

// import { ColumnDef } from "@tanstack/react-table";
// import { Checkbox } from "../../components/ui/checkbox";
// import { RegisterUserInput } from "../../types";
// import { ArrowUpDown } from "lucide-react";
// import { Button } from "../../components/ui/button";
// import { NavLink } from "react-router-dom";
// import { useState } from "react";

// // eslint-disable-next-line react-refresh/only-export-components
// export const eventusercolumns = (
//   onRowSelectionChange?: (id: number, checked: boolean) => void,
//   onMonitoringToggle?: (id: number, monitored: boolean) => void,
//   monitoring: Record<number, boolean> = {},
//   selectedUserIds?: number[]
// ): ColumnDef<RegisterUserInput>[] => [
//     {
//       id: "select",
//       header: ({ table }) => (
//         <Checkbox
//           checked={table.getIsAllPageRowsSelected()}
//           indeterminate={table.getIsSomePageRowsSelected()}
//           onChange={(e) => {
//             table.toggleAllPageRowsSelected(e.target.checked);
//             const selected = table.getSelectedRowModel().rows.map((r) => r.original);
//             console.log("Selected rows:", selected);
//           }}
//           aria-label="Select all rows"
//         />
//       ),
//       cell: ({ row }) => (
//         <Checkbox
//           checked={selectedUserIds?.includes(row.original.id) || row.getIsSelected()}
//           indeterminate={row.getIsSomeSelected?.()}
//           onChange={(e) => {
//             row.toggleSelected(e.target.checked);
//             if (onRowSelectionChange) {
//               const id = row.original.id;
//               onRowSelectionChange(Number(id), e.target.checked);
//             }
//           }}
//           aria-label="Select row"
//         />
//       ),
//       enableSorting: false,
//       enableHiding: false,
//     },

//     {
//       id: "fullName",
//       header: ({ column }) => (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Name
//           <ArrowUpDown className="w-4 h-4 ml-2" />
//         </Button>
//       ),
//       accessorFn: (row) => `${row.fname} ${row.lname}`,
//       cell: ({ row }) => {
//         const id = row.original.id;
//         const name = `${row.original.fname} ${row.original.lname}`;
//         return (
//           <NavLink
//             to={`/admin-dashboard/user/${id}`}
//             className="text-blue-600 hover:underline"
//           >
//             {name}
//           </NavLink>
//         );
//       },
//     },
//     {
//       accessorKey: "email",
//       header: "Email",
//     },
//     {
//       accessorKey: "school_name",
//       header: "School Name",
//     },
//     {
//       accessorKey: "school_class",
//       header: "Class",
//     },
//     {
//       id: "monitoring",
//       header: () => (
//         <Button
//           variant="ghost"
//         >
//           Monitoring
//         </Button>
//       ),
//       accessorFn: (row:any) => row?.monitored || false,
//       cell: ({ row }) => {
//         const id = row.original.id;
//         console.log("Monitoring state for user:", id, monitoring[id]);
//         const initialMonitored = monitoring[id] || false;

//         return (
//           <MonitoringToggle
//             id={id}
//             initialMonitored={initialMonitored}
//             onToggle={onMonitoringToggle}
//             selected={selectedUserIds?.includes(id) || false}
//           />
//         );
//       },
//     },
//   ];



// export const MonitoringToggle = ({
//   id,
//   initialMonitored,
//   onToggle,
//   selected = false
// }: {
//   id: number;
//   initialMonitored: boolean;
//   onToggle?: (id: number, monitored: boolean) => void;
//   selected?: boolean;
// }) => {
//   const [monitored, setMonitored] = useState(initialMonitored);

//   const handleToggle = () => {
//    if(!selected) {
//       console.warn(`User ${id} is not selected for monitoring.`);
//       return;
//     }

//     const newMonitored = !monitored;
//     setMonitored(newMonitored);

//     if (onToggle) {
//       onToggle(id, newMonitored);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center">
//       <button
//         onClick={handleToggle}
//         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${monitored
//             ? 'bg-blue-600 hover:bg-blue-700'
//             : 'bg-gray-200 hover:bg-gray-300'
//           }`}
//         aria-label={`Toggle monitoring for user ${id}`}
//       >
//         <span
//           className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${monitored ? 'translate-x-6' : 'translate-x-1'
//             }`}
//         />
//       </button>
//     </div>
//   );
// };


import type React from "react"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "../../components/ui/checkbox"
import type { RegisterUserInput } from "../../types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../../components/ui/button"
import { NavLink } from "react-router-dom"

export const eventusercolumns = (
  onRowSelectionChange?: (id: number, checked: boolean) => void,
  onMonitoringToggle?: (id: number, monitored: boolean) => void,
  monitoring: Record<number, boolean> = {},
  selectedUserIds: number[] = [],
  onSelectAll?: (checked: boolean, currentPageUsers?: RegisterUserInput[]) => void,
  onMonitoringSelectAll?: (checked: boolean) => void,
  // allUsers: RegisterUserInput[] = [],
): ColumnDef<RegisterUserInput>[] => [
    {
      id: "select",
      header: ({ table }) => {
        // Get only the current page rows (visible rows after pagination)
        const currentPageRows = table.getRowModel().rows
        const currentPageUsers = currentPageRows.map(row => row.original)
        const currentPageUserIds = currentPageUsers.map(user => user.id)

        console.log("Current page user IDs:", currentPageUserIds) // Debug log
        console.log("Current page users count:", currentPageUsers.length) // Debug log

        const isAllCurrentPageSelected = currentPageUserIds.length > 0 &&
          currentPageUserIds.every(id => selectedUserIds.includes(id))
        const isSomeCurrentPageSelected = currentPageUserIds.some(id => selectedUserIds.includes(id)) &&
          !isAllCurrentPageSelected

        return (
          <Checkbox
            checked={isAllCurrentPageSelected}
            indeterminate={isSomeCurrentPageSelected}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const isChecked = e.target.checked
              console.log("Header checkbox clicked:", isChecked, "Current page users:", currentPageUsers.length) // Debug log
              if (onSelectAll) {
                onSelectAll(isChecked, currentPageUsers)
              }
            }}
            aria-label={`Select all ${currentPageUsers.length} rows on current page`}
          />
        )
      },
      cell: ({ row }) => (
        <Checkbox
          checked={selectedUserIds.includes(row.original.id)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const isChecked = e.target.checked
            onRowSelectionChange?.(row.original.id, isChecked)
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "fullName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      accessorFn: (row) => `${row.fname} ${row.lname}`,
      cell: ({ row }) => {
        const id = row.original.id
        const name = `${row.original.fname} ${row.original.lname}`
        return (
          <NavLink to={`/admin-dashboard/user/${id}`} className="text-blue-600 hover:underline">
            {name}
          </NavLink>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "school_name",
      header: "School Name",
    },
    {
      accessorKey: "school_class",
      header: "Class",
    },
    {
      id: "monitoring",
      header: () => {
        const selectedMonitoringCount = selectedUserIds.filter((id) => monitoring[id]).length
        const isAllMonitoringSelected = selectedUserIds.length > 0 && selectedMonitoringCount === selectedUserIds.length
        const isSomeMonitoringSelected = selectedMonitoringCount > 0 && selectedMonitoringCount < selectedUserIds.length

        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllMonitoringSelected}
              indeterminate={isSomeMonitoringSelected}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const isChecked = e.target.checked
                if (onMonitoringSelectAll) {
                  onMonitoringSelectAll(isChecked)
                }
              }}
              aria-label="Select all monitoring"
            />
            <span>Monitoring</span>
          </div>
        )
      },
      cell: ({ row }) => {
        const id = row.original.id
        const isSelected = selectedUserIds.includes(id)
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={monitoring[id] || false}
              disabled={!isSelected}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (onMonitoringToggle) {
                  onMonitoringToggle(id, e.target.checked)
                }
              }}
              aria-label={`Toggle monitoring for user ${id}`}
            />
          </div>
        )
      },
    },
  ]