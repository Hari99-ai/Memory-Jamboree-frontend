import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Addcategory, getCategory, updateCategory } from "../../../lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { DataTable } from "./MastersTable";
import { Categorycolumns } from "./MasterColumn";
import { CategoryMasterData } from "../../../types";
import Loader2 from "../../../components/Loader2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";

export default function CategoryMaster() {
  const [categoryName, setCategoryName] = useState("");
  const [categoryClassName, setCategoryClassName] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryMasterData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Add state to store previous class selection when toggling to "Others"
  const [previousClassSelection, setPreviousClassSelection] = useState("");

  const queryClient = useQueryClient();

  const {
    data: category,
    isLoading: loadingCategory,
    refetch
  } = useQuery({
    queryKey: ["category"],
    queryFn: getCategory,
  });

  const { mutate: addCategory } = useMutation({
    mutationFn: Addcategory,
    onSuccess: () => {
      toast.success("Category added successfully");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["category"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Error adding category.");
    },
  });

  const { mutate: updateCategoryMutation, isPending: isUpdating } = useMutation({
    mutationFn: (data: { id: number; category: any }) =>
      updateCategory(data.id, data.category),
    onSuccess: () => {
      toast.success("Category updated successfully!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["category"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Error updating category.");
    },
  });

  const resetForm = () => {
    setCategoryName("");
    setCategoryClassName("");
    setIsOtherSelected(false);
    setIsEditMode(false);
    setSelectedCategory(null);
    setPreviousClassSelection("");
  };

  useEffect(() => {
    if (selectedCategory && isEditMode) {
      setCategoryName(selectedCategory.category_name);
      
      if (selectedCategory.classes === "Others") {
        setIsOtherSelected(true);
        setCategoryClassName("");
      } else {
        setIsOtherSelected(false);
        setCategoryClassName(String(selectedCategory?.classes));
      }
    }
  }, [selectedCategory, isEditMode]);

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const classValue = isOtherSelected ? "Others" : categoryClassName;

    if (!classValue) {
      toast.error("Please select class range or choose Others");
      return;
    }

    const categoryData = {
      category_name: categoryName,
      classes: classValue,
      cat_id:0      
    };

    if (isEditMode && selectedCategory) {
      updateCategoryMutation({
        id: Number(selectedCategory.cat_id),
        category: categoryData
      });
    } else {
      addCategory(categoryData);
    }
  };

  const handleEdit = (category: CategoryMasterData) => {
    console.log("Edit category:", category);
    setIsEditMode(true);
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  // Handle checkbox change in a separate function to avoid re-render issues
  const handleOthersCheckboxChange = (checked: boolean) => {
    if (checked) {
      // Save current class selection before setting to "Others"
      setPreviousClassSelection(categoryClassName);
      setCategoryClassName("");
    } else {
      // Restore previous class selection when unchecking "Others"
      setCategoryClassName(previousClassSelection);
    }
    setIsOtherSelected(checked);
  };

  if (loadingCategory)
    return (
      <div>
        <Loader2 />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Category Master</h2>
        <Button
          variant="default"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          + Add Category
        </Button>
      </div>

      {/* Use controlled dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                type="text"
                placeholder="Enter Category Name"
                value={categoryName}
                className="text-black"
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Class Range</Label>
              
              <div className="space-y-3">
                <ClassRangeSelector
                  key={`class-selector-${isOtherSelected}`} // Add key to force re-render when needed
                  value={categoryClassName}
                  onChange={(val) => {
                    setCategoryClassName(val);
                    if (val) setIsOtherSelected(false);
                  }}
                  disabled={isOtherSelected}
                />

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="others"
                    checked={isOtherSelected}
                    onChange={(e) => handleOthersCheckboxChange(e.target.checked)}
                  />
                  <Label htmlFor="others" className="cursor-pointer">
                    Others (not grade specific)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : isEditMode ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-white border shadow p-4 rounded-md">
        <DataTable
          columns={Categorycolumns(refetch, handleEdit)}
          data={category || []}
        />
      </div>
    </div>
  );
}

type ClassRangeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ClassRangeSelector({
  value,
  onChange,
  disabled = false,
}: ClassRangeSelectorProps) {
  const classOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const [startClass, setStartClass] = useState<number | undefined>();
  const [endClass, setEndClass] = useState<number | undefined>();

  // Parse existing value on component mount or when value changes
  useEffect(() => {
    if (!value) {
      // Clear the internal state if no value is provided
      setStartClass(undefined);
      setEndClass(undefined);
      return;
    }
    
    if (value.includes(" to ")) {
      const [start, end] = value.split(" to ").map(v => parseInt(v.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        setStartClass(start);
        setEndClass(end);
      }
    }
  }, [value]);

  // Only update parent when both values are set and valid
  useEffect(() => {
    if (startClass && endClass && startClass <= endClass) {
      onChange(`${startClass} to ${endClass}`);
    }
  }, [startClass, endClass, onChange]);

  // Handle disabling - clear internal state
  useEffect(() => {
    if (disabled) {
      setStartClass(undefined);
      setEndClass(undefined);
    }
  }, [disabled]);

  return (
    <div className={`flex gap-2 items-center ${disabled ? "opacity-50" : "opacity-100"}`}>
      <div className="w-32">
        <Select
          onValueChange={(val) => setStartClass(parseInt(val))}
          disabled={disabled}
          value={startClass ? String(startClass) : undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="Start Class" />
          </SelectTrigger>
          <SelectContent>
            {classOptions.map((cls) => (
              <SelectItem key={cls} value={String(cls)}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span>to</span>

      <div className="w-32">
        <Select
          onValueChange={(val) => setEndClass(parseInt(val))}
          disabled={disabled || startClass === undefined}
          value={endClass ? String(endClass) : undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="End Class" />
          </SelectTrigger>
          <SelectContent>
            {classOptions.map((cls) => (
              <SelectItem
                key={cls}
                value={String(cls)}
                disabled={startClass !== undefined && cls < startClass}
              >
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}