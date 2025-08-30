import { ColumnDef } from "@tanstack/react-table";
import { RegisterUserInput } from "../../types";
import { Button } from "../../components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { deleteUser } from "../../lib/api";
import toast from "react-hot-toast";

type UserWithSchoolDetails = RegisterUserInput & { city?: string; state?: string };

export const columns = (
  refetchUsers?: () => void,
  navigate?: (path: string) => void
): ColumnDef<UserWithSchoolDetails>[] => [
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
    accessorFn: (row) => `${row.fname} ${row.lname || ''}`.trim(),
    cell: ({ row }) => {
      const id = row.original.id;
      const name = `${row.original.fname} ${row.original.lname || ''}`.trim();
      return (
        <NavLink to={`/admin/user/${id}`} className="text-blue-600 hover:underline">
          {name}
        </NavLink>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    header: "Grade",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      const userName = `${user.fname} ${user.lname || ''}`.trim();

      const handleEdit = () => {
        if (navigate) {
          navigate(`/admin/user/update/${user.id}`);
        } else {
          console.warn("navigate function is not defined");
        }
      };

      const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${userName}?`)) {
          try {
            await deleteUser(String(user.id));
            toast.success("User deleted successfully");
            refetchUsers?.();
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