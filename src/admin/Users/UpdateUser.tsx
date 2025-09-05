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
import { ArrowLeft, Camera } from "lucide-react";
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
  const router = useRouter();
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
  const [previewImage, setPreviewImage] = useState<string>(
    "/assets/default-avatar.png"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOthersSelected = selectedClass?.startsWith("Others");
  const cleanedClass = isOthersSelected ? "Others" : null;

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const {
    data,
    isLoading: categorydata_loading,
    refetch,
  } = useOthersCategory(cleanedClass);

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

    formState: { isSubmitting, errors },
  } = useForm<UserData>({
    defaultValues: {
      country: "IN",
      state: "",
      city: "",
      mobile: "",
    },
    mode: "onChange",
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id || ""),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  useEffect(() => {
    if (userData && countries.length > 0) {
      const formatBirthDate = (dateString: Date | string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
      };

      const schoolClass = userData.school_class || "";
      const resetData: UserData = {
        ...userData,
        birth_date: formatBirthDate(userData.birth_date || ""),
        country: userData.country || "IN",
        state: userData.state || "",
        city: userData.city || "",
        gender: userData.gender || "",
        school_class: schoolClass,
      };

      reset(resetData);

      setSelectedClass(schoolClass);
      if (userData.country) setSelectedCountry(userData.country);
      if (userData.state) setSelectedState(userData.state);

      if (typeof userData?.image === "string" && userData.image) {
        const fullImageUrl = userData.image.startsWith("http")
          ? userData.image
          : `${ImgUrl}/${userData.image}`;
        setPreviewImage(fullImageUrl);
      }
    }
  }, [userData, countries, reset]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error("Failed to load countries:", error);
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
        const sortedStates = data.sort((a: State, b: State) =>
          a.name.localeCompare(b.name)
        );
        setStates(sortedStates);
      } catch (error) {
        console.error("Failed to load states:", error);
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
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [selectedState, selectedCountry]);

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
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
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
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "image" && value instanceof File) {
        formData.append("image", value);
      } else if (value instanceof File) {
        // to handle other potential file inputs if any
      } else {
        formData.append(key, String(value));
      }
    });

    if (selectedCategory) formData.append("cat_id", selectedCategory.toString());
    if (selectedCategoryName)
      formData.append("category_name", selectedCategoryName);

    mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center mb-6">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={router.back}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Users</span>
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Update User Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Edit the information below to update the user's details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Personal and Contact Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Personal & Contact Information
            </h2>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors"
                >
                  <Camera size={16} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fname">First Name</Label>
                <input
                  id="fname"
                  placeholder="First Name"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  {...register("fname")}
                />
              </div>
              <div>
                <Label htmlFor="lname">Last Name</Label>
                <input
                  id="lname"
                  placeholder="Last Name"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  {...register("lname")}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  onValueChange={(value) => setValue("gender", value)}
                  value={watch("gender")}
                >
                  <SelectTrigger id="gender" className="w-full mt-1 text-sm">
                    <SelectValue
                      placeholder="Select Gender"
                      className="text-sm"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="text-sm">
                      Male
                    </SelectItem>
                    <SelectItem value="Female" className="text-sm">
                      Female
                    </SelectItem>
                    <SelectItem value="Other" className="text-sm">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birth_date">Birth Date*</Label>
                <input
                  id="birth_date"
                  type="date"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  {...register("birth_date", {
                    required: "Birth Date is required",
                  })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  {...register("email")}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number*</Label>
                <input
                  id="mobile"
                  type="tel"
                  maxLength={10}
                  placeholder="Mobile Number"
                  className={`w-full mt-1 px-3 py-2 border rounded-md text-sm ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("mobile", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Mobile number must be 10 digits",
                    },
                  })}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.mobile.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: School Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              School Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="school_name">School Name</Label>
                <input
                  id="school_name"
                  placeholder="School Name"
                  className="w-full mt-1 px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
                  {...register("school_name")}
                />
              </div>
              <div>
                <Label htmlFor="school_class">Class/Grade</Label>
                <Select
                  value={selectedClass}
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setValue("school_class", value);
                  }}
                >
                  <SelectTrigger id="school_class" className="w-full mt-1 text-sm">
                    <SelectValue
                      placeholder="Select Class/Grade"
                      className="text-sm"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllClasses().map((className) => (
                      <SelectItem
                        key={className}
                        value={className}
                        className="text-sm"
                      >
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isOthersSelected && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                    <h3 className="font-semibold text-sm mb-2 text-gray-600">
                      Select a Category for 'Others':
                    </h3>
                    {categorydata_loading ? (
                      <p className="text-xs">Loading categories...</p>
                    ) : (
                      <div className="text-sm text-gray-700 space-y-2">
                        {data?.map((item: CategoryMasterData) => (
                          <label
                            key={item.cat_id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="others_category"
                              checked={selectedCategory === item.cat_id}
                              value={item.cat_id}
                              onChange={() => {
                                setSelectedCategory(item.cat_id);
                                setSelectedCategoryName(item.category_name);
                              }}
                              className="accent-blue-600"
                            />
                            <span>{item.category_name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isOthersSelected && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Parent/Guardian Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="fa_name">Parent/Guardian Name</Label>
                  <input
                    id="fa_name"
                    placeholder="Enter Name"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                    {...register("fa_name")}
                  />
                </div>
                <div>
                  <Label htmlFor="fa_mobile">Parent/Guardian Mobile</Label>
                  <input
                    id="fa_mobile"
                    type="tel"
                    maxLength={10}
                    placeholder="Enter Mobile"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                    {...register("fa_mobile")}
                  />
                </div>
                <div>
                  <Label htmlFor="fa_email">Parent/Guardian Email</Label>
                  <input
                    id="fa_email"
                    type="email"
                    placeholder="Enter Email"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                    {...register("fa_email")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Address Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <input
                  id="address"
                  placeholder="Street address"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  {...register("address")}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  onValueChange={(value) => {
                    setValue("country", value);
                    setSelectedCountry(value);
                  }}
                  value={watch("country")}
                >
                  <SelectTrigger id="country" className="w-full mt-1 text-sm">
                    <SelectValue
                      placeholder="Select Country"
                      className="text-sm"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem
                        key={country.iso2}
                        value={country.iso2}
                        className="text-sm"
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Select
                  onValueChange={(value) => {
                    setValue("state", value);
                    setSelectedState(value);
                  }}
                  disabled={!selectedCountry || loadingStates}
                  value={watch("state")}
                >
                  <SelectTrigger id="state" className="w-full mt-1 text-sm">
                    <SelectValue
                      placeholder={
                        loadingStates ? "Loading..." : "Select State"
                      }
                      className="text-sm"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem
                        key={state.iso2}
                        value={state.iso2}
                        className="text-sm"
                      >
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Select
                  onValueChange={(value) => setValue("city", value)}
                  disabled={!selectedState || loadingCities}
                  value={watch("city")}
                >
                  <SelectTrigger id="city" className="w-full mt-1 text-sm">
                    <SelectValue
                      placeholder={loadingCities ? "Loading..." : "Select City"}
                      className="text-sm"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem
                        key={city.id}
                        value={city.name}
                        className="text-sm"
                      >
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pincode">Pincode/ZIP</Label>
                <input
                  id="pincode"
                  placeholder="Pincode/ZIP"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  {...register("pincode")}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Account Security */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Account Security
            </h2>
            <div>
              <Label htmlFor="password">
                New Password (leave blank to keep current)
              </Label>
              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                {...register("password")}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/users/view")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || isPending}
            >
              {isSubmitting || isPending ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateUser;