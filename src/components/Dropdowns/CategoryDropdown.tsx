// import { useState, useRef, useEffect } from "react";
// import { CategoryMasterData } from "../../types";
// import { Checkbox } from "../../components/ui/checkbox";

// type CategoryDropdownProps = {
//   selectedCategories: string[];
//   setSelectedCategories: (categories: string[]) => void;
//   categories: CategoryMasterData[];
//   isLoading?: boolean;
// };

// export function SimpleCategoryDropdown({
//   selectedCategories,
//   setSelectedCategories,
//   categories,
//   isLoading = false,
// }: CategoryDropdownProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   // const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const dropdownRef = useRef<HTMLDivElement>(null);

  
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const toggleCategory = (categoryId: string) => {
//     setSelectedCategories(prev =>
//       prev.includes(categoryId)
//         ? prev.filter(id => id !== categoryId)
//         : [...prev, categoryId]
//     );
//   };

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   if (isLoading) return <div>Loading categories...</div>;

//   return (
//     <div className="relative w-[600px]" ref={dropdownRef}>
//       <label className="block text-sm font-medium mb-1">Select Categories</label>
      
//       <button
//         onClick={toggleDropdown}
//         className="w-full flex justify-between items-center p-2 border rounded-md bg-white hover:bg-gray-50"
//       >
//         <span>
//           {selectedCategories.length > 0
//             ? `${selectedCategories.length} selected`
//             : "Select categories"}
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
//             {categories?.map((category: CategoryMasterData) => (
//               <label
//                 key={String(category.cat_id)}
//                 className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
//               >
//                 <Checkbox
//                   checked={selectedCategories.includes(String(category.cat_id))}
//                   onCheckedChange={() => toggleCategory(String(category.cat_id))}
//                 />
//                 <span>
//                   {category.category_name} ({category.classes})
//                 </span>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Display selected categories */}
//       {selectedCategories.length > 0 && (
//         <div className="mt-2">
//           <h4 className="font-medium text-sm">Selected:</h4>
//           <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
//             {selectedCategories.map(id => {
//               const cat = categories?.find((c: { cat_id: string; }) => String(c.cat_id) === id);
//               return (
//                 <li key={id}>
//                   {cat?.category_name} ({cat?.classes})
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }