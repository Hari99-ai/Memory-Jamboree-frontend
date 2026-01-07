/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { XCircle, Calendar, Clock, Users, BookOpen, School, Activity } from 'lucide-react';
// Make sure these are imported
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AddEvents,
  getCategory,
  getDisciplines,
  getSchools,
} from "../../lib/api";
import {
  CategoryMasterData,
  DisciplineData,
  SchoolsMasterData,
} from "../../types";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { z } from "zod";
import { eventType } from "../../types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import MultiSelectCheckbox from "../../components/MultiSelectCheckbox";

import ToggleSwitch from "../../components/ToggleSwitch";



type EventFormValues = z.infer<typeof eventType>;

// --- START: Image Utility Functions (ADD THESE) ---
// Define your image resizing constants
const MAX_IMAGE_WIDTH = 800; // Max width for the resized image
const MAX_IMAGE_HEIGHT = 600; // Max height for the resized image
const JPEG_QUALITY = 0.8; // JPEG quality (0 to 1)

// Function to convert data URL to Blob (needed for FormData)
const dataURLtoBlob = (dataurl: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    resolve(new Blob([u8arr], { type: mime }));
  });
};

// Function to resize image
const resizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_IMAGE_WIDTH) {
            height *= MAX_IMAGE_WIDTH / width;
            width = MAX_IMAGE_WIDTH;
          }
        } else {
          if (height > MAX_IMAGE_HEIGHT) {
            width *= MAX_IMAGE_HEIGHT / height;
            height = MAX_IMAGE_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Could not get canvas context."));
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas content to a new Data URL
        const dataUrl = canvas.toDataURL(file.type, JPEG_QUALITY);
        // Convert Data URL to Blob, then to File
        const blob = await dataURLtoBlob(dataUrl);
        const resizedFile = new File([blob], file.name, { type: file.type });
        resolve(resizedFile);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
// --- END: Image Utility Functions ---


export default function EventForm() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  // const [enabled, setEnabled] = useState(false)
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-events"],
    mutationFn: AddEvents,
  });

  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: getCategory,
  });

  const { data: disciplines } = useQuery({
    queryKey: ["disciplines"],
    queryFn: getDisciplines,
  });

  const { data: schools } = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
  });


  const formatToDatetimeLocal = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventType),
    defaultValues: {
      ename: "",
      estatus: "1",
      event_start: new Date(Date.now() + 10 * 60000), // Now + 10 minutes
      event_end: new Date(Date.now() + 70 * 60000),   // Now + 1 hour 10 minutes
      school_participants: [],
      category: [],
      disciplines: [],
      eimage: undefined, // Ensure eimage is initialized, e.g., as null
      emonitored: false,
    },
  });

  const onSubmit = (values: EventFormValues) => {
    console.log("=== FORM SUBMIT START ===");
    console.log("Raw form values:", values);

    const start = values.event_start.toISOString();
    const end = values.event_end.toISOString();

    // Basic validation (already present, but good to double check client-side)
    if (!values.ename) {
      alert("Please enter an event name");
      return;
    }

    if (!values.category || values.category.length === 0) {
      alert("Please select at least one category");
      return;
    }

    if (!values.disciplines || values.disciplines.length === 0) {
      alert("Please select at least one discipline");
      return;
    }

    const formData = new FormData();
    formData.append("ename", values.ename);
    formData.append("event_start", start);
    formData.append("event_end", end);
    formData.append("estatus", values.estatus.toString());
    formData.append("emonitored", monitoringEnabled ? "1" : "0");

    values.category.forEach((val) => formData.append("category", val.toString()));
    values.disciplines.forEach((val) => formData.append("disciplines", val.toString()));
    (values.school_participants || []).forEach((val) =>
      formData.append("school_participants", val.toString())
    );

    // IMPORTANT: Ensure the eimage field is a File object here
    if (values.eimage instanceof File) {
      formData.append("eimage", values.eimage);
      console.log("eimage appended to FormData:", values.eimage.name, values.eimage.size);
    } else if (values.eimage !== null && values.eimage !== undefined) {
      console.warn("eimage is not a File object, but not null/undefined:", values.eimage);
    } else {
      console.log("eimage is null or undefined, not appending.");
    }


    // Debug: Log all FormData entries
    console.log("=== FormData Contents ===");
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}:`, `[File: ${pair[1].name}, Size: ${pair[1].size} bytes, Type: ${pair[1].type}]`);
      } else {
        console.log(`${pair[0]}:`, pair[1]);
      }
    }
    console.log("=== End FormData ===");

    console.log("Attempting to mutate with FormData...");

    mutate(formData, {
      onError: (error) => {
        console.error("Mutation Error:", error);
        alert(`Error creating event: ${error.message || "Unknown error"}`);
      },
      onSuccess: (response) => {
        console.log("✅ Event created successfully!", response);
        console.log("Response eimage field:", response?.event?.eimage || response?.eimage);
        
        // Invalidate queries to refresh event lists
        queryClient.invalidateQueries({ queryKey: ["event-list"] });
        queryClient.invalidateQueries({ queryKey: ["category"] });
        
        alert("Event created successfully!");
        form.reset();
        setPreviewUrl(null); // Clear preview on successful submission
        setMonitoringEnabled(false);
      },
    });
  };

  const onError = (errors: any) => {
    console.error("❌ Form Validation Errors", errors);
  };





  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="w-full max-w-7xl min-h-screen mx-auto"
      >
        {/* Modern Header with Gradient */}
        <div className="text-center mb-8 pt-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Event
          </CardTitle>
          <p className="text-gray-600">Set up your next amazing event</p>
        </div>

        {/* Main Card with Modern Styling */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <CardContent className="p-6 sm:p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Event Name - Full Width */}
              <div className="lg:col-span-2">
                <FormField
                  control={form.control}
                  name="ename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Event Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter event name"
                          {...field}
                          className="text-black w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-lg font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Event Image Field - Full Width with Modern Design */}
              <div className="lg:col-span-2">
                <FormField
                  control={form.control}
                  name="eimage"
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Event Image
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-start flex-col gap-4 flex-wrap">
                          <input
                            type="file"
                            accept="image/*"
                            name={name}
                            ref={ref}
                            onBlur={onBlur}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const resizedFile = await resizeImage(file);
                                  setPreviewUrl(URL.createObjectURL(resizedFile));
                                  onChange(resizedFile);
                                } catch (error) {
                                  console.error("Error processing image:", error);
                                  alert("Failed to process image. Please try a different one.");
                                  setPreviewUrl(null);
                                  onChange(null);
                                  const inputElement = document.getElementById('event-image-upload') as HTMLInputElement;
                                  if (inputElement) inputElement.value = '';
                                }
                              } else {
                                setPreviewUrl(null);
                                onChange(null);
                              }
                            }}
                            className="hidden"
                            id="event-image-upload"
                          />

                          <Label
                            htmlFor="event-image-upload"
                            className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-700 transition-all hover:shadow-md font-medium"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Upload Image</span>
                          </Label>

                          {previewUrl && (
                            <div className="relative group w-full max-w-2xl">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full  object-cover rounded-2xl border-2 border-gray-200 shadow-md"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewUrl(null);
                                  onChange(null);
                                  const inputElement = document.getElementById('event-image-upload') as HTMLInputElement;
                                  if (inputElement) {
                                    inputElement.value = '';
                                  }
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Start Date & Time */}
              <FormField
                control={form.control}
                name="event_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Start Date & Time *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        value={formatToDatetimeLocal(field.value)}
                        onChange={(e) => {
                          const localDate = new Date(e.target.value);
                          const isoString = localDate.toISOString();
                          const newStartDate = new Date(isoString);
                          const now = new Date();
                          const nowPlus10Min = new Date(now.getTime() + 10 * 60000);

                          if (newStartDate < nowPlus10Min) {
                            alert("Start time must be at least 10 minutes from now.");
                            return;
                          }

                          const currentEndDate = form.getValues("event_end");
                          if (currentEndDate && newStartDate > currentEndDate) {
                            const autoEnd = new Date(newStartDate);
                            autoEnd.setHours(autoEnd.getHours() + 1);
                            form.setValue("event_end", autoEnd);
                          }

                          field.onChange(newStartDate);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date & Time */}
              <FormField
                control={form.control}
                name="event_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      End Date & Time *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        value={formatToDatetimeLocal(field.value)}
                        onChange={(e) => {
                          const localDate = new Date(e.target.value);
                          const isoString = localDate.toISOString();
                          const newEndDate = new Date(isoString);
                          const startDate = form.getValues("event_start");

                          if (newEndDate <= startDate) {
                            alert("End time must be after the start time.");
                            return;
                          }

                          field.onChange(newEndDate);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Dropdown */}
              <FormField
                control={form.control}
                name="estatus"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm font-medium text-gray-700 mb-2">Event Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="1" className="rounded-lg">Paid</SelectItem>
                        <SelectItem value="0" className="rounded-lg">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Disciplines */}
              <FormField
                control={form.control}
                name="disciplines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Select Disciplines *
                    </FormLabel>
                    <FormControl>
                      <MultiSelectCheckbox
                        selectedOptions={field.value ?? []}
                        options={
                          disciplines?.map((disc: DisciplineData) => ({
                            value: Number(disc.disc_id),
                            label: disc.discipline_name,
                          })) ?? []
                        }
                        onSelectionChange={(selectedValues) => {
                          field.onChange(selectedValues.map(Number));
                          form.trigger("disciplines");
                        }}
                        placeholder="Select Disciplines"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categories */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Select Categories *
                    </FormLabel>
                    <FormControl>
                      <MultiSelectCheckbox
                        selectedOptions={field.value ?? []}
                        options={
                          categories?.map((cat: CategoryMasterData) => ({
                            value: cat.cat_id,
                            label: `${cat.category_name} - Class ${cat.classes}`,
                          })) ?? []
                        }
                        onSelectionChange={(selectedValues) => {
                          field.onChange(selectedValues.map(Number));
                          form.trigger("category");
                        }}
                        placeholder="Select Category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Schools */}
              <FormField
                control={form.control}
                name="school_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Select Schools
                    </FormLabel>
                    <FormControl>
                      <MultiSelectCheckbox
                        selectedOptions={field.value ?? []}
                        options={
                          schools?.map((school: SchoolsMasterData) => ({
                            value: school.school_id,
                            label: school.school_name,
                          })) ?? []
                        }
                        onSelectionChange={(selectedValues) => {
                          field.onChange(selectedValues.map(Number));
                          form.trigger("school_participants");
                        }}
                        placeholder="Select Schools"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Event Monitoring Toggle - Modern Card Style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">Event Monitoring</h3>
                <p className="text-sm text-gray-600">
                  Enable real-time monitoring for this event
                </p>
              </div>
              <ToggleSwitch
                id="monitoring-toggle"
                enabled={monitoringEnabled}
                onChange={(checked) => {
                  console.log("Toggle changed to:", checked);
                  setMonitoringEnabled(checked);
                  form.setValue("emonitored", checked);
                }}
              />
            </div>
          </CardContent>

          {/* Modern Footer with Gradient Button */}
          <CardFooter className="px-6 sm:px-8 md:px-10 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <Button
              type="submit"
              onClick={() => {
                console.log("Trying to submit...");
              }}
              disabled={isPending}
              className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Event"
              )}
            </Button>
          </CardFooter>
        </div>
      </form>
    </Form>
  );
}

// Keep your DatePickers function outside or move to a separate utility file if preferred
export function DatePickers({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string;
  endDate: string;
  onChange: (date: string, type: "start" | "end") => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="start">Start Date & Time</Label>
        <input
          type="datetime-local"
          className="w-full px-3 py-2 border rounded-md text-black"
          id="start"
          value={startDate}
          onChange={(e) => onChange(e.target.value, "start")}
        />
      </div>
      <div>
        <Label htmlFor="end">End Date & Time</Label>
        <Input
          type="datetime-local"
          className="w-full px-3 py-2 border rounded-md text-black"
          id="end"
          value={endDate}
          onChange={(e) => onChange(e.target.value, "end")}
        />
      </div>
    </div>
  );
}

// Your commented out components (ClassGroupDropdown, DisciplinaryDropdown) are omitted for brevity.
// Make sure to include them if you actually use them.