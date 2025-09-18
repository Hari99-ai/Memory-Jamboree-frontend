import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
getEventDetails,
updateEventCategory,
updateEventDisciplines,
updateEventSchools,
} from "../../../lib/api";
import { Link, useParams } from "react-router-dom";
import { DataTable } from "../../Users/DataTable";
import { Schoolcolumns } from "../../Settings/Masters/MasterColumn";
import { PlusIcon } from 'lucide-react';
import { CategoryMasterData, EventDetailsResponse, RegisterUserInput } from "../../../types";
import { useState, useEffect } from "react";
import { SchoolDialog } from "../../components/SchoolDialog";
import { DialogList } from "../DialogList";
import toast from "react-hot-toast";
import { columns } from "./UserList/column";
import { API_BASE_URL, eventImg } from "../../../lib/client";
import { Category } from "../../components/CategoryStepper";
import DisciplinesStepper from "../../components/DisciplinesStepper";
import { CategoryDialog } from "../../components/CategoryDialog";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { SchoolDataTable } from "../SchoolDataTable";

function isUpcomingStatus(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return value === 2;
  if (typeof value === "boolean") return value === true;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "2" || v === "Upcoming" || v === "true";
  }
  return false;
}

const updateEvent = async (eventId: string, formData: FormData) => {
try {
  const token = sessionStorage.getItem("auth_token");
  const response = await axios.patch(
    `${API_BASE_URL}/admin/event-details/${eventId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
} catch (error) {
  console.error("Error updating event:", error);
  throw error;
}
};

const EventDetails = () => {
const params = useParams();
const event_id = params.event_id;
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isSchoolDialog, setSchoolDialog] = useState(false);
const [isCategoryDialog, setCategoryDialog] = useState(false);
const [, setSelectedDisciplines] = useState<string[]>([]);
const [activeTab, setActiveTab] = useState<string>("overall");
const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
const [, setActiveDisciplineId] = useState<number | null>(null);
const [eventEdit, setEventEdit] = useState(false);

// Form state for event edit with default monitoring value set to "0"
const [formData, setFormData] = useState({
  ename: "",
  event_start: "",
  event_end: "",
  estatus: "1",
  etype: "1",
  emonitored: "0",
});

const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);

const { data: event, isLoading } = useQuery<EventDetailsResponse>({
  queryKey: ["event-details", event_id],
  queryFn: () => getEventDetails(event_id!),
  enabled: !!event_id,
  staleTime: 0,
  refetchOnWindowFocus: true,
});

const queryClient = useQueryClient();

console.log("overall data", event?.overall_users)

// Update form data when event data loads
useEffect(() => {
  if (event) {
    setFormData({
      ename: event.event_name || "",
      event_start: event.event_start ? new Date(event.event_start).toISOString().slice(0, 16) : "",
      event_end: event.event_end ? new Date(event.event_end).toISOString().slice(0, 16) : "",
      estatus: String(event.estatus) || "1",
      etype: String(event.etype) || "1",
      emonitored: String(event.emonitored ?? 0), // Convert to string, default to "0"
    });
  }
}, [event]);

// Existing mutations
const { mutate } = useMutation({
  mutationFn: (disciplineIds: string[]) =>
    updateEventDisciplines(event_id!, disciplineIds),
  onSuccess: () => {
    toast.success(`Disciplines updated in event ${event?.event_name}`);
    queryClient.invalidateQueries({ queryKey: ["event-details", event_id] });
  },
  onError: (error: any) => {
    toast.error("Something went wrong with disciplines");
    console.error("Something went wrong with disciplines", error);
  },
});

const { mutate: mutateSchools } = useMutation({
  mutationFn: (schoolIds: number[]) =>
    updateEventSchools(event_id!, schoolIds),
  onSuccess: () => {
    toast.success(`Schools updated in event ${event?.event_name}`);
    queryClient.invalidateQueries({ queryKey: ["event-details", event_id] });
    setSchoolDialog(false);
  },
  onError: () => {
    toast.error("Something went wrong updating schools");
  },
});

const { mutate: mutateCategories } = useMutation({
  mutationFn: (categoryIds: number[]) =>
    updateEventCategory(event_id!, categoryIds),
  onSuccess: () => {
    toast.success(`Category updated in event ${event?.event_name}`);
    queryClient.invalidateQueries({ queryKey: ["event-details", event_id] });
    setCategoryDialog(false);
  },
  onError: () => {
    toast.error("Something went wrong updating categories");
  },
});

// Event update mutation
const { mutate: mutateEvent } = useMutation({
  mutationFn: (data: FormData) => updateEvent(event_id!, data),
  onSuccess: () => {
    toast.success("Event updated successfully");
    queryClient.invalidateQueries({ queryKey: ["event-details", event_id] });
    setEventEdit(false);
    setIsSubmitting(false);
  },
  onError: (error: any) => {
    toast.error("Something went wrong updating the event");
    console.error("Event update error:", error);
    setIsSubmitting(false);
  },
});

const category = event?.category || [];
const disciplines = event?.disciplines || [];
const tabMode = activeTab === "overall" ? "overall" : "discipline";
const activeDisciplineId = activeTab === "overall" ? "overall" : Number(activeTab);

useEffect(() => {
    // FIX: Default to overall view (-1) instead of the first category
    if (activeCategoryId === null) {
      setActiveCategoryId(-1);
    }
  if (disciplines.length > 0 && !activeDisciplineId) {
    setActiveDisciplineId(Number(disciplines[0].disc_id));
  }
}, [category, activeCategoryId, activeDisciplineId, disciplines]);


if (isLoading) return <div>Loading...</div>;

  const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
  });


const formatCategory = (category: number) => (category === 1 ? "Paid" : "Unpaid");

function formatEventStatus(value: any): string {
  const v = typeof value === "string" ? value.trim().toLowerCase() : value;
  if (v === 1 || v === "1" || v === "Live") return "Live";
  if (v === 2 || v === "2" || v === "Upcoming") return "Upcoming";
  if (v === 0 || v === "0" || v === "Expired") return "Expired";
  return "Unknown";
}

const selectedCategory = event?.users_by_category.find(
  (item) => Number(item.category_id) === activeCategoryId
);

const users =
  activeCategoryId === null || activeCategoryId === -1
    ? event?.overall_users || []
    : selectedCategory?.users || [];

// const users = selectedCategory?.users || [];
// const canEdit = isActiveStatus(event?.estatus)
const canEdit = isUpcomingStatus(event?.etype);

const handleSubmitDisciplines = (selectedIds: string[]) => {
  if (!canEdit) {
    toast.error("Editing is available only for 'Upcoming' events.")
    return
  }
  setSelectedDisciplines(selectedIds)
  mutate(selectedIds)
}

const handleSchoolSubmit = (selectedIds: number[]) => {
  if (!canEdit) {
    toast.error("Editing is available only for 'Upcoming' events.")
    return
  }
  setSchoolDialog(false)
  mutateSchools(selectedIds)
}

const handleCategorySubmit = (selectedCategories: Category[]) => {
  if (!canEdit) {
    toast.error("Editing is available only for 'Upcoming' events.")
    return
  }
  const selectedIds = selectedCategories.map((cat) => cat.cat_id)
  setCategoryDialog(false)
  mutateCategories(selectedIds)
}

// Handle form input changes
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

// Handle image file selection
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    setSelectedImage(e.target.files[0]);
  }
};

// Handle form submission
const handleEventSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canEdit) {
    toast.error("Editing is available only for 'Upcoming' events.")
    return
  }
  setIsSubmitting(true);

  const submitFormData = new FormData();
  submitFormData.append("ename", formData.ename);
  submitFormData.append("event_start", formData.event_start);
  submitFormData.append("event_end", formData.event_end);
  submitFormData.append("estatus", formData.estatus);
  submitFormData.append("etype", formData.etype);
  submitFormData.append("emonitored", formData.emonitored); // Send as "monitoring" to match backend

  if (selectedImage) {
    submitFormData.append("eimage", selectedImage);
  }

  mutateEvent(submitFormData);
};

// FIX: Create a map for quick lookup of user counts per category
const categoryUserCounts = new Map<number, number>();
event?.users_by_category.forEach(cat => {
  categoryUserCounts.set(Number(cat.category_id), cat.users.length);
});


return (
  <div className="">
    <div
      className="max-w-7xl mx-auto bg-cover bg-center bg-slate-100 p-8 rounded-md shadow-md flex flex-col relative space-y-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${eventImg}/${event?.eimage}')`,
        backgroundPosition: "center 30%",
      }}
    >
      <button
        type="button"
        aria-label="Edit event"
        aria-disabled={!canEdit}
        disabled={!canEdit}
        className={`absolute top-10 right-20 bg-yellow-300 p-4 rounded-xl transition-colors ${
          canEdit ? "cursor-pointer hover:bg-yellow-400" : "opacity-60 cursor-not-allowed"
        }`}
        onClick={() => {
          if (!canEdit) return
          setEventEdit(true)
        }}
        title={canEdit ? "Edit event" : "Editing is available only for 'Upcoming' events."}
      >
        Edit
      </button>
      <h2 className="text-3xl font-bold mb-10 text-white">Event Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full">
        <p className="text-white">
          <span className="font-semibold">Event Name:</span> {event?.event_name}
        </p>
        <p className="text-white">
          <span className="font-semibold">Event Category:</span> {formatCategory(Number(event?.category))}
        </p>
        <p className="text-white">
          <span className="font-semibold">Event Status:</span> {formatEventStatus(event?.etype)}
        </p>
        <p className="text-white">
          <span className="font-semibold">Start Time:</span> {formatTime(String(event?.event_start))}
        </p>
        <p className="text-white">
          <span className="font-semibold">End Time:</span> {formatTime(String(event?.event_end))}
        </p>
        <p className="text-white">
          <span className="font-semibold">Total Users:</span> {event?.user_participants}
        </p>
      </div>
    </div>
    {!canEdit && (
      <div className="max-w-7xl mx-auto mt-4 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-800 p-4">
        Editing is available only for 'Upcoming' events.
      </div>
    )}

    <div className="max-w-7xl mx-auto bg-slate-100 p-8 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Disciplines</h2>
        <button
          type="button"
          aria-label="Add discipline"
          aria-disabled={!canEdit}
          disabled={!canEdit}
          onClick={() => {
            if (!canEdit) return
            setIsDialogOpen(true)
          }}
          className={`bg-black text-white p-2 rounded-md transition ${
            canEdit ? "hover:bg-gray-800" : "opacity-50 cursor-not-allowed"
          }`}
          title={canEdit ? "Add discipline" : "Editing is available only for 'Upcoming' events."}
        >
          <PlusIcon className="size-6" />
        </button>
      </div>
      <div className="space-y-2">
        <ul className="list-disc list-inside">
          <div className="grid grid-cols-4 gap-4">
            {event?.disciplines.map((item, index) => (
              <div
                className="border bg-primary p-2 flex justify-center text-white"
                key={index}
              >
                {item.discipline_name}
              </div>
            ))}
          </div>
        </ul>
      </div>
      <DialogList
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitDisciplines}
        preData={event?.disciplines || []}
      />
    </div>

    <div className="max-w-7xl mx-auto bg-slate-100 p-8 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Participating Schools</h2>
        <button
          type="button"
          aria-label="Add school"
          aria-disabled={!canEdit}
          disabled={!canEdit}
          onClick={() => {
            if (!canEdit) return
            setSchoolDialog(true)
          }}
          className={`bg-black text-white p-2 rounded-md transition ${
            canEdit ? "hover:bg-gray-800" : "opacity-50 cursor-not-allowed"
          }`}
          title={canEdit ? "Add school" : "Editing is available only for 'Upcoming' events."}
        >
          <PlusIcon className="size-6" />
        </button>
      </div>
      <div className="space-y-2">
        <SchoolDataTable
          columns={
            Schoolcolumns(
              () => {},
              (_row) => {},
              false
            ) as ColumnDef<{ id: number }, unknown>[]
          }
          data={(event?.school_participants ?? []).map((school) => ({
            ...school,
            id: school.school_id,
          }))}
        />
      </div>
      <SchoolDialog
        open={isSchoolDialog}
        onOpenChange={setSchoolDialog}
        onSubmit={handleSchoolSubmit}
        previous={event?.school_participants ?? []}
      />
    </div>

    <div className="max-w-7xl mx-auto bg-slate-100 p-8 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Participants</h2>
        <div className="flex gap-x-4">
          <Link
            to={canEdit ? `/admin/event/users/${event_id}` : "#"}
            aria-disabled={!canEdit}
            onClick={(e) => {
              if (!canEdit) {
                e.preventDefault()
                toast.error("Editing is available only for 'Upcoming' events.")
              }
            }}
            className={`bg-black text-white flex p-2 rounded-md transition ${
              canEdit ? "hover:bg-gray-800" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <PlusIcon className="size-6 mr-2" /> Add Users
          </Link>
          <button
            type="button"
            aria-label="Add category"
            aria-disabled={!canEdit}
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) return
              setCategoryDialog(true)
            }}
            className={`bg-black text-white flex p-2 rounded-md transition ${
              canEdit ? "hover:bg-gray-800" : "opacity-50 cursor-not-allowed"
            }`}
            title={canEdit ? "Add category" : "Editing is available only for 'Upcoming' events."}
          >
            <PlusIcon className="size-6 mr-2" /> Add Category
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-y-4 mb-6">
        <div className="flex-1">
            {/* FIX: Replaced CategoryStepper component with modern, inline tab UI */}
            <div className="flex border-b border-gray-200">
                {/* Overall Tab */}
                <button
                onClick={() => setActiveCategoryId(-1)}
                className={`flex items-center gap-2 px-4 py-2 text-lg font-semibold transition-colors focus:outline-none ${
                    activeCategoryId === -1 || activeCategoryId === null
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                }`}
                >
                Overall
                <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
                    activeCategoryId === -1 || activeCategoryId === null
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                    {event?.overall_users?.length ?? 0}
                </span>
                </button>

                {/* Category Tabs */}
                {normalizeCategories(category || []).map(cat => (
                <button
                    key={cat.cat_id}
                    onClick={() => setActiveCategoryId(cat.cat_id)}
                    className={`flex items-center gap-2 px-4 py-2 text-lg font-medium transition-colors focus:outline-none ${
                    activeCategoryId === cat.cat_id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {cat.category_name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeCategoryId === cat.cat_id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                    {categoryUserCounts.get(cat.cat_id) ?? 0}
                    </span>
                </button>
                ))}
            </div>
        </div>

        <div className="flex-1">
          <DisciplinesStepper
            disciplines={disciplines}
            activeTab={String(activeDisciplineId)}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
      <div>
        <CategoryDialog
          open={isCategoryDialog}
          onOpenChange={setCategoryDialog}
          onSubmit={handleCategorySubmit}
          previous={category ?? []}
        />
      </div>

      {users.length > 0 ? (
        <DataTable
          columns={columns(
            tabMode
            , activeDisciplineId === "overall" ? null : activeDisciplineId , 
          )
        }
          data={users as RegisterUserInput[]}
          // FIX: Hide the download button from this specific table instance
          hideExcelButton={true}
        />
      ) : (
        <p className="text-gray-500">No participants found for this category.</p>
      )}
    </div>

    {/* Event Edit Modal */}
    {eventEdit && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Edit Event</h2>
            <button
              onClick={() => setEventEdit(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
          
          <form onSubmit={handleEventSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name
              </label>
              <input
                type="text"
                name="ename"
                value={formData.ename}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!canEdit}
              />
            </div>

            {/* Event Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="event_start"
                value={formatForInput((event?.event_start || "").toString())}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="event_end"
                value={formatForInput(String(event?.event_end))}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!canEdit}
              />
            </div>

            {/* Event Status */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="estatus"
                value={formData.etype}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!canEdit}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div> */}

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="etype"
                value={formData.estatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!canEdit}
              >
                <option value="1">Paid</option>
                <option value="0">Free</option>
              </select>
            </div>

            {/* Monitoring */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monitoring
              </label>
              <select
                name="emonitored"   // match the state key
                value={formData.emonitored}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!canEdit}
              >
                <option value="0">Disabled</option>
                <option value="1">Enabled</option>
              </select>
            </div>


            {/* Event Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!canEdit}
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to keep current image. Supported formats: JPG, JPEG, PNG
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setEventEdit(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !canEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {isSubmitting ? "Updating..." : "Update Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default EventDetails;

function normalizeCategories(data: CategoryMasterData[]): Category[] {
return data
  .filter((c) => typeof c.cat_id === "number")
  .map((c) => ({
    cat_id: c.cat_id!,
    category_name: c.category_name,
  }));
}


const formatForInput = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  // Adjust to Asia/Kolkata manually
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const year = tzDate.getFullYear();
  const month = String(tzDate.getMonth() + 1).padStart(2, "0");
  const day = String(tzDate.getDate()).padStart(2, "0");
  const hours = String(tzDate.getHours()).padStart(2, "0");
  const minutes = String(tzDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};