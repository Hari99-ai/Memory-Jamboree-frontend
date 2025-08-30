/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
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
// import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  getCountries,
  getCities,
  getStates,
  getAllClasses,
} from "../../lib/select";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getUser, updateUser } from "../../lib/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "../../hooks/useRouter";
import { useOthersCategory } from "../../hooks/useOthersCategory";
import { ImgUrl } from "../../lib/client";
import { CategoryMasterData } from "../../types";

type Country = {
  name: string;
  iso2: string;
};

type City = {
  id: string | number;
  name: string;
};

type State = {
  iso2: string;
  name: string;
};

type UserData = {
  fname?: string;
  lname?: string;
  gender?: string;
  birth_date?: Date | string;
  email?: string;
  mobile?: string;
  fa_name?: string;
  fa_mobile?: string;
  fa_email?: string;
  mo_name?: string;
  mo_mobile?: string;
  mo_email?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  school_name?: string;
  school_class?: string;
  password?: string;
  image?: string | File | null;
};

export function UpdateUser() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("/assets/default-avatar.png");
  const fileInputRef = useRef<HTMLInputElement>(null);


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
    watch,
    reset,

    formState: { isSubmitting , errors},
  } = useForm<UserData>({
    defaultValues: {
      country: "IN",
      state: "",
      city: "",
      mobile: "",
    },
    mode: "onChange",

  });

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id || ""),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  // Initialize form after both userData and countries are loaded
  useEffect(() => {
    if (userData && countries.length > 0) {
      const formatBirthDate = (dateString: Date | string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      };

      const resetData: UserData = {
        ...userData,
        birth_date: formatBirthDate(userData.birth_date || ''),
        country: userData.country || 'IN',
        state: userData.state || '',
        city: userData.city || '',
        gender: userData.gender || '',
        school_class: userData.school_class || ''
      };

      reset(resetData);

      if (userData.country) {
        setSelectedCountry(userData.country);
      }
      if (userData.state) {
        setSelectedState(userData.state);
      }
      if (userData.image && typeof userData.image === 'string') {
        setPreviewImage(userData.image);
      }
       if (typeof userData?.image === "string" && userData.image) {
        const fullImageUrl = userData.image.startsWith("http")
          ? userData.image
          : `${ImgUrl}/${userData.image}`;
        setPreviewImage(fullImageUrl);
      }
    }
  }, [userData, countries, reset]);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error("Failed to load countries:", error);
        // toast.error("Failed to load countries");
      }
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountry) return;

    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data = await getStates(selectedCountry);
        // Sort states alphabetically by name
        const sortedStates = data.sort((a: State, b: State) => a.name.localeCompare(b.name));
        setStates(sortedStates);
        
        if (userData?.state && data.some((s: State) => s.iso2 === userData.state)) {
          setSelectedState(userData.state);
          setValue("state", userData.state);
        }
      } catch (error) {
        console.error("Failed to load states:", error);
        // toast.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, [selectedCountry, userData?.state, setValue]);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedCountry || !selectedState) return;

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const data = await getCities(selectedCountry, selectedState);
        setCities(data);
        
        if (userData?.city && data.some((c: City) => c.name === userData.city)) {
          setValue("city", userData.city);
        }
      } catch (error) {
        console.error("Failed to load cities:", error);
        // toast.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [selectedState, selectedCountry, userData?.city, setValue]);

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
    mutationKey: ["update-user"],
    mutationFn: (formData: FormData) => updateUser(id || "", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("User updated successfully");
      navigate("/admin/users/view");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Update failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (values: UserData) => {
    if (!id) {
      toast.error("User ID is missing. Cannot update.");
      return;
    }

    try {
      const formData = new FormData();
      
      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined) return;
        
        if (value instanceof File) {
          formData.append(key, value);
        }
        if (key === "image") {
          if (value instanceof File) {
            formData.append("image", value);
          }
          return;
        } 
        else if (key === 'birth_date' && typeof value === 'string' && value) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            const formattedDate = date.toISOString().split('T')[0];
            formData.append(key, formattedDate);
          }
        } 
        else if (typeof value === 'string' && value === '') {
          formData.append(key, value);
        }
        else if (value !== null) {
          formData.append(key, String(value));
        }
        
        if(selectedCategory) formData.append('cat_id' , selectedCategory.toString())
        if(selectedCategoryName) formData.append("category_name" , selectedCategoryName)
      });

      await mutate(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl min-h-screen mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
      <button
        className="mb-4 px-4 py-2 text-blue-500 rounded-md flex items-center gap-2 hover:text-blue-700"
        onClick={router.back}
      >
        <ArrowLeft size={16} />
        <span className="hover:underline">Back</span>
      </button>
      <h2 className="text-3xl font-bold mt-5 text-center text-gray-800">
        Update User Profile
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Update any fields you wish to change
      </p>

      <div className="flex px-6 mb-2 justify-center">
        <div className="relative">
          <img
            src={previewImage}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-md"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full p-2 cursor-pointer transition-colors duration-200 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </button>
          <input
            type="file"
            id="image"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Personal Information */}
        <div className="space-y-1">
          <Label htmlFor="fname" className="text-sm font-medium">
            First Name
          </Label>
          <input
            id="fname"
            placeholder="First Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register("fname")}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="lname" className="text-sm font-medium">
            Last Name
          </Label>
          <input
            id="lname"
            placeholder="Last Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register("lname")}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="gender" className="text-sm font-medium">
            Gender
          </Label>
          <Select
            onValueChange={(value) => setValue("gender", value)}
            value={watch("gender")}
          >
            <SelectTrigger id="gender" className="w-full">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="birth_date" className="text-sm font-medium">
            Birth Date*
          </Label>
          <input
            id="birth_date"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register("birth_date" , {
              required: "Birth Date is required"
            })}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <input
            id="email"
            type="email"

            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register("email")}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="mobile" className="text-sm font-medium">
            Mobile Number*
          </Label>
          <input
            id="mobile"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            placeholder="Mobile Number"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); // remove all non-digits
            }}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.mobile ? "border-red-500" : "border-gray-300"
            }`}
            {...register("mobile", {
              required: "Mobile number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Mobile number must be exactly 10 digits",
              },
            })}
          />
          {errors.mobile && (
            <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>
          )}
        </div>

        {/* Parent Information */}
        <div className="md:col-span-2 mt-4 mb-2">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Parent Information
          </h3>
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
            placeholder="School Name"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.school_name ? "border-red-500" : "border-gray-300"
            }`}
            {...register("school_name")}
          />
          {errors.school_name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.school_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="school_class" className="text-sm font-medium">
            Class/Grade
          </Label>
          <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setValue("school_class", value);
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


              {isOthersSelected && (
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
        

        {/* Father's Information */}
        <div className="md:col-span-2 mt-4 mb-2">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Parents/Guardian Information
          </h3>
        </div>

        {/* Father's Information */}
        <div className="space-y-1">
          <Label htmlFor="fa_name" className="text-sm font-medium">
            Parents/Guardian Name
          </Label>
          <input
            id="fa_name"
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
            type="tel"
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter Mobile"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); // remove all non-digits
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            {...register("fa_mobile")}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="fa_email" className="text-sm font-medium">
            Parents/Guardian Email
          </Label>
          <input
            id="fa_email"
            type="email"
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

        {/* Address Information */}
        <div className="md:col-span-2 mt-4 mb-2">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Address Information
          </h3>
        </div>

        <div className="space-y-1">
          <Label htmlFor="country" className="text-sm font-medium">
            Country
          </Label>
          <Select
            onValueChange={(value) => {
              setValue("country", value);
              setSelectedCountry(value);
            }}
            value={watch("country") || selectedCountry}
          >
            <SelectTrigger id="country" className="w-full">
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
            State/Province
          </Label>
          <Select
            onValueChange={(value) => {
              setValue("state", value);
              setSelectedState(value);
            }}
            disabled={!selectedCountry || loadingStates}
            value={watch("state") || selectedState}
          >
            <SelectTrigger id="state" className="w-full">
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
            City
          </Label>
          <Select
            onValueChange={(value) => setValue("city", value)}
            disabled={!selectedState || loadingCities}
            value={watch("city")}
          >
            <SelectTrigger id="city" className="w-full">
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
            placeholder="Street address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register("address")}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pincode" className="text-sm font-medium">
            Pincode/ZIP
          </Label>
          <input
            id="pincode"
            placeholder="Pincode/ZIP"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            pattern="[0-9]*"
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/\D/g, '').slice(0, 6);
              }}
            {...register("pincode")}
          />
        </div>
        

        {/* Account Security */}
        <div className="md:col-span-2 mt-4 mb-2">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Account Security
          </h3>
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="password" className="text-sm font-medium">
            New Password (leave blank to keep current)
          </Label>
          <input
            id="password"
            type="password"
            placeholder="Enter new password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register("password")}
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 mt-6 flex justify-center gap-4">
          <Button
            type="button"
            className="px-8 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            onClick={() => navigate("/admin/users/view")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default UpdateUser;