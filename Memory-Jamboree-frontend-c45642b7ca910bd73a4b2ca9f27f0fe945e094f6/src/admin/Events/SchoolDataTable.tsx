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
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useState } from "react"
import { Skeleton } from "../../components/ui/skeleton"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getSchools } from "../../lib/api"
import { SchoolsMasterData } from "../../types"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean;
}

export function SchoolDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: schools } = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    // onGlobalFilterChange: setGlobalFilter,
    // globalFilterFn: (row, columnId, filterValue) => {
    //   const searchValue = filterValue.toLowerCase();

    //   // Get values from name and city columns (adjust column names as per your data structure)
    //   const name = row.getValue("fullName") || row.getValue("name") || row.getValue("school_name") || "";
    //   const city = row.getValue("city") || row.getValue("location") || "";

    //   // Convert to strings and search in both fields
    //   const nameString = String(name).toLowerCase();
    //   const cityString = String(city).toLowerCase();

    //   return nameString.includes(searchValue) || cityString.includes(searchValue);
    // },
    getRowId: (row: any) => (row.id ?? row.user_id)?.toString(),
    state: {
      sorting,
      columnFilters,
      // globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
  });

  const getSimplifiedPagination = () => {
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = table.getPageCount()

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const startPages = [1, 2, 3]
    const endPages = [totalPages - 2, totalPages - 1, totalPages]
    const middlePages: (number | "...")[] = []

    if (currentPage > 4) {
      middlePages.push("...")
    }

    if (currentPage > 3 && currentPage < totalPages - 2) {
      middlePages.push(currentPage)
    }

    if (currentPage < totalPages - 3) {
      middlePages.push("...")
    }

    return [...startPages, ...middlePages, ...endPages].filter((v, i, a) => a.indexOf(v) === i)
  }

  const simplifiedPageNumbers = getSimplifiedPagination()

  return (
    <div>
      <div className="flex items-center justify-between py-4 gap-x-2">
        <Input
          placeholder="Search by name or city..."
          value={(table.getColumn("school_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("school_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-black"
        />
        <Input
          placeholder="Search by city..."
          value={(table.getColumn("city")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("city")?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-black"
        />

        <Select
          value={(table.getColumn("school_name")?.getFilterValue() as string) ?? ""}
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

      <div className="border rounded-md">
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
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
        // Changed: Used flex-wrap to handle the mobile stack better without rigid columns
        <div className="flex flex-wrap items-center justify-center gap-4 py-4 sm:flex-row sm:justify-between sm:gap-0">

          {/* Changed: Added w-full and justify-center to center the selector on mobile */}
          <div className='flex items-center w-full justify-center sm:w-auto sm:justify-start sm:space-x-6 lg:space-x-8'>
            <div className="flex items-center space-x-2">
              <p className="hidden text-sm font-medium sm:block">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
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

          {/* Navigation controls will naturally wrap to the next line on mobile due to flex-wrap */}
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
            {simplifiedPageNumbers.map((page, i) => (
              page === "..." ? (
                <Button
                  key={`ellipsis-${i}`}
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0"
                  disabled
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={table.getState().pagination.pageIndex === Number(page) - 1 ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => table.setPageIndex(Number(page) - 1)}
                >
                  <span>{page}</span>
                </Button>
              )
            ))}
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
  );
}