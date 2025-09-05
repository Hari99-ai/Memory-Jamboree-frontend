import { useEffect, useState, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input"; // Import the Input component
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"; // Import Card components
import { ArrowLeft } from "lucide-react";
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
    mode: "onChange",
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
      setValue("image", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["admin-user-create-profile"],
    mutationFn: async (formData: FormData) => {
      const formValues: Record<string, any> = {};
      if (formData instanceof FormData) {
        for (const [key, value] of formData.entries()) {
          formValues[key] = value;
        }
      }
      if (formValues.gender) {
        formValues.gender = formValues.gender.charAt(0).toUpperCase() +
          formValues.gender.slice(1).toLowerCase();
      }
      const processedFormData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          processedFormData.append(key, String(value));
        }
      });
      return CreateUser(processedFormData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("User registered successfully");
      reset();
      setPreviewImage(null);
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
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2 text-sm text-blue-500 transition rounded hover:text-blue-700"
          onClick={() => navigate("/admin/users/add")}
          type="button"
        >
          <ArrowLeft size={16} />
          <span className="font-medium hover:underline">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-center text-[#245cab]">
          Student Profile Registration
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        autoComplete="off"
      >
        <div className="flex flex-col items-center gap-6 p-4 md:flex-row">
          <div className="relative flex items-center justify-center flex-shrink-0 w-32 h-32">
            <img
              src={previewImage || defaultAvatar}
              alt="Profile Avatar"
              className="object-cover border-2 shadow-md w-28 h-28 rounded-full border-[#245cab] bg-gray-100"
            />
            <button
              type="button"
              title="Change photo"
              className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#245cab] shadow transition-all duration-200 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="18" height="13" rx="2" ry="2"></rect>
                <circle cx="12" cy="13.5" r="3.5"></circle>
                <path d="M16.5 7v-2a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v2"></path>
              </svg>
            </button>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              ref={fileInputRef}
              id="image"
            />
          </div>
          <div className="grid flex-1 w-full grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="fname" className="text-sm">First Name*</Label>
              <Input
                id="fname"
                placeholder="First Name"
                className={`mt-1 text-sm ${errors.fname ? "border-red-500" : ""}`}
                {...register("fname")}
              />
              {errors.fname && <p className="mt-1 text-xs text-red-500">{errors.fname.message}</p>}
            </div>
            <div>
              <Label htmlFor="lname" className="text-sm">Last Name</Label>
              <Input
                id="lname"
                placeholder="Last Name"
                className={`mt-1 text-sm ${errors.lname ? "border-red-500" : ""}`}
                {...register("lname")}
              />
              {errors.lname && <p className="mt-1 text-xs text-red-500">{errors.lname.message}</p>}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <Label htmlFor="gender" className="text-sm">Gender</Label>
                <Select
                  onValueChange={value => setValue("gender", value as any, { shouldValidate: true })}
                  value={watch("gender") || ""}
                >
                  <SelectTrigger id="gender" className={`w-full text-sm mt-1 ${errors.gender ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birth_date" className="text-sm">Birth Date*</Label>
                <Input
                  id="birth_date"
                  type="date"
                  className={`mt-1 text-sm ${errors.birth_date ? "border-red-500" : ""}`}
                  {...register("birth_date")}
                />
                {errors.birth_date && <p className="mt-1 text-xs text-red-500">{errors.birth_date.message}</p>}
              </div>
              <div>
                <Label htmlFor="mobile" className="text-sm">Mobile Number*</Label>
                <Input
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); }}
                  className={`mt-1 text-sm ${errors.mobile ? "border-red-500" : ""}`}
                  {...register("mobile")}
                />
                {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email" className="text-sm">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className={`mt-1 text-sm ${errors.email ? "border-red-500" : ""}`}
                  {...register("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password" className="text-sm">Password*</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  className={`mt-1 text-sm ${errors.password ? "border-red-500" : ""}`}
                  {...register("password")}
                />
                {errors.password && (
                  <div className="mt-1 text-xs text-red-600">
                    Password must be at least 6 characters<br />
                    Include 1 number, 1 lowercase, 1 uppercase.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="school_name" className="text-sm">School Name</Label>
                <Input
                  id="school_name"
                  placeholder="School Name"
                  className={`mt-1 text-sm ${errors.school_name ? "border-red-500" : ""}`}
                  {...register("school_name")}
                />
                {errors.school_name && <p className="mt-1 text-xs text-red-500">{errors.school_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="school_class" className="text-sm">Class/Grade*</Label>
                <Select
                  value={selectedClass}
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setValue("school_class", value);
                  }}
                >
                  <SelectTrigger id="school_class" className="w-full mt-1 text-sm">
                    <SelectValue placeholder="Select Class/Grade" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getAllClasses().map((className) => (
                      <SelectItem key={className} value={className}>{className}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isOthersSelected && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-semibold">Others Categories (Select One):</h3>
                    {categorydata_loading ? (
                      <p className="text-xs">Loading categories...</p>
                    ) : (
                      <div className="space-y-1 text-xs text-gray-700">
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
                {errors.school_class && <p className="mt-1 text-xs text-red-500">{errors.school_class?.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <Label htmlFor="fa_name" className="text-sm">Name</Label>
                <Input
                  id="fa_name"
                  placeholder="Enter Name"
                  className={`mt-1 text-sm ${errors.fa_name ? "border-red-500" : ""}`}
                  {...register("fa_name")}
                />
                {errors.fa_name && <p className="mt-1 text-xs text-red-500">{errors.fa_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="fa_mobile" className="text-sm">Mobile</Label>
                <Input
                  id="fa_mobile"
                  placeholder="Enter Mobile"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); }}
                  className={`mt-1 text-sm ${errors.fa_mobile ? "border-red-500" : ""}`}
                  {...register("fa_mobile")}
                />
                {errors.fa_mobile && <p className="mt-1 text-xs text-red-500">{errors.fa_mobile.message}</p>}
              </div>
              <div>
                <Label htmlFor="fa_email" className="text-sm">Email</Label>
                <Input
                  id="fa_email"
                  type="email"
                  placeholder="Enter Email"
                  className={`mt-1 text-sm ${errors.fa_email ? "border-red-500" : ""}`}
                  {...register("fa_email")}
                />
                {errors.fa_email && <p className="mt-1 text-xs text-red-500">{errors.fa_email.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div>
                <Label htmlFor="country" className="text-sm">Country</Label>
                <Select
                  onValueChange={value => {
                    setValue("country", value, { shouldValidate: true });
                    setSelectedCountry(value);
                  }}
                  value={watch("country") || selectedCountry}
                >
                  <SelectTrigger id="country" className="w-full mt-1 text-sm">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((country: any) => (
                      <SelectItem key={country.iso2} value={country.iso2}>{country.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="state" className="text-sm">State/Province</Label>
                <Select
                  onValueChange={value => {
                    setValue("state", value, { shouldValidate: true });
                    setSelectedState(value);
                  }}
                  disabled={!selectedCountry || loadingStates}
                  value={watch("state") || selectedState}
                >
                  <SelectTrigger id="state" className="w-full mt-1 text-sm">
                    <SelectValue placeholder={
                      loadingStates ? "Loading..." : "Select State"
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {states.map((state: any) => (
                      <SelectItem key={state.iso2} value={state.iso2}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city" className="text-sm">City</Label>
                <Select
                  onValueChange={value => setValue("city", value, { shouldValidate: true })}
                  disabled={!selectedState || loadingCities}
                  value={watch("city")}
                >
                  <SelectTrigger id="city" className="w-full mt-1 text-sm">
                    <SelectValue placeholder={
                      loadingCities ? "Loading..." : "Select City"
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cities.map((city: any) => (
                      <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pincode" className="text-sm">Pincode/ZIP</Label>
                <Input
                  id="pincode"
                  placeholder="Pincode/ZIP"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/\D/g, '').slice(0, 6);
                  }}
                  className={`mt-1 text-sm ${errors.pincode ? "border-red-500" : ""}`}
                  {...register("pincode")}
                />
                {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode.message}</p>}
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="address" className="text-sm">Address</Label>
              <Input
                id="address"
                placeholder="Street address"
                className={`mt-1 text-sm ${errors.address ? "border-red-500" : ""}`}
                {...register("address")}
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="w-full px-10 py-2 font-semibold text-white transition bg-[#245cab] hover:bg-blue-700 md:w-auto"
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? "Submitting..." : "Create Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SingleUserForm;