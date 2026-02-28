/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { ImageIcon, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AddEvents,
  getCategory,
  getDisciplines,
  getSchools,
} from "../../../lib/api";
import {
  CategoryMasterData,
  DisciplineData,
  SchoolsMasterData,
} from "../../../types";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { z } from "zod";
import { eventType } from "../../../types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import MultiSelectCheckbox from "../../components/MultiSelectCheckbox";
import ToggleSwitch from "../../../components/ToggleSwitch";

type EventFormValues = z.infer<typeof eventType>;

// --- START: Image Utility Functions ---
const MAX_IMAGE_WIDTH = 800;
const MAX_IMAGE_HEIGHT = 600;
const JPEG_QUALITY = 0.8;

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

const resizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

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

        const dataUrl = canvas.toDataURL(file.type, JPEG_QUALITY);
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
      event_start: new Date(Date.now() + 10 * 60000),
      event_end: new Date(Date.now() + 70 * 60000),
      school_participants: [],
      category: [],
      disciplines: [],
      eimage: undefined,
      emonitored: false,
    },
  });

  const onSubmit = (values: EventFormValues) => {
    const start = values.event_start.toISOString();
    const end = values.event_end.toISOString();

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

    values.category.forEach((val) =>
      formData.append("category", val.toString())
    );
    values.disciplines.forEach((val) =>
      formData.append("disciplines", val.toString())
    );
    (values.school_participants || []).forEach((val) =>
      formData.append("school_participants", val.toString())
    );

    if (values.eimage instanceof File) {
      formData.append("eimage", values.eimage);
    }

    mutate(formData, {
      onError: (error) => {
        console.error("Mutation Error:", error);
        alert(`Error creating event: ${error.message || "Unknown error"}`);
      },
      onSuccess: () => {
        alert("Event created successfully!");
        form.reset();
        setPreviewUrl(null);
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
        className="w-full max-w-4xl mx-auto"
      >
        {/* Wrap everything inside a Card */}
        <Card className="shadow-lg border rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-[#245cab]">
              Create Event
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <FormField
                control={form.control}
                name="ename"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter event name"
                        {...field}
                        className="text-black w-full px-3 py-2 border rounded-md bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Image */}
              <FormField
                control={form.control}
                name="eimage"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <FormItem>
                    <FormLabel>Event Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
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
                                setPreviewUrl(
                                  URL.createObjectURL(resizedFile)
                                );
                                onChange(resizedFile);
                              } catch (error) {
                                console.error("Error processing image:", error);
                                alert("Failed to process image.");
                                setPreviewUrl(null);
                                onChange(null);
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
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 whitespace-nowrap"
                        >
                          <ImageIcon className="h-5 w-5" />
                          <span>Upload Image</span>
                        </Label>
                        {previewUrl && (
                          <div className="relative flex items-center">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="h-20 w-20 object-cover rounded-md border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewUrl(null);
                                onChange(null);
                                const inputElement =
                                  document.getElementById(
                                    "event-image-upload"
                                  ) as HTMLInputElement;
                                if (inputElement) inputElement.value = "";
                              }}
                              className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-0.5 z-10"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="event_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="w-full px-3 py-2 border rounded-md text-black"
                        value={formatToDatetimeLocal(field.value)}
                        onChange={(e) => {
                          const localDate = new Date(e.target.value);
                          const newStartDate = new Date(localDate.toISOString());

                          const now = new Date();
                          const nowPlus10Min = new Date(
                            now.getTime() + 10 * 60000
                          );
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

              {/* End Date */}
              <FormField
                control={form.control}
                name="event_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="w-full px-3 py-2 border rounded-md text-black"
                        value={formatToDatetimeLocal(field.value)}
                        onChange={(e) => {
                          const localDate = new Date(e.target.value);
                          const newEndDate = new Date(localDate.toISOString());

                          const startDate = form.getValues("event_start");
                          if (newEndDate <= startDate) {
                            alert("End time must be after start time.");
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

              {/* Event Type */}
              <FormField
                control={form.control}
                name="estatus"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Paid</SelectItem>
                        <SelectItem value="0">Unpaid</SelectItem>
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
                    <FormLabel>Select Disciplines *</FormLabel>
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
                    <FormLabel>Select Categories *</FormLabel>
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
                    <FormLabel>Select Schools</FormLabel>
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

            {/* Monitoring Toggle */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-medium text-black">Event Monitoring</h3>
                <p className="text-sm text-gray-600">
                  Enable monitoring for this event
                </p>
              </div>
              <ToggleSwitch
                id="monitoring-toggle"
                enabled={monitoringEnabled}
                onChange={(checked) => {
                  setMonitoringEnabled(checked);
                  form.setValue("emonitored", checked);
                }}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Event"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
