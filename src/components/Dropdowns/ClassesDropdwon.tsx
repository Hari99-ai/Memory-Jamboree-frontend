import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { ClassMasterData } from "../../types";

type ClassesDropdownProps = {
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  classes: ClassMasterData[];
  isLoading?: boolean;
};

export default function ClassesDropdwon({
  selectedClass,
  setSelectedClass,
  classes,
  isLoading,
}: ClassesDropdownProps) {
  const [customClass, setCustomClass] = useState("");

  return (
    <div className="w-full max-w-xl space-y-2">
      {isLoading ? (
        <p>Loading classes...</p>
      ) : (
        <>
          <Select
            onValueChange={(val) => {
              setSelectedClass(val);
              if (val !== "Other") setCustomClass(""); // reset custom input if not Other
            }}
            value={selectedClass}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Classes</SelectLabel>
                {classes.map((classGroup) => (
                  <SelectItem key={classGroup.class_id} value={String(classGroup.class_name)}>
                    {classGroup.class_name}
                  </SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {selectedClass === "Other" && (
            <Input
              type="text"
              placeholder="Enter custom class name"
              value={customClass}
              onChange={(e) => {
                setCustomClass(e.target.value);
                // setSelectedClass(e.target.value); // propagate custom value
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
