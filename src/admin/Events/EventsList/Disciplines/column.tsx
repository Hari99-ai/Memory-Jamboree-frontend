/* eslint-disable @typescript-eslint/no-explicit-any */
export const DisciplineColumn = [
    {
      accessorKey: "id",
      header: "Id",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row } :any) => (row.original.status === 1 ? "Active" : "Inactive"),
    },
  ];
  