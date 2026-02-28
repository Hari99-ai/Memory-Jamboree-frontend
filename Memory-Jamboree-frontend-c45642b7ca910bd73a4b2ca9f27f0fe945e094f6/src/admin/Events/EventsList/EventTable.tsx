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
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useState } from "react";
import { Skeleton } from "../../../components/ui/skeleton";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { DataTableFacetedFilter } from "../../components/data-table-filter";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
}

export function EventTable<TData, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  // Get simplified pagination information
 const getSimplifiedPagination = () => {
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = table.getPageCount()
    // const pages: (number | "...")[] = []

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
      <div className="flex items-center py-4">
        <Input
          placeholder="Enter your Event Name"
          value={(table.getColumn("ename")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("ename")?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-black"
        />
        <div className='flex gap-x-2 ml-10'>
          {table.getColumn("estatus") && (
            <DataTableFacetedFilter
              column={table.getColumn('estatus')}
              title='Type'
              options={[
                { label: 'Paid', value: 1 },
                { label: 'Unpaid', value: 0 },
              ]}
            />
          )}
          {table.getColumn("etype") && (
            <DataTableFacetedFilter
              column={table.getColumn('etype')}
              title='Status'
              options={[
                { label: 'Live', value: 1 },
                { label: 'Upcoming', value: 2 },
                { label: 'Expired', value: 0 },
              ]}
            />
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
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
                      colSpan={columns.length}
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
        <div className="flex items-center justify-center space-x-4 py-4">
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
            {simplifiedPageNumbers.map((page, i) => {
              if (page === "...") {
                return (
                  <Button
                    key={`ellipsis-${i}`}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                );
              }
              
              return (
                <Button
                  key={`page-${page}`}
                  variant={table.getState().pagination.pageIndex === page - 1 ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
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
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}