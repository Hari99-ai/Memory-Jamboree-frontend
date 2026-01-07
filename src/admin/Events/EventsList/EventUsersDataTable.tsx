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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useState, useEffect } from "react";
import { Skeleton } from "../../../components/ui/skeleton";
import { SchoolsMasterData } from "../../../types";
import { getSchools } from "../../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowSelectionChange?: (id: number, checked: boolean) => void;
  rowSelection?: Record<number, boolean>;
  // onUpdate: (selectedUser: TData) => void;
}

export function DataTable<TData extends { id: number }, TValue>({
  columns,
  data,
  isLoading,
  onRowSelectionChange,
  // onUpdate
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const { data: schools } = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
  });

  const table = useReactTable({
    data,
    columns, // use columns as-is
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id.toString(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  // Notify parent component of selection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows;
      selectedRows.forEach((row) => {
        onRowSelectionChange(row.original.id, row.getIsSelected());
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  // Pagination helper: simplified pagination display logic
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

  return (
    <div>
      {/* Update Selected Button - Commented out in original */}
      {/* ... */}

      {/* RESPONSIVE FILTER SECTION: 
         - flex-col on mobile (stack), md:flex-row on desktop.
         - gap-4 for vertical spacing on mobile.
      */}
      <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
        <Input
          placeholder="Search Name..."
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          // Changed: w-full for mobile, max-w-sm for desktop
          className="w-full md:max-w-sm text-black"
        />
        <Input
          placeholder="Search Emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          // Changed: w-full for mobile, max-w-md for desktop
          className="w-full md:max-w-md text-black"
        />
        <Select
          value={(table.getColumn("school_name")?.getFilterValue() as string) ?? ""}
          onValueChange={(value) => {
            table.getColumn("school_name")?.setFilterValue(
              value === "__all__" ? undefined : value
            );
          }}
        >
          {/* Changed: w-full for mobile, w-[200px] for desktop */}
          <SelectTrigger className="w-full md:w-[200px]">
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

      {/* Table Wrapper: Added overflow-x-auto for horizontal scroll on mobile */}
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="w-full h-4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => row.toggleSelected()}
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: Stack on mobile (if text visible), adjust pagination wrapping */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 py-4">
        <div className="flex-1 hidden text-sm text-muted-foreground sm:block">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        {table.getPageCount() > 0 && (
          // Used flex-wrap to handle small screens gracefully
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>

            <div className="flex items-center space-x-1">
              {simplifiedPageNumbers.map((page, i) => {
                if (page === "...") {
                  return (
                    <Button
                      key={`ellipsis-${i}`}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      disabled
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  );
                }

                return (
                  <Button
                    key={`page-${page}`}
                    variant={
                      table.getState().pagination.pageIndex === page - 1
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => table.setPageIndex(Number(page) - 1)}
                  >
                    <span>{page}</span>
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}