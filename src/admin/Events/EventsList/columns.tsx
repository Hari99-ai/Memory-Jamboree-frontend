/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { EventData } from "../../../types";
import { Button } from "../../../components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { deleteEvent } from "../../../lib/api";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
// import { Badge } from "../../../components/ui/badge";
// import { EventStatus, StatusTypes } from "../../data/data";
// import clsx from "clsx"
import { StatusCell } from "../../components/StatusCall";
// import { useState } from "react";
// import {  NavLink } from "react-router-dom";
// import { deleteUser } from "../../../lib/api";
// import toast from "react-hot-toast";

export const columns = (
refetchUsers?: () => void,
  // handleEdit: (event: EventData) => void
): ColumnDef<EventData>[] => [
  {
    id: "ename",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    accessorFn: (row) => `${row.ename}`,
    cell: ({ row }) => {
      const id = row.original.event_id;
      const name = row.original.ename;
    
      return (
        <NavLink
          to={`/admin/event/${id}`}
          className={({ isActive }) =>
            `text-blue-600 hover:underline ${isActive ? "font-bold" : ""}`
          }
        >
          {name}
        </NavLink>
      );
    },
  },
  {
  accessorKey: "event_start",
  header: "Event Start",
  cell: ({ row }: any) => {
    // Parse the date string from the row data
    const date = new Date(row.original.event_start);
    
    // Format in IST without any timezone conversion (since backend stores as IST)
    return date.toLocaleString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
  }
},
{
  accessorKey: "event_end",
  header: "Event End",
  cell: ({ row }: any) => {
    return new Date(row.original.event_end).toLocaleString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
  }
  },
  {
    accessorKey: "estatus",
    header: "Type",
    cell: ({ row  } :any) => (row.original.estatus === 1 ? 'Paid' : 'Unpaid'),
  },
  {
  accessorKey: 'etype',
  header: "Status",
  cell: ({ row }: any) => {
    
    //  const etype = row.original.etype;

    //   let label: EventStatus = "expired";
    //   if (etype === 1) label = "active"; // Live
    //   else if (etype === 2) label = "upcoming"; // Upcoming
    //   else label = "expired"; // Expired

    //   const customClass = StatusTypes.get(label) ?? "";

    //   return (
    //     <Badge className={clsx("px-2 py-1 text-sm rounded-md border", customClass)}>
    //       {label.charAt(0).toUpperCase() + label.slice(1)}
    //     </Badge>
    //   );

    return <StatusCell eventId={row.original.event_id} etype={row.original.etype} />
  },
},
  // {
  //   accessorKey: "disciplines",
  //   header: "Disciplines",
  // },
  // {
  //   accessorKey:"category",
  //   header:"Category"
  // },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const event = row.original;

      // const handleEdit = () => {

      // };
      const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${event.ename}?`)) {
          try {
            await deleteEvent(String(event.event_id));
            toast.success("Event deleted successfully");
            refetchUsers?.();
          } catch (error) {
            toast.error("Failed to delete event");
            console.error(error);
          }
        }
      };
      // const handelEvent = () => {}
      return (
        <div className="flex gap-2">
          {/* <Button size="icon" variant="ghost" onClick={() => handleEdit(event)}>
            <Pencil className="w-4 h-4 text-blue-600" />
          </Button> */}
          <Button size="icon" variant="ghost" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      );
    },
  },
];


