import { useEffect, useState, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ArrowLeft, Camera } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "react-phone-input-2/lib/style.css";
import {
  getCountries,
  getCities,
  getStates,
  getAllClasses,
} from "../../../lib/select";
import { CreateUser } from "../../../lib/api";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useOthersCategory } from "../../../hooks/useOthersCategory";
import { CategoryMasterData } from "../../../types";

// SVG default avatar as datauri
const defaultAvatar =
  "data:image/svg+xml;utf8,<svg fill='none' height='120' viewBox='0 0 120 120' width='120' xmlns='http://www.w3.org/2000/svg'><circle cx='60' cy='60' fill='%23E2E8F0' r='60'/><ellipse cx='60' cy='80' fill='%23b8c4d1' rx='33' ry='21'/><circle cx='60' cy='53' fill='%237fa2d8' r='27'/></svg>";

const formSchema = z.object({
  fname: z.string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(50, { message: "First name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "First name can only contain letters and spaces" })
    .trim(),
  lname: z.string()
    .max(50, { message: "Last name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]*$/, { message: "Last name can only contain letters and spaces" })
    .trim()
    .optional()
    .or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  birth_date: z.string()
    .min(1, { message: "Birth date is required" })
    .refine(date => {
      if (!date) return false;
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate <= today;
    }, { message: "Birth date cannot be in the future" }),
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),
  mobile: z.string()
    .regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number" }),
  fa_name: z.string()
    .min(2, { message: "Parent/Guardian name must be at least 2 characters long" })
    .max(50, { message: "Parent/Guardian name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Parent/Guardian name can only contain letters and spaces" })
    .trim()
    .optional()
    .or(z.literal("")),
  fa_mobile: z.string()
    .regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number" })
    .optional()
    .or(z.literal("")),
  fa_email: z.string()
    .email({ message: "Invalid email format" })
    .optional()
    .or(z.literal("")),
  address: z.string()
    .max(200, { message: "Address cannot exceed 200 characters" })
    .trim()
    .optional()
    .or(z.literal("")),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string()
    .regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pincode" })
    .optional()
    .or(z.literal("")),
  country: z.string().trim().optional(),
  school_name: z.string()
    .max(100, { message: "School name cannot exceed 100 characters" })
    .trim()
    .optional()
    .or(z.literal("")),
  school_class: z.string().min(1, "Please Select any one Class Grade"),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" }),
  image: z.any().optional(),
});

type FormField = z.infer<typeof formSchema>;

function SingleUserForm() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isOthersSelected = selectedClass?.startsWith("Others");
  const cleanedClass = isOthersSelected ? "Others" : null;

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data, isLoading: categorydata_loading, refetch } = useOthersCategory(cleanedClass);

  useEffect(() => {
    if (isOthersSelected) {
      refetch();
    }
  }, [isOthersSelected, refetch]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormField>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "IN",
      state: "",
      city: "",
      mobile: "",
    },
    // Show errors only after submit, but then re-validate on every change
    mode: "onSubmit", 
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data = await getStates(selectedCountry);
        setStates(data);
        setSelectedState("");
        setCities([]);
        setValue("state", "");
        setValue("city", "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, [selectedCountry, setValue]);

  useEffect(() => {
    if (!selectedCountry || !selectedState) return;
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const data = await getCities(selectedCountry, selectedState);
        setCities(data);
        setValue("city", "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [selectedState, selectedCountry, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true, shouldDirty: true });
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["admin-user-create-profile"],
    mutationFn: async (formData: FormData) => {
      return CreateUser(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("User registered successfully");
      reset();
      setPreviewImage(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      if (error?.response?.status === 402) {
        toast.error("User Already Registered");
      } else {
        toast.error("Something Went Wrong");
      }
    },
  });

  const onSubmit = async (values: Record<string, any>) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (key === "birth_date" && typeof value === "string") {
            const date = new Date(value);
            const formattedDate = date.toISOString().split("T")[0];
            formData.append(key, formattedDate);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      if (!formData.has("fname")) formData.append("fname", "");
      if (!formData.has("gender")) formData.append("gender", "");
      if (!formData.has("birth_date")) formData.append("birth_date", "");
      if (!formData.has("email")) formData.append("email", "");
      
      const gender = formData.get("gender") as string;
      if (gender) {
        formData.set("gender", gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase());
      }

      if (selectedCategory) formData.append('cat_id', selectedCategory.toString())
      if (selectedCategoryName) formData.append("category_name", selectedCategoryName)

      mutate(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <button
          className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#245cab] self-start sm:self-auto"
          onClick={() => navigate("/admin/users/add")}
          type="button"
        >
          <ArrowLeft size={18} />
          <span className="font-medium hover:underline">Back to List</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-[#245cab] text-center">
          Student Profile Registration
        </h1>
        <div className="w-[80px] hidden sm:block"></div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 "
        autoComplete="off"
      >
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
              <img
                src={previewImage || defaultAvatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              title="Change photo"
              className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#245cab] text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-700 z-10"
              onClick={handleTriggerFileUpload}
            >
              <Camera size={18} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              ref={fileInputRef}
              id="image-upload"
            />
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 self-center">
            <div className="space-y-2">
              <Label htmlFor="fname">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="fname"
                placeholder="First Name"
                className={`text-black ${errors.fname ? "border-red-500" : ""}`}
                {...register("fname")}
              />
              {errors.fname && <p className="text-xs text-red-500 font-medium">{errors.fname.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lname">Last Name</Label>
              <Input
                id="lname"
                placeholder="Last Name"
                className={`text-black ${errors.lname ? "border-red-500" : ""}`}
                {...register("lname")}
              />
              {errors.lname && <p className="text-xs text-red-500 font-medium">{errors.lname.message}</p>}
            </div>
          </div>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  onValueChange={value => setValue("gender", value as any, { shouldValidate: true })}
                  value={watch("gender") || ""}
                >
                  <SelectTrigger id="gender" className={`text-black ${errors.gender ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Birth Date <span className="text-red-500">*</span></Label>
                <Input
                  id="birth_date"
                  type="date"
                  className={`text-black ${errors.birth_date ? "border-red-500" : ""}`}
                  {...register("birth_date")}
                />
                {errors.birth_date && <p className="text-xs text-red-500 font-medium">{errors.birth_date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                <Input
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); }}
                  className={`text-black ${errors.mobile ? "border-red-500" : ""}`}
                  {...register("mobile")}
                />
                {errors.mobile && <p className="text-xs text-red-500 font-medium">{errors.mobile.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  className={`text-black ${errors.email ? "border-red-500" : ""}`}
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  className={`text-black ${errors.password ? "border-red-500" : ""}`}
                  {...register("password")}
                />
                {errors.password ? (
                  <div className="text-xs text-red-600 font-medium">
                    Password must be at least 6 characters, include 1 number, 1 lowercase, 1 uppercase.
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Min 6 chars, 1 number, 1 uppercase, 1 lowercase.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">School Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="school_name">School Name</Label>
                <Input
                  id="school_name"
                  placeholder="Enter School Name"
                  className={`text-black ${errors.school_name ? "border-red-500" : ""}`}
                  {...register("school_name")}
                />
                {errors.school_name && <p className="text-xs text-red-500 font-medium">{errors.school_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_class">Class/Grade <span className="text-red-500">*</span></Label>
                <Select
                  value={selectedClass}
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setValue("school_class", value, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger id="school_class" className={`text-black ${errors.school_class ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Class/Grade" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getAllClasses().map((className) => (
                      <SelectItem key={className} value={className}>{className}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.school_class && <p className="text-xs text-red-500 font-medium">{errors.school_class?.message}</p>}

                {isOthersSelected && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Select Specific Category:</h3>
                    {categorydata_loading ? (
                      <p className="text-xs text-blue-600">Loading categories...</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {data?.map((item: CategoryMasterData) => (
                          <label key={item.cat_id} className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-1 rounded transition">
                            <input
                              type="radio"
                              name="others_category"
                              checked={selectedCategory === item.cat_id}
                              value={item.cat_id}
                              onChange={() => {
                                setSelectedCategory(item.cat_id);
                                setSelectedCategoryName(item.category_name);
                              }}
                              className="accent-[#245cab] h-4 w-4"
                            />
                            <span className="text-gray-700">{item.category_name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Parent/Guardian Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fa_name">Parent Name</Label>
                <Input
                  id="fa_name"
                  placeholder="Enter Name"
                  className={`text-black ${errors.fa_name ? "border-red-500" : ""}`}
                  {...register("fa_name")}
                />
                {errors.fa_name && <p className="text-xs text-red-500 font-medium">{errors.fa_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fa_mobile">Parent Mobile</Label>
                <Input
                  id="fa_mobile"
                  placeholder="Enter Mobile"
                  inputMode="numeric"
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); }}
                  className={`text-black ${errors.fa_mobile ? "border-red-500" : ""}`}
                  {...register("fa_mobile")}
                />
                {errors.fa_mobile && <p className="text-xs text-red-500 font-medium">{errors.fa_mobile.message}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="fa_email">Parent Email</Label>
                <Input
                  id="fa_email"
                  type="email"
                  placeholder="Enter Email"
                  className={`text-black ${errors.fa_email ? "border-red-500" : ""}`}
                  {...register("fa_email")}
                />
                {errors.fa_email && <p className="text-xs text-red-500 font-medium">{errors.fa_email.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  onValueChange={value => {
                    setValue("country", value, { shouldValidate: true });
                    setSelectedCountry(value);
                  }}
                  value={watch("country") || selectedCountry}
                >
                  <SelectTrigger id="country" className="text-black">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((country: any) => (
                      <SelectItem key={country.iso2} value={country.iso2}>{country.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Select
                  onValueChange={value => {
                    setValue("state", value, { shouldValidate: true });
                    setSelectedState(value);
                  }}
                  disabled={!selectedCountry || loadingStates}
                  value={watch("state") || selectedState}
                >
                  <SelectTrigger id="state" className="text-black">
                    <SelectValue placeholder={loadingStates ? "Loading..." : "Select State"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {states.map((state: any) => (
                      <SelectItem key={state.iso2} value={state.iso2}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  onValueChange={value => setValue("city", value, { shouldValidate: true })}
                  disabled={!selectedState || loadingCities}
                  value={watch("city")}
                >
                  <SelectTrigger id="city" className="text-black">
                    <SelectValue placeholder={loadingCities ? "Loading..." : "Select City"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cities.map((city: any) => (
                      <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode/ZIP</Label>
                <Input
                  id="pincode"
                  placeholder="Pincode"
                  inputMode="numeric"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/\D/g, '').slice(0, 6);
                  }}
                  className={`text-black ${errors.pincode ? "border-red-500" : ""}`}
                  {...register("pincode")}
                />
                {errors.pincode && <p className="text-xs text-red-500 font-medium">{errors.pincode.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address, apartment, suite, etc."
                className={`text-black ${errors.address ? "border-red-500" : ""}`}
                {...register("address")}
              />
              {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate("/admin/users")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto px-8 bg-[#245cab] hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? "Creating Profile..." : "Create Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SingleUserForm;