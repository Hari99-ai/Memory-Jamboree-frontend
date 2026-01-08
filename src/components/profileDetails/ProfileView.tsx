export const defaultImg =
  "https://plus.unsplash.com/premium_vector-1682269287900-d96e9a6c188b?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useForm } from "react-hook-form";
import "react-phone-input-2/lib/style.css";
import {
  getCountries,
  getCities,
  getStates,
} from "../../lib/select";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getUserById, UpdateProfile } from "../../lib/api";
import Loader2 from "../../components/Loader2";
import { API_BASE_URL, ImgUrl } from "../../lib/client";
import { ArrowLeft, Pencil } from "lucide-react";
import { formSchema, getAllClasses } from "../../types/schema";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageCropperModal from "./ImageCropperModal";
import { useOthersCategory } from "../../hooks/useOthersCategory";
import { CategoryMasterData } from "../../types";

type FormValues = z.infer<typeof formSchema>;
type Country = { name: string; iso2: string };
type City = { id: string | number; name:string };
type State = { iso2: string; name: string };

export default function ProfileView() {
  const [userId, setUserId] = useState<string | null>(null);
  const [_, setToken] = useState(() => sessionStorage.getItem("auth_token"));
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Cropper modal states
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();


  const isOthersSelected = selectedClass?.startsWith("Others");
  const cleanedClass = isOthersSelected ? "Others" : null;

  const [selectedCategoryName , setSelectedCategoryName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data , isLoading: categorydata_loading , refetch } = useOthersCategory(cleanedClass);

  useEffect(() => {
    if (isOthersSelected) {
      refetch();
    }
  }, [isOthersSelected, refetch]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "IN",
      state: "",
      city: "",
      mobile: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const id = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("auth_token");
    if (id || token) {
      setUserId(id);
      setToken(token);
    }
  }, []);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    refetchOnWindowFocus: true,
    enabled: !!userId && !!userId,
  });

  const isProfileFinalized = userData?.status === 1
  
  const formatBirthDate = (dateString: string | number | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (userData) {
      const resetData: FormValues = {
        fname: userData.fname ?? "",
        lname: userData.lname ?? "",
        email: userData.email ?? "",
        mobile: userData.mobile ?? "",
        birth_date: formatBirthDate(userData.birth_date),
        image: userData.image ?? undefined,
        gender: userData.gender ?? "",
        country: userData.country ?? "IN",
        state: userData.state ?? "",
        city: userData.city ?? "",
        school_class: userData.school_class ?? "",
        school_name: userData.school_name ?? "",
        fa_name: userData.fa_name ?? "",
        fa_mobile: userData.fa_mobile ?? "",
        fa_email: userData.fa_email ?? "",
        mo_mobile: userData.mo_mobile ?? "",
        address: userData.address ?? "",
        pincode: userData.pincode ?? "",
      };
      reset(resetData);
      setSelectedGender(userData.gender ?? "");
      setSelectedCountry(userData.country ?? "IN");
      setSelectedState(userData.state ?? "");
      setSelectedCity(userData.city ?? "");
      setSelectedClass(userData.school_class ?? "");
      if (typeof userData?.image === "string" && userData.image) {
        const fullImageUrl = `${API_BASE_URL}/uploads/profile/${userData.image}`;
        setPreviewImage(fullImageUrl);
      }
    }
  }, [userData, reset]);

  useEffect(() => {
    if (userData?.country && countries.length > 0) {
      setSelectedCountry(userData.country);
    }
  }, [userData?.country, countries]);
  useEffect(() => {
    if (userData?.state && states.length > 0) {
      setSelectedState(userData.state);
    }
  }, [userData?.state, states]);
  useEffect(() => {
    if (userData?.city && cities.length > 0) {
      setSelectedCity(userData.city);
    }
  }, [userData?.city, cities]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error("Failed to load countries:", error);
        toast.error("Failed to load countries");
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data: State[] = await getStates(selectedCountry);
        const sortedData = data.sort((a: State, b: State) => a.name.localeCompare(b.name));
        setStates(sortedData);
      } catch (error) {
        console.error("Failed to load states:", error);
        toast.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedCountry || !selectedState) return;
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const data = await getCities(selectedCountry, selectedState);
        setCities(data);
      } catch (error) {
        console.error("Failed to load cities:", error);
        toast.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [selectedState, selectedCountry]);

  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const minSize = 10 * 1024; // 10KB
      const maxSize = 200 * 1024; // 200KB

      if (file.size < minSize || file.size > maxSize) {
        toast.error("Image size must be between 10KB and 200KB.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setRawImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
    setValue("image", croppedFile, { shouldValidate: true });
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPreviewImage(previewUrl);
    setIsEditMode(true);
    setShowCropper(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-user"],
    mutationFn: (formData: FormData) => UpdateProfile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("User updated successfully");
      setIsEditMode(false);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Update failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  const onError = (errors: any) => {
    const firstErrorMessage = Object.values(errors)
      .map((e: any) => e?.message)
      .find(Boolean);

    if (firstErrorMessage) {
      toast.error(firstErrorMessage as string);
    } else {
      toast.error("Please fill in all required fields to update your profile.");
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast.error("User ID is missing. Cannot update.");
      return;
    }
    
    // Explicit validation for dropdowns to provide clear alerts
    if (!selectedGender) {
        toast.error("Please select a Gender.");
        return;
    }
    if (!selectedClass) {
      toast.error("Please select your Class/Grade.");
      return;
    }
    if (!selectedCountry) {
        toast.error("Please select a Country.");
        return;
    }
    if (!selectedState) {
        toast.error("Please select a State/Province.");
        return;
    }
    if (!selectedCity) {
        toast.error("Please select a City.");
        return;
    }


    // Validation for Date of Birth
    const today = new Date();
    const birthDate = new Date(values.birth_date);
    today.setHours(0, 0, 0, 0); 
    birthDate.setHours(0, 0, 0, 0);

    if (birthDate > today) {
      toast.error("Birth Date cannot be in the future. Please select a valid date.");
      return;
    }


    try {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        }
        if (value !== undefined && value !== null) {
          if (key === "birth_date" && typeof value === "string") {
            const date = new Date(value);
            const formattedDate = date.toISOString().split("T")[0];
            formData.append(key, formattedDate);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (selectedGender) formData.append("gender", selectedGender);
      if (selectedCountry) formData.append("country", selectedCountry);
      if (selectedState) formData.append("state", selectedState);
      if (selectedCity) formData.append("city", selectedCity);
      if (selectedClass) formData.append("school_class", selectedClass);
      if(selectedCategory) formData.append('cat_id' , selectedCategory.toString())
      if(selectedCategoryName) formData.append("category_name" , selectedCategoryName)

      mutate(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 />
      </div>
    );
  }

  const getCountryName = (iso2: string) =>
    countries.find((c) => c.iso2 === iso2)?.name || iso2 || "NA";
  const getStateName = (iso2: string) =>
    states.find((s) => s.iso2 === iso2)?.name || iso2 || "NA";
  const getCityName = (name: string) =>
    cities.find((c) => c.name === name)?.name || name || "NA";

  return (
    <div className="max-w-5xl mx-auto pt-8 pb-4 px-4 md:pt-12 md:pb-8 md:px-8 bg-white rounded-lg shadow-lg">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-sm gap-2 text-[#245cab] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        {!isEditMode && (
          <button
            onClick={() => setIsEditMode(true)}
            className="flex text-sm text-[#245cab] bg-blue-100 border p-2 rounded-full hover:underline"
          >
            <Pencil className="mr-2 size-4" /> Edit
          </button>
        )}
      </div>
      <h2 className="text-3xl font-bold mb-2 text-center text-[#245cab]">
        Profile
      </h2>
      <div className="flex ml-6 mb-4 ">
        <div className="relative">
          <img
            src={previewImage ? previewImage : defaultImg}
            alt="Profile Avatar"
            loading="lazy"
            className="w-28 h-28 rounded-full object-cover border-b-4 border-[#245cab] shadow-md"
          />
          <input
            type="file"
            id="image"
            required
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          {isEditMode && (
            <>
             
              <button
                type="button"
                onClick={openFilePicker}
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-md transition-colors"
                aria-label="Upload image"
                title="Upload image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.image.message}
                </p>
              )}
            </>
          )}
        </div>

        {isEditMode && (
          <div className="text-xs text-gray-600 ml-10 self-center">
            <p className="font-semibold mb-1">Image Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Image size must be between 10KB and 200KB.</li>
              <li>Image should be clear and not blurry.</li>
              <li>Please upload potrait/passport size picture(user face should clearly visible)</li>
            </ul>
          </div>
        )}
      </div>



      {/* Cropper Modal */}
      <ImageCropperModal
        open={showCropper}
        imageSrc={rawImage || ""}
        onClose={() => setShowCropper(false)}
        onCropComplete={handleCropComplete}
      />

      {/* FORM */}
      {isEditMode ? (
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Personal Information */}
          <div className="space-y-1">
            <Label htmlFor="fname" className="text-sm font-medium">
              First Name<span className="text-red-500">*</span>
            </Label>
            <input
              id="fname"
              disabled={!isEditMode}
              placeholder="First Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("fname")}
            />
            {errors.fname && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fname.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="lname" className="text-sm font-medium">
              Last Name
            </Label>
            <input
              id="lname"
              disabled={!isEditMode}
              placeholder="Last Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("lname")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gender" className="text-sm font-medium">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedGender}
              disabled={!isEditMode}
              onValueChange={(value) => {
                setSelectedGender(value);
                setValue("gender", value, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="gender" className="w-full text-sm">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="birth_date" className="text-sm font-medium">
              Birth Date <span className="text-red-500">*</span>
            </Label>
            <input
              id="birth_date"
              disabled={!isEditMode}
              type="date"
              max={new Date().toISOString().split("T")[0]}
              onKeyDown={(e) => e.preventDefault()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("birth_date")}
            />
            {errors.birth_date && (
              <p className="text-red-500 text-xs mt-1">
                {errors.birth_date.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <input
              id="email"
              type="email"
              disabled
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="mobile" className="text-sm font-medium">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <input
              type="tel"
              maxLength={10}
              disabled={!isEditMode}
              inputMode="numeric"
              pattern="[0-9]*"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
              }}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm`}
              {...register("mobile", {
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Mobile number must be exactly 10 digits",
                },
              })}
            />
          </div>
          <div className="md:col-span-2 mt-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              School Information
            </h3>
          </div>
          <div className="space-y-1">
            <Label htmlFor="school_name" className="text-sm font-medium">
              School Name
            </Label>
            <input
              id="school_name"
              disabled={!isEditMode}
              placeholder="School Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("school_name")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="school_class" className="text-sm font-medium">
              Class/Grade <span className="text-red-500">*</span>
            </Label>
            <Select
                value={selectedClass}
                disabled = {!isEditMode || isProfileFinalized}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setValue("school_class", value, { shouldValidate: true });
                }}
              >
                <SelectTrigger id="school_class" className="w-full">
                  <SelectValue placeholder="Select Class/Grade" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {getAllClasses().map((className) => (
                    <SelectItem key={className} value={className}>{className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>


              {isOthersSelected && !isProfileFinalized &&  (
                <div className="mt-4">
                  <h3 className="font-semibold text-sm mb-2">Others Categories (Select One):</h3>
                  {categorydata_loading ? (
                    <p className="text-xs">Loading categories...</p>
                  ) : (
                    <div className="text-xs text-gray-700 space-y-1">
                      {data?.map((item: CategoryMasterData) => (
                        <label key={item.cat_id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="others_category"
                            checked={selectedCategory === item.cat_id}
                            value={item.cat_id}
                            onChange={() => {
                              setSelectedCategory(item.cat_id);
                              setSelectedCategoryName(item.category_name);
                            }}
                            className="accent-blue-500"
                          />
                          <span>{item.category_name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            
          </div>
          
          <div className="md:col-span-2 mt-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Parents/Guardian Information
            </h3>
          </div>
          <div className="space-y-1">
            <Label htmlFor="fa_name" className="text-sm font-medium">
              Parents/Guardian Name
            </Label>
            <input
              id="fa_name"
              disabled={!isEditMode}
              placeholder="Enter Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("fa_name")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fa_mobile" className="text-sm font-medium">
              Parents/Guardian Mobile
            </Label>
            <input
              id="fa_mobile"
              disabled={!isEditMode}
              type="tel"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter Mobile"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("fa_mobile", {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Mobile number must be exactly 10 digits",
                },
              })}
            />
            {errors.fa_mobile && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fa_mobile.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="fa_email" className="text-sm font-medium">
              Parents/Guardian Email
            </Label>
            <input
              id="fa_email"
              type="email"
              disabled={!isEditMode}
              placeholder="Enter Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("fa_email")}
            />
            {errors.fa_email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fa_email.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="mo_mobile" className="text-sm font-medium">
              Alternate Mobile
            </Label>
            <input
              type="tel"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              disabled={!isEditMode}
              id="mo_mobile"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
              }}
              placeholder="Enter Alternate Mobile"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm`}
              {...register("mo_mobile")}
            />
          </div>
          <div className="md:col-span-2 mt-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Address Information
            </h3>
          </div>
          <div className="space-y-1">
            <Label htmlFor="country" className="text-sm font-medium">
              Country <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => {
                setSelectedCountry(value);
                setValue("country", value, { shouldValidate: true });
                setSelectedState("");
                setSelectedCity("");
                setValue("state", "");
                setValue("city", "");
              }}
              disabled={!isEditMode}
            >
              <SelectTrigger id="country" className="w-full text-sm">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {countries.map((country) => (
                  <SelectItem key={country.iso2} value={country.iso2}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="state" className="text-sm font-medium">
              State/Province <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedState}
              onValueChange={(value) => {
                setSelectedState(value);
                setValue("state", value, { shouldValidate: true });
                setSelectedCity("");
                setValue("city", "");
              }}
              disabled={!selectedCountry || loadingStates || !isEditMode}
            >
              <SelectTrigger id="state" className="w-full text-sm">
                <SelectValue
                  placeholder={
                    loadingStates
                      ? "Loading states..."
                      : !selectedCountry
                        ? "Select country first"
                        : states.length === 0
                          ? "No states available"
                          : "Select State"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {states.map((state) => (
                  <SelectItem key={state.iso2} value={state.iso2}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="city" className="text-sm font-medium">
              City <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedCity}
              onValueChange={(value) => {
                setSelectedCity(value);
                setValue("city", value, { shouldValidate: true });
              }}
              disabled={!selectedState || loadingCities || !isEditMode}
            >
              <SelectTrigger id="city" className="w-full text-sm">
                <SelectValue
                  placeholder={
                    loadingCities
                      ? "Loading cities..."
                      : !selectedState
                        ? "Select state first"
                        : cities.length === 0
                          ? "No cities available"
                          : "Select City"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="address" className="text-sm font-medium">
              Address
            </Label>
            <input
              id="address"
              disabled={!isEditMode}
              placeholder="Street address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              {...register("address")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pincode" className="text-sm font-medium">
              Pincode/ZIP
            </Label>
            <input
              id="pincode"
              disabled={!isEditMode}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Pincode/ZIP"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/\D/g, '').slice(0, 6);
              }}
              {...register("pincode", {
                pattern: {
                  value: /^\d{6}$/,
                  message: "Pincode must be exactly 6 digits",
                },
              })}
            />
            {errors.pincode && (
              <p className="text-red-500 text-xs mt-1">
                {errors.pincode.message}
              </p>
            )}
          </div>
          {isEditMode && (
            <div className="md:col-span-2 mt-6 flex justify-center gap-4">
              <Button
                type="button"
                className="px-8 py-2 bg-white text-black rounded-md transition-colors border-2 border-[#245cab]"
                onClick={() => {
                  setIsEditMode(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-8 py-2 bg-[#245cab] hover:bg-[#9db2cf] text-white rounded-md transition-colors"
                disabled={isSubmitting || isPending}
              >
                {isSubmitting || isPending ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          )}
        </form>
      ) : (
        // READ-ONLY MODE
        <div>
          {/* Personal Information Block */}
          <div className="bg-gray-50 border rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
              <div><span className="font-medium text-gray-600">First Name:</span> <span className="ml-2">{userData?.fname || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Last Name:</span> <span className="ml-2">{userData?.lname || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Gender:</span> <span className="ml-2">{userData?.gender || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Birth Date:</span> <span className="ml-2">{formatBirthDate(String(userData?.birth_date)) || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Email:</span> <span className="ml-2">{userData?.email || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Mobile Number:</span> <span className="ml-2">{userData?.mobile || "NA"}</span></div>
            </div>
          </div>
          {/* School Information Block */}
          <div className="bg-gray-50 border rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">School Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
              <div><span className="font-medium text-gray-600">School Name:</span> <span className="ml-2">{userData?.school_name || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Class/Grade:</span> <span className="ml-2">{userData?.school_class || "NA"}</span></div>
            </div>
          </div>
          {/* Parent/Guardian Information Block */}
          <div className="bg-gray-50 border rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Parents/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
              <div><span className="font-medium text-gray-600">Name:</span> <span className="ml-2">{userData?.fa_name || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Mobile:</span> <span className="ml-2">{userData?.fa_mobile || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Email:</span> <span className="ml-2">{userData?.fa_email || "NA"}</span></div>
              <div>
                <span className="font-medium text-gray-600">Alternate Mobile:</span>
                <span className="ml-2">
                  {userData?.mo_mobile && userData.mo_mobile.trim().length > 0
                    ? userData.mo_mobile
                    : "NA"}
                </span>
              </div>
            </div>
          </div>
          {/* Address Information Block */}
          <div className="bg-gray-50 border rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
              <div><span className="font-medium text-gray-600">Country:</span> <span className="ml-2">{getCountryName(String(userData?.country))}</span></div>
              <div><span className="font-medium text-gray-600">State/Province:</span> <span className="ml-2">{getStateName(String(userData?.state))}</span></div>
              <div><span className="font-medium text-gray-600">City:</span> <span className="ml-2">{getCityName(String(userData?.city))}</span></div>
              <div><span className="font-medium text-gray-600">Address:</span> <span className="ml-2">{userData?.address || "NA"}</span></div>
              <div><span className="font-medium text-gray-600">Pincode/ZIP:</span> <span className="ml-2">{userData?.pincode || "NA"}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}