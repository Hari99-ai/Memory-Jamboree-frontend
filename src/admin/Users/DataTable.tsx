/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import { Skeleton } from "../../components/ui/skeleton";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DeleteUsers, getSchools } from "../../lib/api";
import { SchoolsMasterData } from "../../types";
import { Checkbox } from "../../components/ui/checkbox"; // Importing the Checkbox
import toast from "react-hot-toast";
 
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  refetchUsers?: () => void,
}
 
export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  refetchUsers
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState({}); // new
 
  const { data: schools } = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
  });
 
  // ----- Add selection column -----
  const selectionColumn: ColumnDef<any, any> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={() => table.toggleAllPageRowsSelected()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={() => row.toggleSelected()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };
  const allColumns = [selectionColumn, ...columns];
 
  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row: any) => (row.id ?? row.user_id)?.toString(),
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection, // new
    },
    onPaginationChange: setPagination,
    enableRowSelection: true, // new
    onRowSelectionChange: setRowSelection, // new
  });
 
  // Simplified Pagination
  const getSimplifiedPagination = () => {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();
 
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const startPages = [1, 2, 3];
    const endPages = [totalPages - 2, totalPages - 1, totalPages];
    const middlePages: (number | "...")[] = [];
 
    if (currentPage > 4) {
      middlePages.push("...");
    }
    if (currentPage > 3 && currentPage < totalPages - 2) {
      middlePages.push(currentPage);
    }
    if (currentPage < totalPages - 3) {
      middlePages.push("...");
    }
    return [...startPages, ...middlePages, ...endPages].filter(
      (v, i, a) => a.indexOf(v) === i
    );
  };
  const simplifiedPageNumbers = getSimplifiedPagination();
 

  const { mutate } = useMutation({
    mutationKey: ['delete-users'],
    mutationFn: DeleteUsers,
  });

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds: number[] = selectedRows.map(
      (r) => Number(r.id)
    );

    if (selectedIds.length === 0) {
      alert("No users selected.");
      return;
    }

    // Optional: Confirm before deletion
    if (!confirm(`Are you sure you want to delete users: ${selectedIds.join(', ')}?`)) {
      return;
    }

    mutate(selectedIds, {
      onSuccess: () => {
        toast.success("Users deleted successfully.");
        // You can refetch or update the table here
        refetchUsers?.();
      },
      onError: (error) => {
        alert("Failed to delete users: " + error?.message);
      },
    });
  };


 

  return (
    <div>
      {/* DELETE SELECTED BUTTON at top */}
      <div className="flex justify-end pr-2">
        <Button
        variant="destructive"
        size="sm"
        className="mb-2 "
        disabled={table.getSelectedRowModel().rows.length === 0}
        onClick={handleDeleteSelected}
      >
        Delete Selected
      </Button>
      </div>
 
      <div className="flex items-center gap-x-2 py-4 justify-between">
        <Input
          placeholder="Search Name..."
          value={
            (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-black"
        />
        <Input
          placeholder="Search Emails..."
          value={
            (table.getColumn("email")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-md text-black"
        />
        <Select
          value={
            (table.getColumn("school_name")?.getFilterValue() as string) ?? ""
          }
          onValueChange={(value) => {
            table.getColumn("school_name")?.setFilterValue(
              value === "__all__" ? undefined : value
            );
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter School" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Schools</SelectItem>
            {schools?.map((school: SchoolsMasterData) => (
              <SelectItem key={school.school_id} value={school.school_name}>
                {school.school_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
 
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={header.column.columnDef.size ? { width: header.column.columnDef.size } : {}}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {allColumns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={allColumns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
 
      {table.getPageCount() > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6 py-4">
          <div className="flex items-center sm:space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="hidden text-sm font-medium sm:block">
                Rows per page
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
 
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
 
          <div className="flex items-center space-x-1">
            {simplifiedPageNumbers.map((page, i) =>
              page === "..." ? (
                <Button
                  key={`ellipsis-${i}`}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={
                    table.getState().pagination.pageIndex === Number(page) - 1
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(Number(page) - 1)}
                >
                  <span>{page}</span>
                </Button>
              )
            )}
          </div>
 
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
 