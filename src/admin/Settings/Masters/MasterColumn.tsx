import { ColumnDef } from "@tanstack/react-table";
import { CategoryMasterData, SchoolsMasterData } from "../../../types";
import { deleteCategory, deleteSchool } from "../../../lib/api";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
// import { useState } from "react";


export const Schoolcolumns = (refetch: () => void, onEdit: (row: SchoolsMasterData) => void, showActions?: boolean)
: ColumnDef<SchoolsMasterData>[] => {
  const columns: ColumnDef<SchoolsMasterData>[] = [ 
    {
      header: "No.",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "school_name",
      header: "School",
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => {
        const countryCode = row.getValue("country");
        return countryCode; 
      },
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => {
        const stateCode = row.getValue("state");
        // You might want to add a function to get state name from code
        return stateCode; // or getStateName(stateCode)
      },
    },
    {
      accessorKey: "city",
      header: "City",
    },
  ];
  if (showActions) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const school = row.original;

        const handleDelete = async () => {
          if (confirm(`Are you sure you want to delete ${school.school_name}?`)) {
            try {
              await deleteSchool(Number(school.school_id));
              toast.success("School deleted successfully");
              refetch(); // Call refetch after successful deletion
            } catch (error) {
              toast.error("Failed to delete school");
              console.error(error);
            }
          }
        };

        return (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(school)}
              aria-label="Edit school"
            >
              <Pencil className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              aria-label="Delete school"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      },
    });
  }

  return columns;
};


export const Categorycolumns = (
  refetchUsers: () => void,
  onEdit?: (row: CategoryMasterData) => void
): ColumnDef<CategoryMasterData>[] => [
  {
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "category_name",
    header: "Category",
  },
  {
    accessorKey: "classes",
    header: "Classes",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original;

      const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${category.category_name}?`)) {
          try {
            await deleteCategory(Number(category.cat_id));
            toast.success("Category deleted successfully");
            refetchUsers();
          } catch (error) {
            toast.error("Failed to delete category");
            console.error(error);
          }
        }
      };

      return (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit && onEdit(category)}
            aria-label="Edit category"
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            aria-label="Delete category"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    },
  },
];