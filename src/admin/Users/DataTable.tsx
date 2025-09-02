/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as XLSX from "xlsx"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useState } from "react"
import { Skeleton } from "../../components/ui/skeleton"
import { ChevronLeft, ChevronRight, Download, MoreHorizontal } from "lucide-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { DeleteUsers, getSchools } from "../../lib/api"
import type { SchoolsMasterData } from "../../types"
import { Checkbox } from "../../components/ui/checkbox"
import toast from "react-hot-toast"

// Utility to convert state abbreviations to full names
const stateFullNameMap: { [key: string]: string } = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CT: "Chhattisgarh",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OR: "Odisha",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TG: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  WB: "West Bengal",
  AN: "Andaman and Nicobar Islands",
  CH: "Chandigarh",
  DN: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi",
  JK: "Jammu and Kashmir",
  LA: "Ladakh",
  LD: "Lakshadweep",
  PY: "Puducherry",
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  refetchUsers?: () => void
  hideExcelButton?: boolean
  showDownloadResultButton?: boolean
  resultData?: any[]
  eventName?: string
  disciplines?: any[]
}

export function DataTable<TData extends Record<string, any>, TValue>({
  columns,
  data,
  isLoading,
  refetchUsers,
  hideExcelButton = false,
  showDownloadResultButton = false,
  resultData,
  eventName,
  disciplines,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("") // State for the combined search filter
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [rowSelection, setRowSelection] = useState({})

  const { data: schools } = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
  })

  const gradeOptions = [
    "1st Grade",
    "2nd Grade",
    "3rd Grade",
    "4th Grade",
    "5th Grade",
    "6th Grade",
    "7th Grade",
    "8th Grade",
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
    "Others (Adult / Senior Citizen)",
  ]

  const selectionColumn: ColumnDef<any, any> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={() => table.toggleAllPageRowsSelected()}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onChange={() => row.toggleSelected()} aria-label="Select row" />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }
  const allColumns = [selectionColumn, ...columns]

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter, // Handle global filter changes
    getRowId: (row: any) => (row.id ?? row.user_id)?.toString(),
    state: {
      sorting,
      columnFilters,
      globalFilter, // Pass global filter state to the table
      pagination,
      rowSelection,
    },
    onPaginationChange: setPagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  })

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

  const { mutate } = useMutation({
    mutationKey: ["delete-users"],
    mutationFn: DeleteUsers,
  })

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const selectedIds: number[] = selectedRows.map((r) => Number(r.id))

    if (selectedIds.length === 0) {
      toast.error("No users selected.")
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected user(s)?`)) {
      return
    }

    mutate(selectedIds, {
      onSuccess: () => {
        toast.success("Users deleted successfully.")
        setRowSelection({})
        refetchUsers?.()
      },
      onError: (error: any) => {
        toast.error("Failed to delete users: " + error?.message)
      },
    })
  }

  const handleDownloadExcel = () => {
    // FIX: Use getFilteredRowModel() to download all data that matches the current filters
    const allFilteredData = table.getFilteredRowModel().rows.map((row) => row.original)

    const formattedData = allFilteredData.map((user) => ({
      "Full Name": `${user.fname} ${user.lname || ""}`.trim(),
      Email: user.email,
      Mobile: user.mobile,
      "School Name": user.school_name,
      Grade: user.school_class,
      City: user.city,
      // FIX: Map state abbreviation to full name
      State: stateFullNameMap[user.state?.toUpperCase()] || user.state,
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users")

    worksheet["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]

    XLSX.writeFile(workbook, "UsersList.xlsx")
  }

  const handleDownloadResultExcel = () => {
    if (!resultData || resultData.length === 0) {
      toast.error("No result data available to download.")
      return
    }

    // Create a map of discipline ID to name for easy lookup
    const disciplineMap = new Map(disciplines?.map((d) => [d.disc_id, d.discipline_name]) || [])

    const formattedData = resultData.map((user) => {
      // Base user data and overall scores
      const rowData: { [key: string]: any } = {
        "Full Name": `${user.fname} ${user.lname || ""}`.trim(),
        Email: user.email,
        "School Name": user.school_name,
        Class: user.school_class,
        City: user.city,
        State: stateFullNameMap[user.state?.toUpperCase()] || user.state,
        "Total Score": typeof user.total_score === "number" ? user.total_score.toFixed(2) : "-",
        "Category Rank": user.category_overall_rank ?? "-",
        "Overall Rank": user.event_overall_rank ?? "-",
      }

      // Dynamically add columns for each discipline's scores
      user.scores?.forEach((score: any) => {
        const discName = disciplineMap.get(score.disc_id) || `Discipline ${score.disc_id}`
        const finalScoreValue = parseFloat(String(score.score))

        rowData[`${discName} - Raw Score`] = score.raw_score ?? "-"
        rowData[`${discName} - Final Score`] = !isNaN(finalScoreValue) ? finalScoreValue.toFixed(2) : "-"
        rowData[`${discName} - Time Taken`] = score.time_taken ?? "-"
        rowData[`${discName} - Rank`] = score.rank ?? "-"
      })

      return rowData
    })

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results")

    // Auto-set column widths based on the generated data
    const columnWidths = Object.keys(formattedData[0] || {}).map((key) => {
      // Set a default width, but make some columns wider
      if (key.toLowerCase().includes("email") || key.toLowerCase().includes("school name")) {
        return { wch: 30 }
      }
      if (key.toLowerCase().includes("full name")) {
        return { wch: 25 }
      }
      return { wch: 18 } // Default width for score/rank columns
    })
    worksheet["!cols"] = columnWidths

    const fileName = eventName ? `${eventName}_Results.xlsx` : "EventResults.xlsx"
    XLSX.writeFile(workbook, fileName)
  }

  const gradeFilterValue = table.getColumn("school_class")?.getFilterValue() as string | undefined

  return (
    <div>
      {/* FIX: Combined filters and buttons into a single, responsive row */}
      <div className="flex items-center justify-between gap-2 py-4 flex-wrap  bg-white p-2 rounded">
        <div className="flex items-center gap-2 flex-wrap">
          {/* FIX: Combined name and email filter into a single global search input */}
          <Input
            placeholder="Search name, email..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-auto min-w-[250px] bg-slate-50 text-black"
          />

          {/* FIX: Made filter widths flexible and set background to white */}
          <Select
            value={gradeFilterValue ?? ""}
            onValueChange={(value) => {
              table.getColumn("school_class")?.setFilterValue(value === "__all__" ? undefined : value)
            }}
          >
            <SelectTrigger className="w-auto min-w-[10px] bg-white">
              {/* FIX: Show "Others..." when the long option is selected */}
              <SelectValue placeholder="Filter Grade">
                {gradeFilterValue === "Others (Adult / Senior Citizen)" ? "Others..." : gradeFilterValue}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectItem value="__all__">All Grades</SelectItem>
              {gradeOptions.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(table.getColumn("school_name")?.getFilterValue() as string) ?? ""}
            onValueChange={(value) => {
              table.getColumn("school_name")?.setFilterValue(value === "__all__" ? undefined : value)
            }}
          >
            <SelectTrigger className="w-auto min-w-[200px] bg-white">
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

        <div className="flex items-center gap-3">
          {showDownloadResultButton ? (
            <button
              onClick={handleDownloadResultExcel}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Download className="h-4 w-4" />
              Download Results
            </button>
          ) : (
            !hideExcelButton && (
              <button
                onClick={handleDownloadExcel}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <Download className="h-4 w-4" />
                Download Userlist
              </button>
            )
          )}

          {/* Destructive Action Button (Delete) */}
          <button
            onClick={handleDeleteSelected}
            disabled={table.getSelectedRowModel().rows.length === 0}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={header.column.columnDef.size ? { width: header.column.columnDef.size } : {}}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, index) => (
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
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={allColumns.length} className="h-24 text-center">
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
                  className="h-8 w-8 p-0 bg-transparent"
                  disabled
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={table.getState().pagination.pageIndex === Number(page) - 1 ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(Number(page) - 1)}
                >
                  <span>{page}</span>
                </Button>
              ),
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
  )
}