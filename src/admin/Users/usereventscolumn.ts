// import { ColumnDef } from "@tanstack/react-table";
// import { UserEventDetails } from "../../types";

interface Column {
  accessorKey: string;
  header: string;
}


export const usereventscolumns = (): Column[] => [
  {
    accessorKey: "ename",
    header: "Event Name",
  },
  {
    accessorKey: "finalscore",
    header: "Final Score",
  },
  {
    accessorKey: "calc_score",
    header: "Score",
  },
  {
    accessorKey: "category_rank",
    header: "Category Rank",
  },
  {
    accessorKey: "overall_rank",
    header: "Overall Rank",
  },
  {
    accessorKey: "created_at",
    header: "Submitted At",
  },
  // {
  //   id: "disciplines",
  //   header: "Disciplines",
  //   cell: ({ row }) => {
  //     const disciplines = row.original.discipline_scores || [];
  //     return (
  //        <div className="space-y-1">
  //         {disciplines.map((d: any, idx: any) => (
  //           <div key={idx}>
  //             <strong>{d.discipline_name}:</strong> {d.score}
  //           </div>
  //         ))}
  //       </div>
        
  //     );
  //   },
  // },
];
