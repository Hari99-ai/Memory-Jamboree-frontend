import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { getClasses, AddClass } from "../../../lib/api";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ClassMasterData } from "../../../types";

export default function ClassMaster() {
    const [className, setClassName] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    const queryClient = useQueryClient();

    const { data: classes, isLoading: loadingClasses } = useQuery({
        queryKey: ['classes'],
        queryFn: getClasses,
      });

      const { mutate: addClass } = useMutation({
        mutationFn: AddClass,
        onSuccess: () => {
          toast.success("Class added successfully!");
          setClassName(""); // Reset input field
          queryClient.invalidateQueries({ queryKey: ['classes'] }); 
        },
        onError: () => {
          toast.error("Error adding class.");
        },
    });

    const handleAddClass = () => {
        if (!className.trim()) {
          toast.error("Please enter a class name");
          return;
        }
        addClass({ class_name: className });
      };
    

  
  return (
    <div className="max-w-7xl bg-white border shadow p-4 space-y-4 rounded-md mt-4">
        <h2 className="text-xl font-semibold">Classes Master</h2>
        <div className="flex gap-4">
          <Input
            type=""
            placeholder="Enter Class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="text-black"
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

              {/* {classes.map((element:ClassMasterData) => (
                <ul key={element.class_id}>
                  <li>{element.class_name}</li>
                </ul>
              ))} */}
            </div>
          )}
        </div>
      </div>
  )
}