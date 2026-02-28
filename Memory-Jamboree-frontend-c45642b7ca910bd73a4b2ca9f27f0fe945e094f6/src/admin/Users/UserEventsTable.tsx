/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface Column {
  accessorKey: string;
  header: string;
}


interface UserEventsTableProps {
  columns: Column[];
  data: Record<string, any>[];
}

const UserEventsTable: React.FC<UserEventsTableProps> = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
       
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th 
                key={column.accessorKey} 
                className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.accessorKey}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserEventsTable;