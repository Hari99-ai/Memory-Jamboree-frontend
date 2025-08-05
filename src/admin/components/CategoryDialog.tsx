import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { getCategory } from '../../lib/api';

export interface Category {
  cat_id: number;
  category_name: string;
  classes?: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (categories: Category[]) => void;
  previous: Category[] | null;
}

export function CategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  previous = [],
}: CategoryDialogProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategory,
    enabled: open,
  });

  useEffect(() => {
  if (open && Array.isArray(previous) && categories.length > 0) {
    const prefillIds = previous.map((c) => c.cat_id);
    setSelectedIds(prefillIds);
  }
}, [open, previous, categories]);


  const handleCheckbox = (cat_id: number) => {
    setSelectedIds((prev) =>
      prev.includes(cat_id)
        ? prev.filter((id) => id !== cat_id)
        : [...prev, cat_id]
    );
  };

  const handleSubmit = () => {
    const selected = categories.filter((cat) =>
      selectedIds.includes(Number(cat.cat_id))
    );
    if (onSubmit) onSubmit(selected);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Categories</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-4 text-center">Loading categories...</div>
        ) : (
          <div className="mb-4 space-y-2 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <label
                key={cat.cat_id}
                className={`flex items-center p-2 rounded cursor-pointer transition ${
                  selectedIds.includes(cat.cat_id) ? 'bg-blue-100' : ''
                }`}
              >
                <input
                  type="checkbox"
                  name="category"
                  value={cat.cat_id}
                  checked={selectedIds.includes(cat.cat_id)}
                  onChange={() => handleCheckbox(cat.cat_id)}
                  className="mr-3 accent-blue-600"
                />
                <span className="font-semibold">
                  Category {cat.category_name} - ({cat.classes}) Classes
                </span>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedIds.length === 0}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
