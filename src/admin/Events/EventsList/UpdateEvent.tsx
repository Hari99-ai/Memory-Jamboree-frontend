// import { useState, useEffect } from "react";
// import { Button } from "../../../components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../../components/ui/dialog";
// import { Input } from "../../../components/ui/input";
// import { Label } from "../../../components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../../components/ui/select";
// import { EventData } from "../../../types";
// import { DatePickers } from "../EventForm";
// import { useQuery } from "@tanstack/react-query";
// import { getCategory, getDisciplines } from "../../../lib/api";
// // import { SimpleDisciplineDropdown } from "../../../components/Dropdowns/DisciplineDropdown";
// // import { SimpleCategoryDropdown } from "../../../components/Dropdowns/CategoryDropdown";

// export function UpdateEventDialog({
//   open,
//   setOpen,
//   event,
//   handleSave,
// }: {
//   open: boolean;
//   setOpen: (val: boolean) => void;
//   event: EventData | null;
//   handleSave: (event: EventData) => void;
// }) {
//   const [formData, setFormData] = useState<EventData | null>(null);
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   // Fetch categories and disciplines
//   const { data: categories, isLoading: isCategoriesLoading } = useQuery({
//     queryKey: ["category"],
//     queryFn: getCategory,
//   });

//   const { data: disciplines, isLoading: isDisciplinesLoading } = useQuery({
//     queryKey: ["disciplines"],
//     queryFn: getDisciplines,
//   });

//   useEffect(() => {
//     if (event) {
//       // Safely handle disciplines - convert to array if it isn't one
//       const disciplinesArray = Array.isArray(event.disciplines) 
//         ? event.disciplines 
//         : event.disciplines ? [event.disciplines] : [];
      
//       // Safely handle category - convert to array if it isn't one
//       const categoryArray = Array.isArray(event.category)
//         ? event.category
//         : event.category ? [event.category] : [];

//       const initialData = { 
//         ...event,
//         disciplines: disciplinesArray,
//         category: categoryArray
//       };
      
//       setFormData(initialData);
//       setSelectedCategories(categoryArray.map(String));
//       setSelectedDisciplines(disciplinesArray.map(String));
//       setStartDate(formatDateTime(initialData.event_start));
//       setEndDate(formatDateTime(initialData.event_end));
//     }
//   }, [event]);

//   const handleDateChange = (date: string, type: "start" | "end") => {
//     if (!formData) return;

//     if (type === "start") {
//       setStartDate(date);
//       setFormData({ ...formData, event_start: date });
//     } else if (type === "end") {
//       setEndDate(date);
//       setFormData({ ...formData, event_end: date });
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!formData) return;
//     setFormData({ ...formData, [e.target.id]: e.target.value });
//   };

//   const handleCategoryChange = (ids: string[]) => {
//     setSelectedCategories(ids);
//     if (formData) {
//       setFormData({ 
//         ...formData, 
//         category: ids.map(Number) 
//       });
//     }
//   };

//   const handleDisciplineChange = (ids: string[]) => {
//     setSelectedDisciplines(ids);
//     if (formData) {
//       setFormData({ 
//         ...formData, 
//         disciplines: ids.map(Number) 
//       });
//     }
//   };

//   const handleSubmit = () => {
//     if (!formData) return;
    
//     // Prepare the data in the correct format for your API
//     const submissionData: EventData = {
//       ...formData,
//       category: formData.category,
//       disciplines: formData.disciplines,
//       event_start: startDate,
//       event_end: endDate
//     };

//     handleSave(submissionData);
//   };

//   if (!event || !formData) return null;

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline">Edit Event</Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[700px] min-h-[600px]">
//         <DialogHeader>
//           <DialogTitle>Edit Event</DialogTitle>
//           <DialogDescription>
//             Make changes to the event here. Click save when you're done.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
//           {/* Event Name */}
//           <div>
//             <Label htmlFor="ename">Event Name</Label>
//             <Input
//               id="ename"
//               value={formData.ename}
//               onChange={handleInputChange}
//             />
//           </div>

//           {/* Event Type */}
//           <div>
//             <Label>Event Type</Label>
//             <Select
//               value={String(formData.category)}
//               onValueChange={(val) => {
//                 setFormData({ ...formData, estatus: Number(val) });
//               }}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="1">Paid</SelectItem>
//                 <SelectItem value="0">Unpaid</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Date Pickers */}
//           <div className="col-span-2">
//             <DatePickers
//               startDate={startDate}
//               endDate={endDate}
//               onChange={handleDateChange}
//             />
//           </div>

//           {/* Category and Discipline Dropdowns */}
//           <div className="col-span-2 grid grid-cols-2 gap-4">
//             <div>
//               <Label>Categories</Label>
//               <SimpleCategoryDropdown
//                 selectedCategories={selectedCategories}
//                 setSelectedCategories={handleCategoryChange}
//                 categories={categories || []}
//                 isLoading={isCategoriesLoading}
//               />
//             </div>
//             <div>
//               <Label>Disciplines</Label>
//               <SimpleDisciplineDropdown
//                 desciplines={disciplines || []}
//                 selectedDesciplines={selectedDisciplines}
//                 isLoading={isDisciplinesLoading}
//                 setSelectedDesciplines={handleDisciplineChange}
//               />
//             </div>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button onClick={handleSubmit}>Save changes</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function formatDateTime(dateString: string | undefined): string {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toISOString().slice(0, 16);
// }