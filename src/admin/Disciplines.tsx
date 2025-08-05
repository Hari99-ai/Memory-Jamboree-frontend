import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  IconPlus,
  IconClock,
  IconChalkboard,
  IconTrash,
  IconPencil,
} from '@tabler/icons-react';
import {
  addDiscipline,
  getDisciplines,
  updateDiscipline,
  deleteDiscipline,
} from '../lib/api';
import { DisciplineData } from '../types';
import toast from 'react-hot-toast';
import { Skeleton } from '../components/ui/skeleton';

export default function Disciplines() {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState<DisciplineData | null>(null);

  const [formData, setFormData] = useState({
    discipline_name: '',
    formula: '',
    standard: '',
  });

  const { data: disciplines, isLoading, error, refetch } = useQuery({
    queryKey: ['disciplines'],
    queryFn: getDisciplines,
  });

  const { mutate: addMutate, isPending: isAddPending } = useMutation({
    mutationFn: addDiscipline,
    onSuccess: () => {
      toast.success('Discipline added successfully');
      setOpen(false);
      resetForm();
      refetch();
    },
  });

  const { mutate: updateMutate, isPending: isUpdatePending } = useMutation({
    mutationFn: ({ disc_id, data }: { disc_id: number; data: DisciplineData }) =>
      updateDiscipline(disc_id, data),
    onSuccess: () => {
      toast.success('Discipline updated successfully');
      setOpen(false);
      resetForm();
      refetch();
    },
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteDiscipline,
    onSuccess: () => {
      toast.success('Discipline deleted successfully');
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      discipline_name: '',
      formula: '',
      standard: '',
    });
    setCurrentDiscipline(null);
    setIsEdit(false);
  };

  const handleEdit = (discipline: DisciplineData) => {
    setCurrentDiscipline(discipline);
    setFormData({
      discipline_name: discipline.discipline_name || '',
      formula: discipline.formula || '',
      standard: discipline.standard?.toString() || '',
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this discipline?')) {
      deleteMutate(id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleStandardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        standard: value,
      }));
    }
  };

  const handleSubmit = () => {
    const { discipline_name, formula, standard } = formData;

    if (!discipline_name.trim() || !formula.trim() || standard.trim() === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    const parsedStandard = parseFloat(standard);
    if (isNaN(parsedStandard)) {
      toast.error('Standard must be a number');
      return;
    }

    const payload = {
      discipline_name: discipline_name.trim(),
      formula: formula.trim(),
      standard: parsedStandard,
    };

    if (isEdit && currentDiscipline) {
      if (!currentDiscipline.disc_id) {
        toast.error('Discipline Id is missing');
        return;
      }
      updateMutate({
        disc_id: currentDiscipline.disc_id,
        data: {
          discipline_name: formData.discipline_name.trim(),
          formula: formData.formula.trim(),
          standard: parseFloat(formData.standard),
        },
      });
    } else {
      addMutate(payload);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl text-center text-[#245cab]">Disciplines</h2>
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="flex gap-2 items-center bg-[#245cab] hover:bg-blue-700"
              onClick={() => {
                setIsEdit(false);
                resetForm();
              }}
            >
              <IconPlus className="size-5" />
              Add Discipline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit Discipline' : 'Add New Discipline'}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? 'Update discipline details'
                  : 'Enter new discipline details'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="discipline_name">Discipline Name*</Label>
                <Input
                  id="discipline_name"
                  placeholder="e.g., 5-Minute"
                  value={formData.discipline_name}
                  onChange={handleChange}
                  required
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formula">Formula*</Label>
                <Input
                  id="formula"
                  placeholder="e.g., value / 649 * 1000"
                  value={formData.formula}
                  onChange={handleChange}
                  required
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="standard">Standard*</Label>
                <Input
                  id="standard"
                  placeholder="Enter numeric standard"
                  value={formData.standard}
                  onChange={handleStandardChange}
                  type="text"
                  className="text-black"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isAddPending ||
                  isUpdatePending ||
                  !formData.discipline_name.trim() ||
                  !formData.formula.trim() ||
                  formData.standard.trim() === ''
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAddPending || isUpdatePending
                  ? isEdit
                    ? 'Updating...'
                    : 'Adding...'
                  : isEdit
                  ? 'Update Discipline'
                  : 'Add Discipline'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          Error loading disciplines. Please try again later.
        </div>
      )}

      {!isLoading && disciplines?.length === 0 && (
        <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <IconChalkboard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No disciplines yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first discipline.
          </p>
          <div className="mt-6">
            <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Discipline
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton className="h-[150px] w-[275px] rounded-xl bg-gray-300" key={i} />
            ))
          : disciplines?.map((ele: DisciplineData) => (
              <div
                key={ele.disc_id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 text-black relative border border-gray-200 flex flex-col min-h-[180px]"
              >
                {/* Card Actions */}
                <div className="absolute top-3 right-3 flex gap-1 z-10">
                  <button
                    onClick={() => handleEdit(ele)}
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-700 transition-colors"
                    title="Edit"
                  >
                    <IconPencil className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(Number(ele.disc_id))}
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-red-100 text-red-600 transition-colors"
                    title="Delete"
                  >
                    <IconTrash className="size-4" />
                  </button>
                </div>
                
                {/* Card Content */}
                <div className="flex flex-col h-full p-5 pt-8"> {/* Increased top padding */}
                  {/* Discipline Name */}
                  <div className="flex items-center gap-2 mb-3">
                    <IconChalkboard className="size-5 text-blue-500" />
                    <span className="font-extrabold text-lg text-[#245cab] leading-tight">
                      {ele.discipline_name}
                    </span>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-100 mb-3" />
                  
                  {/* Formula and Standard */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <IconClock className="size-4" />
                      <span className="font-medium">Formula:</span>
                    </div>
                    <div className="ml-6 mb-3 font-mono text-sm text-gray-900 break-words">
                      {ele.formula}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Standard:</span>
                      <span className="font-bold text-black">{ele.standard}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}