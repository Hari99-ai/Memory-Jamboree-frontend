import { ColumnDef } from "@tanstack/react-table";
// import { Checkbox } from "../../../../components/ui/checkbox";
import { RegisterUserInput } from "../../../../types";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { NavLink } from "react-router-dom";
 
// export const columns = (activeTab: string , activeDisciplineId: number | null ): ColumnDef<RegisterUserInput>[] => [
//   {
//     id: "fullName",
//     header: ({ column }) => (
//       <Button
//         variant="ghost"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Name
//         <ArrowUpDown className="ml-2 h-4 w-4" />
//       </Button>
//     ),
//     accessorFn: (row) => `${row.fname} ${row.lname}`,
//     cell: ({ row }) => {
//       const id = row.original.id;
//       const name = `${row.original.fname} ${row.original.lname}`;
//       return (
//         <NavLink
//           to={`/admin-dashboard/user/${id}`}
//           className="text-blue-600 hover:underline"
//         >
//           {name}
//         </NavLink>
//       );
//     },
//   },
//   {
//     accessorKey: "email",
//     header: "Email",
//   },
//   {
//     accessorKey: "school_name",
//     header: "School Name",
//   },
//   {
//     accessorKey: "school_class",
//     header: "Class",
//   },
//   {
//   accessorKey: "scores",
//    header: activeTab === "overall" ? "Total Score" : "Raw Score",
//   cell: ({ row }) => {
 
//     const user = row.original;
 
//      if (activeTab === "overall") {
//       const total = user.total_score;
//       return <span>{typeof total === "number" ? total.toFixed(2) : "-"}</span>;
//     }
 
//     const scoreObj = user.scores?.find(s => s.disc_id === activeDisciplineId);

//     const rawScore = scoreObj?.raw_score; // Use 'raw_score' instead of 'calc_score' if that's what you store
//     const parsed = parseFloat(String(rawScore));
//     const display = !isNaN(parsed) ? Math.round(parsed) : "-";
//     return <span>{display}</span>;
//   },
// },
// {
//   accessorKey: "scores",
//   header: activeTab === "overall" ? "Category Rank" : "Final Score",
//   cell: ({ row }) => {
//     const user = row.original;
//     if (activeTab === "overall") {
//       return <span>{user.category_overall_rank ?? "-"}</span>;
//     }
 
//     const scoreObj = user.scores?.find(s => s.disc_id === activeDisciplineId);
//     const Score = scoreObj?.score;
//     const parsed = parseFloat(String(Score));
//     const display = !isNaN(parsed) ? parsed.toFixed(2) : "-";
//     return <span>{display}</span>;
//   },
// },
// {
//   accessorKey: "scores",
//   header: activeTab === "overall" ? "Overall Rank" : "Category Rank",
//   cell: ({ row }) => {
//     const user = row.original;
//     if (activeTab === "overall") {
//       return <span>{user.event_overall_rank ?? "-"}</span>;
//     }
//     // const scoreObj = user.scores?.find(s => s.disc_id === activeDisciplineId);
//     // const rank = scoreObj?.rank;
//     // return <span>{rank ?? "-"}</span>;
   
//     return <span>{user.category_overall_rank ?? "-"}</span>;
   
//   },
// },
 
// ];
 

export const columns = (
  activeTab: string,
  activeDisciplineId: number | null,
  // overall_users: number | undefined // ✅ Added
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
    accessorFn: (row) => `${row.fname} ${row.lname}`,
    cell: ({ row }) => {
      const id = row.original.id;
      const name = `${row.original.fname} ${row.original.lname}`;
      return (
        <NavLink
          to={`/admin/user/${id}`}
          className="text-blue-600 hover:underline"
        >
          {name}
        </NavLink>
      );
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
  {
    accessorKey: "scores",
    header: activeTab === "overall" ? "Total Score" : "Raw Score",
    cell: ({ row }) => {
      const user = row.original;

      if (activeTab === "overall") {
        const total = user.total_score;
        return <span>{typeof total === "number" ? total.toFixed(2) : "-"}</span>;
      }

      const scoreObj = user.scores?.find(s => s.disc_id === activeDisciplineId);
      const rawScore = scoreObj?.raw_score;
      const parsed = parseFloat(String(rawScore));
      const display = !isNaN(parsed) ? Math.round(parsed) : "-";
      return <span>{display}</span>;
    },
  },
  {
    accessorKey: "scores",
    header: activeTab === "overall" ? "Category Rank" : "Final Score",
    cell: ({ row }) => {
      const user = row.original;
      if (activeTab === "overall") {
        return <span>{user.category_overall_rank ?? "-"}</span>;
      }

      const scoreObj = user.scores?.find(s => s.disc_id === activeDisciplineId);
      const Score = scoreObj?.score;
      const parsed = parseFloat(String(Score));
      const display = !isNaN(parsed) ? parsed.toFixed(2) : "-";
      return <span>{display}</span>;
    },
  },
  {
    accessorKey: "scores",
    header: activeTab === "overall" ? "Overall Rank" : "Category Rank",
    cell: ({ row }) => {
      const user = row.original;
      if (activeTab === "overall") {
        return <span>{user.event_overall_rank ?? "-"}</span>;
      }
      return <span>{user.category_overall_rank ?? "-"}</span>;
    },
  },
  // {
  //   id: "overallUsers",
  //   header: "Total Users",
  //   cell: () => <span>{overall_users ?? "-"}</span>,
  //   enableSorting: false,
  // }
];

 