import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { getSchools } from '../../lib/api';
 
export type School = {
  city: string;
  country: string;
  school_id: number;
  school_name: string;
  state: string;
};
 
export function SchoolDialog({
  open,
  onOpenChange,
  onSubmit,
  previous = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (selectedIds: number[], selectedSchools: School[]) => void;
  previous?: School[];
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
 
  // Fetch schools using React Query
  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: getSchools,
    enabled: open, // only fetch when dialog is open
  });
 
  // Pre-select previous schools when dialog opens
  useEffect(() => {
    if (open && previous) {
      setSelectedIds(previous.map((s) => s.school_id));
    }
  }, [open, previous]);
 
  // Filter schools by search
  const filteredSchools = useMemo(() => {
    const s = search.toLowerCase();
    return schools.filter(
      (school) =>
        school.school_name.toLowerCase().includes(s) ||
        school.city.toLowerCase().includes(s) ||
        school.state.toLowerCase().includes(s)
    );
  }, [schools, search]);
 
  const handleCheckbox = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
 
  const handleSubmit = () => {
    const selectedSchools = schools.filter((school) =>
      selectedIds.includes(school.school_id)
    );
    onSubmit(selectedIds, selectedSchools);
    onOpenChange(false);
    setSearch('');
  };
 
  const handleCancel = () => {
    onOpenChange(false);
    setSearch('');
  };
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Schools</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, city, or state"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div className="max-h-64 overflow-y-auto border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2"></th>
                <th className="p-2 text-left">School Name</th>
                <th className="p-2 text-left">City</th>
                <th className="p-2 text-left">State</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    Loading schools...
                  </td>
                </tr>
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    No schools found.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.school_id}>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(school.school_id)}
                        onChange={() => handleCheckbox(school.school_id)}
                      />
                    </td>
                    <td className="p-2">{school.school_name}</td>
                    <td className="p-2">{school.city}</td>
                    <td className="p-2">{school.state}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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