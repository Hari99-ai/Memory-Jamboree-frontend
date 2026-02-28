import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Pencil,
  Calculator,
  Ruler,
  BookOpen,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  addDiscipline,
  getDisciplines,
  updateDiscipline,
  deleteDiscipline,
} from "../lib/api";
import { DisciplineData } from "../types";

// --- Custom UI Components ---

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const InputGroup = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-800"
    />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-[200px] flex flex-col justify-between">
    <div className="flex justify-between">
      <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
    <div className="space-y-3 mt-4">
      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// --- Main Component ---

export default function Disciplines() {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState<DisciplineData | null>(null);

  const [formData, setFormData] = useState({
    discipline_name: "",
    formula: "",
    standard: "",
  });

  const { data: disciplines, isLoading, error, refetch } = useQuery({
    queryKey: ["disciplines"],
    queryFn: getDisciplines,
  });

  const { mutate: addMutate, isPending: isAddPending } = useMutation({
    mutationFn: addDiscipline,
    onSuccess: () => {
      alert("Discipline added successfully");
      closeModal();
      refetch();
    },
    onError: () => alert("Failed to add discipline"),
  });

  const { mutate: updateMutate, isPending: isUpdatePending } = useMutation({
    mutationFn: ({ disc_id, data }: { disc_id: number; data: DisciplineData }) =>
      updateDiscipline(disc_id, data),
    onSuccess: () => {
      alert("Discipline updated successfully");
      closeModal();
      refetch();
    },
    onError: () => alert("Failed to update discipline"),
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteDiscipline,
    onSuccess: () => {
      refetch();
    },
    onError: () => alert("Failed to delete discipline"),
  });

  const resetForm = () => {
    setFormData({
      discipline_name: "",
      formula: "",
      standard: "",
    });
    setCurrentDiscipline(null);
    setIsEdit(false);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const handleEdit = (discipline: DisciplineData) => {
    setCurrentDiscipline(discipline);
    setFormData({
      discipline_name: discipline.discipline_name || "",
      formula: discipline.formula || "",
      standard: discipline.standard?.toString() || "",
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this discipline?")) {
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

    if (!discipline_name.trim() || !formula.trim() || standard.trim() === "") {
      alert("Please fill in all required fields");
      return;
    }

    const parsedStandard = parseFloat(standard);
    if (isNaN(parsedStandard)) {
      alert("Standard must be a number");
      return;
    }

    const payload = {
      discipline_name: discipline_name.trim(),
      formula: formula.trim(),
      standard: parsedStandard,
    };

    if (isEdit && currentDiscipline) {
      if (!currentDiscipline.disc_id) {
        alert("Discipline Id is missing");
        return;
      }
      updateMutate({
        disc_id: Number(currentDiscipline.disc_id),
        data: payload,
      });
    } else {
      addMutate(payload);
    }
  };

  const isPending = isAddPending || isUpdatePending;

  return (
    <div className="min-h-screen rounded-lg  p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-[#245cab]">Disciplines</h2>
            <p className="text-gray-500 text-sm mt-1">Manage event scoring formulas and standards</p>
          </div>
          
          <button
            onClick={() => {
              setIsEdit(false);
              resetForm();
              setOpen(true);
            }}
            className="flex items-center gap-2 bg-[#245cab] hover:bg-[#1d4b8f] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus size={20} />
            <span>Add Discipline</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>Failed to load disciplines. Please try again later.</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && disciplines?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-[#245cab]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No disciplines found</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              Get started by creating your first scoring discipline formula.
            </p>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : disciplines?.map((ele: DisciplineData) => (
                <div
                  key={ele.disc_id}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full"
                >
                  {/* Card Header & Actions */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#245cab]">
                      <BookOpen size={20} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(ele)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(Number(ele.disc_id))}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <h3 className="text-lg font-bold text-gray-800 mb-4 line-clamp-1">
                    {ele.discipline_name}
                  </h3>

                  <div className="space-y-3 flex-grow">
                    {/* Formula */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1">
                        <Calculator size={14} />
                        Formula
                      </div>
                      <div className="font-mono text-sm text-gray-700 break-all">
                        {ele.formula}
                      </div>
                    </div>

                    {/* Standard */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Ruler size={16} />
                        <span>Standard</span>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-sm font-bold">
                        {ele.standard}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Custom Modal */}
      <Modal
        isOpen={open}
        onClose={closeModal}
        title={isEdit ? "Edit Discipline" : "Create New Discipline"}
      >
        <div className="space-y-5">
          <InputGroup
            id="discipline_name"
            label="Discipline Name"
            value={formData.discipline_name}
            onChange={handleChange}
            placeholder="e.g., 5-Minute Round"
            required
          />
          
          <InputGroup
            id="formula"
            label="Calculation Formula"
            value={formData.formula}
            onChange={handleChange}
            placeholder="e.g., value / 649 * 1000"
            required
          />
          
          <InputGroup
            id="standard"
            label="Standard Value"
            type="text"
            value={formData.standard}
            onChange={handleStandardChange}
            placeholder="0.00"
            required
          />

          <div className="pt-2 flex gap-3">
            <button
              onClick={closeModal}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#245cab] text-white font-medium hover:bg-[#1d4b8f] disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="animate-spin" size={18} />}
              {isPending
                ? isEdit ? "Updating..." : "Adding..."
                : isEdit ? "Save Changes" : "Create Discipline"
              }
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}