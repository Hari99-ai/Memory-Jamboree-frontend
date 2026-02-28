// import { useState, useRef, useEffect } from "react";
// import {  DisciplineData } from "../../types";
// import { Checkbox } from "../../components/ui/checkbox";

// type DisciplienDropdownProps = {
//   selectedDesciplines: string[];
//   setSelectedDesciplines: (categories: string[]) => void;
//   desciplines: DisciplineData[];
//   isLoading?: boolean;
// };

// export function SimpleDisciplineDropdown(
//   {
//     selectedDesciplines,
//     setSelectedDesciplines,
//     desciplines,
//     isLoading
//   }:DisciplienDropdownProps
// ) {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

  

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const toggleDiscipline = (categoryId: string) => {
//     setSelectedDesciplines(prev =>
//       prev.includes(categoryId)
//         ? prev.filter(id => id !== categoryId)
//         : [...prev, categoryId]
//     );
//   };

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   if (isLoading) return <div>Loading desciplines...</div>;

//   return (
//     <div className="relative w-[600px]" ref={dropdownRef}>
//       <label className="block text-sm font-medium mb-1">Select Desciplines</label>
      
//       <button
//         onClick={toggleDropdown}
//         className="w-full flex justify-between items-center p-2 border rounded-md bg-white hover:bg-gray-50"
//       >
//         <span>
//           {selectedDesciplines.length > 0
//             ? `${selectedDesciplines.length} selected`
//             : "Select Desciplines"}
//         </span>
//         <svg
//           className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>

//       {isOpen && (
//         <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white border shadow-lg">
//           <div className="p-2 space-y-2">
//             {desciplines?.map((discipline: DisciplineData) => (
//               <label
//                 key={String(discipline.disc_id)}
//                 className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
//               >
//                 <Checkbox
//                   checked={selectedDesciplines.includes(String(discipline.disc_id))}
//                   onCheckedChange={() => toggleDiscipline(String(discipline.disc_id))}
//                 />
//                 <span>
//                   {discipline.discipline_name}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}
//       {selectedDesciplines.length > 0 && (
//         <div className="mt-2">
//           <h4 className="font-medium text-sm">Selected:</h4>
//           <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
//           {selectedDesciplines.map(id => {
//           const descipline = desciplines?.find((c: {disc_id:string}) => String(c.disc_id) === id);
//           return (
//             <li key={descipline?.disc_id}>
//               {descipline?.discipline_name}
//             </li>
//           );
//         })}

//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }