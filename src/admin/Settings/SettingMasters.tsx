import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {  useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/ui/select";
import { AddSchool, AddClass, getSchools, getClasses, Addcategory, getCategory } from "../../lib/api";
import toast from "react-hot-toast";
import { CategoryMasterData, ClassMasterData, SchoolsMasterData } from "../../types";
// import { cn } from "../../lib/utils";

export default function SettingMasters() {
  // State for input values
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [CategoryName , setCategoryName] = useState("")
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCateory, setSelectedCategory] = useState("");
  const [categoryClassName , setCategoryClassName] = useState("")

  // const classList = Array.from({ length: 12 }, (_, i) => `${i + 1}`) 
  
  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch Schools
  const { data: schools, isLoading: loadingSchools } = useQuery({
    queryKey: ['schools'],
    queryFn: getSchools,
  });

  // Fetch Classes
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });


  const {data: category , isLoading: loadingCategory} = useQuery({
    queryKey: ['category'],
    queryFn: getCategory
  })


  // Add School Mutation
  const { mutate: addSchool } = useMutation({
    mutationFn: AddSchool,
    onSuccess: () => {
      toast.success("School added successfully!");
      setSchoolName(""); // Reset input field
      queryClient.invalidateQueries({ queryKey: ['schools'] }); // Refresh schools data
    },
    onError: () => {
      toast.error("Error adding school.");
    },
  });

  // Add Class Mutation
  const { mutate: addClass } = useMutation({
    mutationFn: AddClass,
    onSuccess: () => {
      toast.success("Class added successfully!");
      setClassName(""); // Reset input field
      queryClient.invalidateQueries({ queryKey: ['classes'] }); // Refresh classes data
    },
    onError: () => {
      toast.error("Error adding class.");
    },
  });

  const {mutate: addCateory} = useMutation({
    mutationFn: Addcategory,
    onSuccess: () => {
      toast.success("Category Added successfully")
      setSelectedCategory("")
      setCategoryClassName("")
      setCategoryName("")
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
    onError: () => {
      toast.error("Error adding school.");
    },
  })

  // Handle adding school
  const handleAddSchool = () => {
    if (!schoolName.trim()) {
      toast.error("Please enter a school name");
      return;
    }
    addSchool({
      school_name: schoolName,
      country: "",
      city: "",
      state: "",
      school_id: 0
    });
  };

  // Handle adding class
  const handleAddClass = () => {
    if (!className.trim()) {
      toast.error("Please enter a class name");
      return;
    }
    addClass({ class_name: className });
  };


  const handleCategory = () => {
    if (!CategoryName.trim()) {
      toast.error("Please enter a school name");
      return;
    }
    addCateory({
      category_name: CategoryName,
      classes: categoryClassName,
      cat_id: 0
    });
  }

  const [startValue, setStartValue] = useState(1);
  const [endValue, setEndValue] = useState(5);

  // const numberContainerRef = useRef(null);

  // Update selected numbers when range changes
  // useEffect(() => {
  //   const start = Math.min(startValue, endValue);
  //   const end = Math.max(startValue, endValue);
    
  //   if (start > 0 && end <= 100) {
  //     const numbers = [];
  //     for (let i = start; i <= end; i++) {
  //       numbers.push(i);
  //     }
  //     setSelectedNumbers(numbers);
  //   }
  // }, [startValue, endValue]);

  const handleStartValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      setStartValue(value);
      setCategoryClassName(`${value} to ${endValue}`)
    }
  };

  const handleEndValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      setEndValue(value);
      setCategoryClassName(`${startValue} to ${value}`)
    }
  };

  return (
    <div>
      {/* Schools Section */}
      <div className="max-w-7xl bg-white border shadow p-4 space-y-4 rounded-md">
        <h2 className="text-xl font-semibold">School Master</h2>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter School"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
          <Button onClick={handleAddSchool}>+ Add</Button>
        </div>
        <div>
          <h3 className="font-medium mb-2">Existing Schools</h3>
          {loadingSchools ? (
            <p>Loading schools...</p>
          ) : (
            <div className="w-full max-w-xs">
              <Select onValueChange={setSelectedSchool} value={selectedSchool}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Schools</SelectLabel>
                    {schools?.map((school:SchoolsMasterData) => (
                      <SelectItem key={school.school_id} value={String(school.school_id)} className="text-black">
                        {school.school_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Classes Section */}
      <div className="max-w-7xl bg-white border shadow p-4 space-y-4 rounded-md mt-4">
        <h2 className="text-xl font-semibold">Classes Master</h2>
        <div className="flex gap-4">
          <Input
            type=""
            placeholder="Enter Class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <Button onClick={handleAddClass}>+ Add</Button>
        </div>
        <div>
          <h3 className="font-medium mb-2">Existing Classes</h3>
          {loadingClasses ? (
            <p>Loading classes...</p>
          ) : (
            <div className="w-full max-w-xs">
              <Select onValueChange={setSelectedClass} value={selectedClass}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    {classes?.map((classGroup:ClassMasterData) => (
                      <SelectItem key={classGroup.class_id} value={String(classGroup.class_id)}>
                        {classGroup.class_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>



      <div className="max-w-7xl bg-white border shadow p-4 space-y-4 rounded-md mt-4">
        <h2 className="text-xl font-semibold">Category Master</h2>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter Category"
            value={CategoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <div className="flex gap-2">
          <label htmlFor="classes">Classes</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Start (e.g. 5th)"
              value={startValue}
              onChange={handleStartValueChange}
              className="w-full px-3 py-2 border rounded-md"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="End (e.g. 7th)"
              value={endValue}
              onChange={handleEndValueChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
          <Button onClick={handleCategory}>+ Add</Button>
        </div>
        <div>
          <h3 className="font-medium mb-2">Existing Categories</h3>
          {loadingCategory ? (
            <p>Loading classes...</p>
          ) : (
            <div className="w-full max-w-xs">
              <Select onValueChange={setSelectedClass} value={selectedCateory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    {category?.map((element:CategoryMasterData) => (
                      <SelectItem key={element.cat_id} value={String(element.cat_id)}>
                        {`${element.category_name } - (${element.classes}) `}  
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






