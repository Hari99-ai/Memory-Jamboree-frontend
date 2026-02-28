// import { useEffect, useRef, useState } from "react";
// import { SchoolsMasterData } from "../../types";
// import { Checkbox } from "../ui/checkbox";

// type SchoolsDropdownProps = {
//   selectedSchools: string[];
//   setSelectedSchools: (cls: string[]) => void;
//   schools: SchoolsMasterData[];
//   isLoading?: boolean;
// };

// export default function SchoolsDropdwon({
//   selectedSchools,
//   setSelectedSchools,
//   schools,
//   isLoading,
// }: SchoolsDropdownProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const toggleSchhools = (categoryId: string) => {
//     setSelectedSchools((prev) =>
//       prev.includes(categoryId)
//         ? prev.filter((id) => id !== categoryId)
//         : [...prev, categoryId]
//     );
//   };

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   if (isLoading) return <div>Loading schools...</div>;

//   return (
//     <div className="relative w-[520px]" ref={dropdownRef}>
//       <label className="block text-sm font-medium mb-2">Schools</label>
//       <button
//         onClick={toggleDropdown}
//         className="w-full flex justify-between items-center p-1.5 border rounded-md bg-white hover:bg-gray-50"
//       >
//         <span>
//           {selectedSchools.length > 0
//             ? `${selectedSchools.length} selected`
//             : "Select Schools"}
//         </span>
//         <svg
//           className={`h-4 w-4 transition-transform ${
//             isOpen ? "rotate-180" : ""
//           }`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M19 9l-7 7-7-7"
//           />
//         </svg>
//       </button>

//       {isOpen && (
//         <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white border shadow-lg">
//           <div className="p-2 space-y-2">
//             {schools?.map((school: SchoolsMasterData) => (
//               <label
//                 key={String(school.school_id)}
//                 className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
//               >
//                 <Checkbox
//                   checked={selectedSchools.includes(String(school.school_id))}
//                   onCheckedChange={() =>
//                     toggleSchhools(String(school.school_id))
//                   }
//                 />
//                 <span>{school.school_name}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}
//       {schools.length > 0 && (
//         <div className="mt-2">
//           {/* <h4 className="font-medium text-sm">Selected:</h4> */}
//           <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
//             {selectedSchools.map((id) => {
//               const school = schools?.find(
//                 (c: { school_id: string }) => String(c.school_id) === id
//               );
//               return <li key={school?.school_id}>{school?.school_name}</li>;
//             })}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }
