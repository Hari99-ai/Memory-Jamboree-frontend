import { ColumnDef } from "@tanstack/react-table"
import { RegisterUserInput } from "../../../../types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { NavLink } from "react-router-dom"

export const columns = (
  activeTab: string,
  activeDisciplineId: number | null,
): ColumnDef<RegisterUserInput>[] => {
  // Base columns that are always visible
  const baseColumns: ColumnDef<RegisterUserInput>[] = [
    {
      id: "fullName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => `${row.fname} ${row.lname}`,
      cell: ({ row }) => {
        const id = row.original.id
        const name = `${row.original.fname} ${row.original.lname}`
        return (
          <NavLink to={`/admin/user/${id}`} className="text-blue-600 hover:underline">
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
  ]

  // Columns for the "Overall" tab
  if (activeTab === "overall") {
    return [
      ...baseColumns,
      {
        id: "total_score",
        header: "Total Score",
        cell: ({ row }) => {
          const total = row.original.total_score
          return <span>{typeof total === "number" ? total.toFixed(2) : "-"}</span>
        },
      },
      {
        id: "category_overall_rank",
        header: "Category Rank",
        cell: ({ row }) => <span>{row.original.category_overall_rank ?? "-"}</span>,
      },
      {
        id: "event_overall_rank",
        header: "Overall Rank",
        cell: ({ row }) => <span>{row.original.event_overall_rank ?? "-"}</span>,
      },
    ]
  }

  // Columns for a specific discipline tab
  return [
    ...baseColumns,
    {
      id: "raw_score",
      header: "Raw Score",
      cell: ({ row }) => {
        const scoreObj = row.original.scores?.find((s) => s.disc_id === activeDisciplineId)
        const rawScore = scoreObj?.raw_score
        const parsed = parseFloat(String(rawScore))
        const display = !isNaN(parsed) ? Math.round(parsed) : "-"
        return <span>{display}</span>
      },
    },
    {
      id: "final_score",
      header: "Final Score",
      cell: ({ row }) => {
        const scoreObj = row.original.scores?.find((s) => s.disc_id === activeDisciplineId)
        const Score = scoreObj?.score
        const parsed = parseFloat(String(Score))
        const display = !isNaN(parsed) ? parsed.toFixed(2) : "-"
        return <span>{display}</span>
      },
    },
    {
      id: "time_taken",
      header: "Time Taken",
      cell: ({ row }) => {
        const scoreObj = row.original.scores?.find((s) => s.disc_id === activeDisciplineId)
        return <span>{scoreObj?.time_taken ?? "-"}</span>
      },
    },
    {
      id: "category_rank",
      header: "Category Rank",
      cell: ({ row }) => {
        const scoreObj = row.original.scores?.find((s) => s.disc_id === activeDisciplineId)
        // Using discipline-specific rank from the score object
        return <span>{scoreObj?.rank ?? "-"}</span>
      },
    },
  ]
}