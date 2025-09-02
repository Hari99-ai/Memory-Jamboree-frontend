import { ColumnDef } from "@tanstack/react-table";
import { RegisterUserInput } from "../../types";
import { Button } from "../../components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { deleteUser } from "../../lib/api";
import toast from "react-hot-toast";

export const columns = (
  refetchUsers?: () => void,
  navigate?: (path: string) => void
): ColumnDef<RegisterUserInput>[] => [
  {
    id: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => `${row.fname} ${row.lname}`, // used for sorting/filtering
    cell: ({ row }) => {
      const id = row.original.id;
      console.log("user_id hii" , id)
      const name = `${row.original.fname} ${row.original.lname}`;
      return (
        <NavLink to={`/admin/user/${id}`} className="text-blue-600 hover:underline">
          {name}
        </NavLink>
      );
    },
  },
  {
    accessorKey: "email",
    // header: "Email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "school_name",
    header: "School Name",
  },
  {
    accessorKey: "school_class",
    header: "School class",
  },
  // START: New Columns Added
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  // END: New Columns Added
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      

      const handleEdit = () => {
        if (navigate) {
          navigate(`/admin/user/update/${user.id}`);
        } else {
          console.warn("navigate function is not defined");
      } // navigate to edit page with user ID
      };

      const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${String(user.fname) + String(user.lname)}?`)) {
          try {
            await deleteUser(String(user.id));
            toast.success("User deleted successfully");
            refetchUsers?.(); // After User deletion Refresh Table
          } catch (error) {
            toast.error("Failed to delete user");
            console.error(error);
          }
        }
      };
      return (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={handleEdit}>
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    },
  },
];