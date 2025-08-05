// import { cn } from "../../lib/utils";

// export interface Category {
//   cat_id: number;
//   category_name?: string;
// }

// interface CategoryStepperProps {
//   categories: Category[];
//   activeTab: number;
//   setActiveTab: (tabId: number) => void;
// }

// export default function CategoryStepper({
//   categories,
//   activeTab,
//   setActiveTab,
// }: CategoryStepperProps) {
//   return (
//     <div className="flex gap-4 mb-4 border-b border-gray-300">
//       {categories.map((category) => (
//         <button
//           key={category.cat_id}
//           onClick={() => setActiveTab(category.cat_id)}
//           className={cn(
//             "relative py-2 px-4 text-center transition-colors duration-300",
//             activeTab === category.cat_id
//               ? "text-black font-semibold"
//               : "text-gray-500"
//           )}
//         >
//           Category {category.category_name || "Unnamed"}
//           <span
//             className={cn(
//               "absolute bottom-0 left-0 h-[2px] transition-all duration-300",
//               activeTab === category.cat_id
//                 ? "bg-blue-600 w-full"
//                 : "w-0"
//             )}
//           />
//         </button>
//       ))}
//     </div>
//   );
// }

// import { cn } from "../../lib/utils";
 
// export interface Category {
//   cat_id: number;
//   category_name?: string;
// }
 
// interface CategoryStepperProps {
//   categories: Category[];
//   activeTab: string | number;
//   setActiveTab: (tabId: string | number) => void;
// }
 

// export default function CategoryStepper({
//   categories,
//   activeTab,
//   setActiveTab,
// }: CategoryStepperProps) {
//   return (
//     <div className="flex gap-4 mb-4 border-b border-gray-300">
//       {/* Add Overall tab */}
//       <button
//         key="overall"
//         onClick={() => setActiveTab("overall")}
//         className={cn(
//           "relative py-2 px-4 text-center transition-colors duration-300",
//           activeTab === "overall"? "text-black font-semibold"
//             : "text-gray-500"
//         )}
//       >
//         Overall
//         <span
//           className={cn(
//             "absolute bottom-0 left-0 h-[2px] transition-all duration-300",
//             activeTab === "overall" ? "bg-blue-600 w-full" : "w-0"
//           )}
//         />
//       </button>
 
//       {/* Other categories */}
//       {categories.map((category) => (
//         <button
//           key={category.cat_id}
//           onClick={() => setActiveTab(category.cat_id)}
//           className={cn(
//             "relative py-2 px-4 text-center transition-colors duration-300",
//             activeTab === category.cat_id
//               ? "text-black font-semibold"
//               : "text-gray-500"
//           )}
//         >
//           {category.category_name || "Unnamed"}
//           <span
//             className={cn(
//               "absolute bottom-0 left-0 h-[2px] transition-all duration-300",
//               activeTab === category.cat_id ? "bg-blue-600 w-full" : "w-0"
//             )}
//           />
//         </button>
//       ))}
//     </div>
//   );
// }


import { cn } from "../../lib/utils";
import { OverallData, RegisterUserInput , } from "../../types";

export interface Category {
  cat_id: number;
  category_name?: string;
}

interface CategoryStepperProps {
  categories: Category[];
  activeTab: string | number;
  setActiveTab: (tabId: string | number) => void;
  overallUsers?: RegisterUserInput[] | OverallData[];
}

export default function CategoryStepper({
  categories,
  activeTab,
  setActiveTab,
  overallUsers,
}: CategoryStepperProps) {
  return (
    <div className="flex gap-4 mb-4 border-b border-gray-300">
      {/* Overall tab */}
      <button
        key="overall"
        onClick={() => setActiveTab("overall")}
        className={cn(
          "relative py-2 px-4 text-center transition-colors duration-300",
          activeTab === "overall" ? "text-black font-semibold" : "text-gray-500"
        )}
      >
        Overall ({overallUsers?.length ?? 0})
        <span
          className={cn(
            "absolute bottom-0 left-0 h-[2px] transition-all duration-300",
            activeTab === "overall" ? "bg-blue-600 w-full" : "w-0"
          )}
        />
      </button>

      {/* Category tabs */}
      {categories.map((category) => (
        <button
          key={category.cat_id}
          onClick={() => setActiveTab(category.cat_id)}
          className={cn(
            "relative py-2 px-4 text-center transition-colors duration-300",
            activeTab === category.cat_id
              ? "text-black font-semibold"
              : "text-gray-500"
          )}
        >
          {category.category_name || "Unnamed"}
          <span
            className={cn(
              "absolute bottom-0 left-0 h-[2px] transition-all duration-300",
              activeTab === category.cat_id ? "bg-blue-600 w-full" : "w-0"
            )}
          />
        </button>
      ))}
    </div>
  );
}
