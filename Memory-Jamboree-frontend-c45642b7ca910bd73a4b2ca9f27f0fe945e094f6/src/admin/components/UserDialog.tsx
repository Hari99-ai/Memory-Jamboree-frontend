import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { getDisciplines } from '../../lib/api';
import { DisciplineData } from '../../types';
 
export function DialogList({
  open,
  onOpenChange,
  onSubmit,
  preData = []
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (selectedIds: string[]) => void;
  preData?: { disc_id: number | string }[];
}) {
 
  const preSelectedIds = preData.map(d => String(d.disc_id));
 
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
 
  useEffect(() => {
    if (open) {
      setSelectedDisciplines(preSelectedIds);
    }
  }, [open, preData]);
 
  const { data: disciplines, isLoading } = useQuery<DisciplineData[]>({
    queryKey: ['disciplines'],
    queryFn: getDisciplines
  });
 
  const handleCheckboxChange = (disciplineId: string) => {
    setSelectedDisciplines(prev =>
      prev.includes(disciplineId)
        ? prev.filter(id => id !== disciplineId)
        : [...prev, disciplineId]
    );
  };
 
  const handleSubmit = () => {
    onSubmit(selectedDisciplines);
    onOpenChange(false);
  };
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Disciplines</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 text-center">Loading disciplines...</div>
        ) : (
          <div className="space-y-2 py-4">
            {disciplines?.map(discipline => (
              <div key={discipline.disc_id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`discipline-${discipline.disc_id}`}
                  checked={selectedDisciplines.includes(String(discipline.disc_id))}
                  onChange={() => handleCheckboxChange(String(discipline.disc_id))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`discipline-${discipline.disc_id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  {discipline.discipline_name}
                </label>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedDisciplines.length < 0}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
 