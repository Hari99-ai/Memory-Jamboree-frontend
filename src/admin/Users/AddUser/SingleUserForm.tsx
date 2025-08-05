
import { useEffect, useState, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
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
    .optional(),
 
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select a gender"
  }),
 
  birth_date: z.string()
    .min(1, { message: "Birth date is required" }),
    // .refine((date) => {
    //   const birthDate = new Date(date);
    //   const today = new Date();
    //   const age = today.getFullYear() - birthDate.getFullYear();
    //   const valid = !isNaN(birthDate.getTime()) && age >= 5 && age <= 100;
    //   return valid;
    // }, { message: "Age must be between 5 and 100 years and date must be valid" }),
 
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),
 
  mobile: z.string()
    .regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number" }),
 
  fa_name: z.string()
    // .min(2, { message: "Parent/Guardian name must be at least 2 characters long" })
    // .max(50, { message: "Parent/Guardian name cannot exceed 50 characters" })
    // .regex(/^[a-zA-Z\s]+$/, { message: "Parent/Guardian name can only contain letters and spaces" })
    .trim()
    .optional(),
 
  fa_mobile: z.string()
    // .regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number" })
    .optional(),
 
  fa_email: z.string()
    // .email({ message: "Invalid email format" })
    .optional()
    .or(z.literal("")),
 
  address: z.string()
    // .max(200, { message: "Address cannot exceed 200 characters" })
    .trim()
    .optional(),
 
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
 
  pincode: z.string()
    // .regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pincode" })
    .optional(),
 
  country: z.string().trim().optional(),
 
  school_name: z.string()
    .max(100, { message: "School name cannot exceed 100 characters" })
    .trim()
    .optional(),
 
  school_class: z.string().min(1 , "Please Select any one Class Grade"),
 
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
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  // const [isEditMode, setIsEditMode] = useState(false);

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

  const allowedGenders = ["Male", "Female", "Other"] as const;

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
      mutate(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl">
      <div className="sticky top-0 z-10 px-6 pt-6 bg-white rounded-t-2xl">
        <button
          className="flex items-center gap-2 mb-6 text-blue-500 transition rounded hover:text-blue-700"
          onClick={() => navigate("/admin/users/add")}
          type="button"
        >
          <ArrowLeft size={18} />
          <span className="font-medium hover:underline">Back</span>
        </button>

        <h2 className="mb-6 text-3xl font-bold text-center text-[#245cab]">
          Student Profile Registration
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="px-6 pb-6 space-y-6"
        autoComplete="off"
      >

        {/* AVATAR AND NAME */}
        <div className="flex flex-col items-center col-span-1 gap-6 p-4 shadow md:col-span-2 md:flex-row bg-slate-50 rounded-xl">
          <div className="relative flex items-center justify-center flex-shrink-0 w-32 h-32">
            <img
              src={previewImage || defaultAvatar}
              alt="Profile Avatar"
              className="w-28 h-28 rounded-full object-cover border-2 border-[#245cab] shadow-md bg-gray-100"
            />
            <button
              type="button"
              title="Change photo"
              className="absolute bottom-2 right-2 shadow
    flex items-center justify-center
    rounded-full bg-[#245cab] hover:bg-blue-800
    border-2 border-white
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{
                width: "40px",
                height: "40px",
                padding: 0,
                zIndex: 0, // ✅ Or remove it entirely
              }}

              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="3" y="7" width="18" height="13" rx="2" ry="2"></rect>
                <circle cx="12" cy="13.5" r="3.5"></circle>
                <path d="M16.5 7v-2a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v2"></path>
              </svg>
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              ref={fileInputRef}
              id="image"
            />
          </div>
          <div className="grid flex-1 w-full grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-2">
            <div>
              <Label htmlFor="fname">First Name*</Label>
              <input
                id="fname"
                placeholder="First Name"
                className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.fname ? "border-red-500" : "border-gray-300"}`}
                {...register("fname")}
              />
              {errors.fname && <p className="text-xs text-red-500">{errors.fname.message}</p>}
            </div>
            <div>
              <Label htmlFor="lname">Last Name</Label>
              <input
                id="lname"
                placeholder="Last Name"
                className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.lname ? "border-red-500" : "border-gray-300"}`}
                {...register("lname")}
              />
              {errors.lname && <p className="text-xs text-red-500">{errors.lname.message}</p>}
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="p-6 shadow md:col-span-2 rounded-xl bg-slate-50">
          <h3 className="mb-4 text-lg font-bold text-gray-600">Personal Information</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="gender">Gender*</Label>
              <Select
                onValueChange={value => allowedGenders.includes(value as any)
                  ?? setValue("gender", value as any, { shouldValidate: true })
                }
                value={watch("gender") || ""}
              >
                <SelectTrigger id="gender" className={`w-full ${errors.gender ? "border-red-500" : ""}`}>
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
              <Label htmlFor="birth_date">Birth Date*</Label>
              <input
                id="birth_date"
                type="date"
                className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.birth_date ? "border-red-500" : "border-gray-300"}`}
                {...register("birth_date")}
              />
              {errors.birth_date && <p className="text-xs text-red-500">{errors.birth_date.message}</p>}
            </div>
            <div>
              <Label htmlFor="mobile">Mobile Number*</Label>
              <input
                type="tel"
                maxLength={10}
                // disabled={!isEditMode}
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                }}
                className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.mobile ? "border-red-500" : "border-gray-300"}`}
                {...register("mobile", {
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Mobile number must be exactly 10 digits",
                  },
                })}

              />
              {errors.mobile && (
                <p className="text-xs text-red-500">{errors.mobile.message}</p>
              )}
            </div>


          </div>
          <div className="grid grid-cols-1 gap-5 mt-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email*</Label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"}`}
                {...register("email")}
                // onKeyDown={(e) => {
                //   if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                //     e.preventDefault();
                //   }
                // }}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password*</Label>
              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"}`}
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
        </div>

        {/* SCHOOL INFO */}
        <div className="p-6 shadow md:col-span-2 rounded-xl bg-slate-50">
          <h3 className="mb-4 text-lg font-bold text-gray-600">School Information</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="school_name">School Name</Label>
              <input
                id="school_name"
                placeholder="School Name"
                className={`w-full px-3 py-2 border rounded-md ${errors.school_name ? "border-red-500" : "border-gray-300"}`}
                {...register("school_name")}
              />
              {errors.school_name && <p className="text-xs text-red-500">{errors.school_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="school_class">Class/Grade</Label>
              <Select
                onValueChange={value => setValue("school_class", value, { shouldValidate: true })}
                value={watch("school_class")}
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
            </div>
          </div>
        </div>

        {/* PARENT INFO */}
        <div className="p-6 shadow md:col-span-2 rounded-xl bg-slate-50">
          <h3 className="mb-4 text-lg font-bold text-gray-600">Parent/Guardian Information</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="fa_name">Name</Label>
              <input
                id="fa_name"
                placeholder="Enter Name"
                className={`w-full px-3 py-2 border rounded-md ${errors.fa_name ? "border-red-500" : "border-gray-300"}`}
                {...register("fa_name")}
              />
              {errors.fa_name && <p className="text-xs text-red-500">{errors.fa_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="fa_mobile">Mobile</Label>
              <input
                id="fa_mobile"
                placeholder="Enter Mobile"
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                }}
                className={`w-full px-3 py-2 border rounded-md ${errors.fa_mobile ? "border-red-500" : "border-gray-300"}`}
                {...register("fa_mobile")}
              />
              {errors.fa_mobile && <p className="text-xs text-red-500">{errors.fa_mobile.message}</p>}
            </div>
            <div>
              <Label htmlFor="fa_email">Email</Label>
              <input
                id="fa_email"
                type="email"
                placeholder="Enter Email"
                className={`w-full px-3 py-2 border rounded-md ${errors.fa_email ? "border-red-500" : "border-gray-300"}`}
                {...register("fa_email")}
              />
              {errors.fa_email && <p className="text-xs text-red-500">{errors.fa_email.message}</p>}
            </div>
          </div>
        </div>

        {/* ADDRESS INFO */}
        <div className="p-6 shadow md:col-span-2 rounded-xl bg-slate-50">
          <h3 className="mb-4 text-lg font-bold text-gray-600">Address Information</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                onValueChange={value => {
                  setValue("country", value, { shouldValidate: true });
                  setSelectedCountry(value);
                }}
                value={watch("country") || selectedCountry}
              >
                <SelectTrigger id="country" className="w-full">
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
              <Label htmlFor="state">State/Province</Label>
              <Select
                onValueChange={value => {
                  setValue("state", value, { shouldValidate: true });
                  setSelectedState(value);
                }}
                disabled={!selectedCountry || loadingStates}
                value={watch("state") || selectedState}
              >
                <SelectTrigger id="state" className="w-full">
                  <SelectValue placeholder={
                    loadingStates ? "Loading states..." :
                      !selectedCountry ? "Select country" :
                        states.length === 0 ? "No states available" :
                          "Select State"
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
              <Label htmlFor="city">City</Label>
              <Select
                onValueChange={value => setValue("city", value, { shouldValidate: true })}
                disabled={!selectedState || loadingCities}
                value={watch("city")}
              >
                <SelectTrigger id="city" className="w-full">
                  <SelectValue placeholder={
                    loadingCities ? "Loading cities..." :
                      !selectedState ? "Select state" :
                        cities.length === 0 ? "No cities available" :
                          "Select City"
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
              <Label htmlFor="pincode">Pincode/ZIP</Label>
              <input
                id="pincode"
                placeholder="Pincode/ZIP"
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/\D/g, '').slice(0, 6);
                }}
                className={`w-full px-3 py-2 border rounded-md ${errors.pincode ? "border-red-500" : "border-gray-300"}`}
                {...register("pincode")}
              />
              {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="address">Address</Label>
            <input
              id="address"
              placeholder="Street address"
              className={`w-full px-3 py-2 border rounded-md ${errors.address ? "border-red-500" : "border-gray-300"}`}
              {...register("address")}
            />
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="sticky bottom-0 left-0 right-0 p-6 bg-white border-t">
          <div className="max-w-4xl mx-auto">
            <Button
              type="submit"
              className="w-full px-10 py-2 text-white transition bg-[#245cab] hover:bg-blue-700 font-semibold rounded md:w-auto"
              disabled={isSubmitting || isPending}
            >
              {isSubmitting || isPending ? "Submitting..." : "Create Profile"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SingleUserForm;


// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState, useRef } from "react";
// import { Button } from "../../../components/ui/button";
// import { Label } from "../../../components/ui/label";
// import { ArrowLeft } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../../components/ui/select";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import "react-phone-input-2/lib/style.css";
// import {
//   getCountries,
//   getCities,
//   getStates,
//   getAllClasses,
// } from "../../../lib/select";
// import { CreateUser } from "../../../lib/api";
// import { toast } from "react-hot-toast";
// // import { Alert, AlertDescription } from "../../../components/ui/alert";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// // import ClassesDropdwon from "../../../components/Dropdowns/ClassesDropdwon";
// // import ClassesDropdown from "../../../components/Dropdowns/ClassesDropdwon";
// // import { formSchema } from "../../../types/schema";
// // import { useNavigate } from "react-router-dom";

// const formSchema = z.object({
//   fname: z.string()
//     .min(2, { message: "First name must be at least 2 characters" })
//     .max(50, { message: "First name cannot exceed 50 characters" })
//     .regex(/^[a-zA-Z\s]*$/, { message: "First name can only contain letters and spaces" }),
 
//   lname: z.string()
//     .max(50, { message: "Last name cannot exceed 50 characters" })
//     .regex(/^[a-zA-Z\s]*$/, { message: "Last name can only contain letters and spaces" })
//     .optional(),
 
//   gender: z.enum(["Male", "Female", "Other"], {
//     required_error: "Please select a gender"
//   }),
 
//   birth_date: z.string()
//     .min(1, { message: "Birth date is required" })
//     .refine((date) => {
//       const today = new Date();
//       const birthDate = new Date(date);
//       const age = today.getFullYear() - birthDate.getFullYear();
//       return age >= 5 && age <= 100;
//     }, { message: "Age must be between 5 and 100 years" }),
 
//   email: z.string()
//     .email({ message: "Invalid email format" })
//     .min(1, { message: "Email is required" }),
 
//   mobile: z.string()
//     .min(10, { message: "Mobile number must be  10 digits" })
//     .max(10, { message: "Mobile number cannot exceed 10 digits" })
//     .regex(/^\d+$/, { message: "Mobile number can only contain digits" }),
 
//   fa_name: z.string()
//     .min(2, { message: "Parent/Guardian name must be at least 2 characters" })
//     .max(50, { message: "Parent/Guardian name cannot exceed 50 characters" })
//     .regex(/^[a-zA-Z\s]*$/, { message: "Parent/Guardian name can only contain letters and spaces" })
//     .optional(),
 
//   fa_mobile: z.string()
//     .regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number" })
//     .optional(),
 
//   fa_email: z.string()
//     .email({ message: "Invalid email format" })
//     .optional()
//     .or(z.literal("")),
 
//   address: z.string()
//     .max(200, { message: "Address cannot exceed 200 characters" })
//     .optional(),
 
//   city: z.string().optional(),
//   state: z.string().optional(),
//   pincode: z.string()
//     .regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pincode" })
//     .optional(),
 
//   country: z.string().optional(),
 
//   school_name: z.string()
//     .max(100, { message: "School name cannot exceed 100 characters" })
//     .optional(),
 
//   school_class: z.string().optional(),
 
//   password: z.string()
//     .min(6, { message: "Password must be at least 6 characters" })
//     .regex(/[0-9]/, { message: "Password must contain at least one number" })
//     .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
//     .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
//     .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" }),
 
//   image: z.any().optional(),
// });



// type FormField = z.infer<typeof formSchema>;

// function SingleUserForm() {
//   // const navigate = useNavigate()
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [selectedCountry, setSelectedCountry] = useState("IN");
//   const [selectedState, setSelectedState] = useState("");
//   const [loadingStates, setLoadingStates] = useState(false);
//   const [loadingCities, setLoadingCities] = useState(false);
//   // const [formStatus, setFormStatus] = useState({ type: "", message: "" });
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const navigate = useNavigate();
//   const defaultAvatar = null;

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     reset,
//     formState: { errors,  isSubmitting },
//   } = useForm<FormField>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       country: "IN",
//       state: "",
//       city: "",
//       mobile: "",
//     },
//     mode: "onChange",
//   });
//   // const genderValue = watch("gender" );

//   const allowedGenders = ["Male", "Female", "Other"] as const;


//   // Load countries on mount
//   useEffect(() => {
//     const loadCountries = async () => {
//       try {
//         const data = await getCountries();
//         setCountries(data);
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     loadCountries();
//   }, []);

//   // Load states when country changes
//   useEffect(() => {
//     if (!selectedCountry) return;

//     const loadStates = async () => {
//       setLoadingStates(true);
//       try {
//         const data = await getStates(selectedCountry);
//         setStates(data);
//         setSelectedState("");
//         setCities([]);
//         setValue("state", "");
//         setValue("city", "");
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoadingStates(false);
//       }
//     };
//     loadStates();
//   }, [selectedCountry, setValue]);

//   // Load cities when state changes
//   useEffect(() => {
//     if (!selectedCountry || !selectedState) return;

//     const loadCities = async () => {
//       setLoadingCities(true);
//       try {
//         const data = await getCities(selectedCountry, selectedState);
//         setCities(data);
//         setValue("city", "");
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoadingCities(false);
//       }
//     };
//     loadCities();
//   }, [selectedState, selectedCountry, setValue]);

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setValue("image", file, { shouldValidate: true });

//       const reader = new FileReader();
//       reader.onload = () => {
//         setPreviewImage(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const queryClient = useQueryClient();

//   const { mutate, isPending } = useMutation({
//     mutationKey: ["admin-user-create-profile"],
//     mutationFn: async (formData: FormData) => {
//       // Create a regular object from FormData
//       const formValues: Record<string, any> = {};
//       if (formData instanceof FormData) {
//         for (const [key, value] of formData.entries()) {
//           formValues[key] = value;
//         }
//       }

//       console.log("Raw form values:", formValues);

//       // Process gender value - ensure proper case
//       if (formValues.gender) {
//         formValues.gender =
//           formValues.gender.charAt(0).toUpperCase() +
//           formValues.gender.slice(1).toLowerCase();
//       }

//       // Create new FormData with processed values
//       const processedFormData = new FormData();
//       Object.entries(formValues).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           processedFormData.append(key, String(value));
//         }
//       });

//       console.log("Processed form data:");
//       for (const [key, value] of processedFormData.entries()) {
//         console.log(key, value);
//       }
//       console.log("Submitting user data:", processedFormData);
//       return CreateUser(processedFormData); // Send the processed data
//     },

//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["user-profile"] });
//       toast.success("User registered successfully");
//       reset()
//     },
//     onError: (error: any) => {
//       console.error("Registration error:", error);
//       if(error?.response?.status === 402){
//         toast.error("User Already Registered")
//       }else{
//         toast.error("Something Went Wrong")
//       }
//       // const errorMessage =
//       //   error.response?.data?.message ||
//       //   error.message ||
//       //   "Registration failed. Please try again.";
//       // toast.error(errorMessage);
//     },
//   });

//   // const password = watch("password") || "";

//   // const minLength = password.length >= 6;
//   // const hasNumber = /[0-9]/.test(password);
//   // const hasLower = /[a-z]/.test(password);
//   // const hasUpper = /[A-Z]/.test(password);
  
//   const onSubmit = async (values: Record<string, any>) => {
//     try {
      
//       const formData = new FormData();
//       // Append all fields that have values
//       Object.entries(values).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           // Handle special cases for dates/files
//           if (value instanceof File) {
//             formData.append(key, value);
//           } else if (key === "birth_date" && typeof value === "string") {
//             // Format date as YYYY-MM-DD for MySQL
//             const date = new Date(value);
//             const formattedDate = date.toISOString().split("T")[0];
//             formData.append(key, formattedDate);
//           } else {
//             formData.append(key, String(value));
//           }
//         }
//       });

//       // Ensure required fields are always included
//       if (!formData.has("fname")) formData.append("fname", "");
//       if (!formData.has("gender")) formData.append("gender", "");
//       if (!formData.has("birth_date")) formData.append("birth_date", "");
//       if (!formData.has("email")) formData.append("email", "");

//       console.log("Submitting FormData:");
//       for (const [key, value] of formData.entries()) {
//         console.log(key, value instanceof File ? `File: ${value.name}` : value);
//       }

//       mutate(formData);
//     } catch (error) {
//       console.error("Form submission error:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to update user"
//       );
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
//       {/* {formStatus.message && (
//         <Alert
//           className={`mb-6 ${
//             formStatus.type === "error"
//               ? "bg-red-50 border-red-200 text-red-800"
//               : formStatus.type === "success"
//               ? "bg-green-50 border-green-200 text-green-800"
//               : "bg-blue-50 border-blue-200 text-blue-800"
//           }`}
//         >
//           <AlertDescription>{formStatus.message}</AlertDescription>
//         </Alert>
//       )} */}
//       <button
//         className="mb-4 px-4 py-2 text-blue-500 rounded-md transition-colors duration-200 flex items-center gap-2 hover:text-blue-700"
//         onClick={() => navigate("/admin/users/add")}
//       >
//         <ArrowLeft size={16} />
//         <span className="hover:underline">Back</span>
//       </button>

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="grid grid-cols-1 md:grid-cols-2 gap-4"
//       >
//         <div className="flex px-6 mb-2 justify-center">
//           <div className="relative">
//             <img
//               src={previewImage || defaultAvatar || undefined}
//               alt="Profile Avatar"
//               className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-md "
//             />
//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full p-2 cursor-pointer transition-colors duration-200 shadow-md"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="w-5 h-5"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
//                 <circle cx="12" cy="13" r="4"></circle>
//               </svg>
//             </button>
//             <input
//               type="file"
//               id="image"
//               accept="image/*"
//               className="hidden"
//               onChange={handleImageChange}
//               ref={fileInputRef}
//             />
//           </div>
//         </div>
//         <h2 className="text-3xl font-bold mt-5 text-center text-gray-800">
//           Student Profile Registration
//         </h2>
//         {/* Personal Information */}
//         <div className="space-y-1">
//           <Label htmlFor="fname" className="text-sm font-medium">
//             First Name*
//           </Label>
//           <input
//             id="fname"
//             placeholder="First Name"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.fname ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("fname")}
//           />
//           {errors.fname && (
//             <p className="text-red-500 text-xs mt-1">{errors.fname.message}</p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="lname" className="text-sm font-medium">
//             Last Name
//           </Label>
//           <input
//             id="lname"
//             placeholder="Last Name"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.lname ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("lname")}
//           />
//           {errors.lname && (
//             <p className="text-red-500 text-xs mt-1">{errors.lname.message}</p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="gender" className="text-sm font-medium">
//             Gender*
//           </Label>
//           <Select
//             onValueChange={(value) => {
//               if (allowedGenders.includes(value as any)) {
//                 setValue("gender", value as "Male" | "Female" | "Other", {
//                   shouldValidate: true,
//                 });
//               } else {
//                 setValue("gender", null, { shouldValidate: true });
//               }
//             }}
//           >
//             <SelectTrigger
//               id="gender"
//               className={`w-full ${errors.gender ? "border-red-500" : ""}`}
//             >
//               <SelectValue placeholder="Select Gender" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Male">Male</SelectItem>
//               <SelectItem value="Female">Female</SelectItem>
//               <SelectItem value="Other">Other</SelectItem>
//             </SelectContent>
//           </Select>
//           {/* {errors.gender && (
//           <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
//         )} */}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="birth_date" className="text-sm font-medium">
//             Birth Date*
//           </Label>
//           <input
//             id="birth_date"
//             type="date"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.birth_date ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("birth_date")}
//           />
//           {errors.birth_date && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.birth_date.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="email" className="text-sm font-medium">
//             Email*
//           </Label>
//           <input
//             id="email"
//             type="email"
//             placeholder="Email"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.email ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("email")}
//           />
//           {errors.email && (
//             <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="mobile" className="text-sm font-medium">
//             Mobile Number*
//           </Label>
//           {/* <PhoneInput
//             country={"in"}
//             value={watch("mobile")}
//             onChange={(phone) => {
//               setValue("mobile", phone, { shouldValidate: true });
//             }}
//             inputProps={{
//               id: "mobile",
//               name: "mobile",
//               required: true,
//             }}
//             inputStyle={{ 
//               width: "100%", 
//               height: "40px",
//               borderColor: errors.mobile ? "red" : ""
//             }}
//             buttonStyle={{ background: "#f1f5f9" }}
//           /> */}
//           <input
//             id="mobile"
//             type="tel"
//             placeholder="Mobile Number"
//             maxLength={10}
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.mobile ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("mobile")}
//           />
//           {errors.mobile && (
//             <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>
//           )}
//         </div>

//         {/* School Information */}
//         <div className="md:col-span-2 mt-4 mb-2">
//           <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
//             School Information
//           </h3>
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="school_name" className="text-sm font-medium">
//             School Name
//           </Label>
//           <input
//             id="school_name"
//             placeholder="School Name"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.school_name ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("school_name")}
//           />
//           {errors.school_name && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.school_name.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="school_class" className="text-sm font-medium">
//             Class/Grade
//           </Label>

//           <div className="space-y-1">
//             {/* <Label htmlFor="school_class" className="text-sm font-medium">
//               Class/Grade
//             </Label> */}
//             <Select
//               onValueChange={(value) =>
//                 setValue("school_class", value, { shouldValidate: true })
//               }
//               value={watch("school_class")}
//             >
//               <SelectTrigger id="school_class" className="w-full">
//                 <SelectValue placeholder="Select Class/Grade" />
//               </SelectTrigger>
//               <SelectContent className="max-h-60">
//                 {getAllClasses().map((className) => (
//                   <SelectItem key={className} value={className}>
//                     {className}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Parent Information */}
//         <div className="md:col-span-2 mt-4 mb-2">
//           <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
//             Parents/Guardian Information
//           </h3>
//         </div>

//         {/* Father's Information */}
//         <div className="space-y-1">
//           <Label htmlFor="fa_name" className="text-sm font-medium">
//             Parents/Guardian Name
//           </Label>
//           <input
//             id="fa_name"
//             placeholder="Enter Name"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.fa_name ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("fa_name")}
//           />
//           {errors.fa_name && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.fa_name.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="fa_mobile" className="text-sm font-medium">
//             Parents/Guardian Mobile
//           </Label>
//           <input
//             id="fa_mobile"
//             placeholder="Enter Mobile"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.fa_mobile ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("fa_mobile")}
//           />
//           {errors.fa_mobile && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.fa_mobile.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="fa_email" className="text-sm font-medium">
//             Parents/Guardian Email
//           </Label>
//           <input
//             id="fa_email"
//             type="email"
//             placeholder="Enter Email"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.fa_email ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("fa_email")}
//           />
//           {errors.fa_email && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.fa_email.message}
//             </p>
//           )}
//         </div>

//         {/* Address Information */}
//         <div className="md:col-span-2 mt-4 mb-2">
//           <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
//             Address Information
//           </h3>
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="country" className="text-sm font-medium">
//             Country
//           </Label>
//           <Select
//             onValueChange={(value) => {
//               setValue("country", value, { shouldValidate: true });
//               setSelectedCountry(value);
//             }}
//             value={watch("country") || selectedCountry}
//           >
//             <SelectTrigger id="country" className="w-full">
//               <SelectValue placeholder="Select Country" />
//             </SelectTrigger>
//             <SelectContent className="max-h-60">
//               {countries.map((country: any) => (
//                 <SelectItem key={country.iso2} value={country.iso2}>
//                   {country.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="state" className="text-sm font-medium">
//             State/Province
//           </Label>
//           <Select
//             onValueChange={(value) => {
//               setValue("state", value, { shouldValidate: true });
//               setSelectedState(value);
//             }}
//             disabled={!selectedCountry || loadingStates}
//             value={watch("state") || selectedState}
//           >
//             <SelectTrigger id="state" className="w-full">
//               <SelectValue
//                 placeholder={
//                   loadingStates
//                     ? "Loading states..."
//                     : !selectedCountry
//                     ? "Select country first"
//                     : states.length === 0
//                     ? "No states available"
//                     : "Select State"
//                 }
//               />
//             </SelectTrigger>
//             <SelectContent className="max-h-60">
//               {states.map((state: any) => (
//                 <SelectItem key={state.iso2} value={state.iso2}>
//                   {state.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="city" className="text-sm font-medium">
//             City
//           </Label>
//           <Select
//             onValueChange={(value) =>
//               setValue("city", value, { shouldValidate: true })
//             }
//             disabled={!selectedState || loadingCities}
//             value={watch("city")}
//           >
//             <SelectTrigger id="city" className="w-full">
//               <SelectValue
//                 placeholder={
//                   loadingCities
//                     ? "Loading cities..."
//                     : !selectedState
//                     ? "Select state first"
//                     : cities.length === 0
//                     ? "No cities available"
//                     : "Select City"
//                 }
//               />
//             </SelectTrigger>
//             <SelectContent className="max-h-60">
//               {cities.map((city: any) => (
//                 <SelectItem key={city.id} value={city.name}>
//                   {city.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="address" className="text-sm font-medium">
//             Address
//           </Label>
//           <input
//             id="address"
//             placeholder="Street address"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.address ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("address")}
//           />
//           {errors.address && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.address.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="pincode" className="text-sm font-medium">
//             Pincode/ZIP
//           </Label>
//           <input
//             id="pincode"
//             placeholder="Pincode/ZIP"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.pincode ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("pincode")}
//           />
//           {errors.pincode && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.pincode.message}
//             </p>
//           )}
//         </div>

//         {/* Account Security */}
//         <div className="md:col-span-2 mt-4 mb-2">
//           <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
//             Account Security
//           </h3>
//         </div>

//         <div className="space-y-1 md:col-span-2">
//           <Label htmlFor="password" className="text-sm font-medium">
//             Password*
//           </Label>
//           <input
//             id="password"
//             type="password"
//             placeholder="Enter new password"
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.password ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("password")}
//           />
//           {/* <ul className="text-xs mt-1 space-y-0.5">
//     <li className={minLength ? "text-green-600" : "text-red-600"}>
//       {minLength ? "✓" : "✗"} At least 6 characters
//     </li>
//     <li className={hasNumber ? "text-green-600" : "text-red-600"}>
//       {hasNumber ? "✓" : "✗"} Minimum 1 number
//     </li>
//     <li className={hasLower ? "text-green-600" : "text-red-600"}>
//       {hasLower ? "✓" : "✗"} Minimum 1 lowercase letter
//     </li>
//     <li className={hasUpper ? "text-green-600" : "text-red-600"}>
//       {hasUpper ? "✓" : "✗"} Minimum 1 uppercase letter
//     </li>
//   </ul> */}
//           {errors.password && (
//             <div className="text-xs text-red-600 mt-1">
//               Password must be at least 6 characters <br />
//               Password must Include 1 number <br />
//               Password must Include 1 lowercase <br />
//               Password must Include 1 uppercase letter.
//             </div>
//           )}
//         </div>

//         {/* Submit Button */}
//         <div className="md:col-span-2 mt-6 flex justify-center">
//           <Button
//             type="submit"
//             className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors w-full md:w-auto"
//             disabled={isSubmitting || isPending}
//           >
//             {isSubmitting || isPending ? "Submitting..." : "Create Profile"}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default SingleUserForm;
