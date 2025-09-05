/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
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
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { X, ArrowLeft } from "lucide-react";
import {
  getCountries,
  getCities,
  getStates,
  getAllClasses,
} from "../../../lib/select";
import { CreateUser } from "../../../lib/api";
import { useOthersCategory } from "../../../hooks/useOthersCategory";
import { CategoryMasterData } from "../../../types";

// Schema for individual user
const userSchema = z.object({
  fname: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lname: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({
      message: "Invalid gender value. Must be 'Male', 'Female', or 'Other'",
    }),
  }),
  birth_date: z.string().min(1, { message: "Birth date is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  mobile: z
    .string()
    .min(10, { message: "Valid 10-digit phone number is required." }),
  fa_name: z.string().optional(),
  fa_mobile: z.string().optional(),
  fa_email: z
    .string()
    .email({ message: "Invalid father's email address." })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
});

// Schema for the form with common school info
const formSchema = z.object({
  school_name: z.string().min(1, { message: "School name is required" }),
  school_class: z.string().min(1, { message: "Class is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  state: z.string().min(1, { message: "State is required" }),
  city: z.string().min(1, { message: "City is required" }),
});

type UserData = z.infer<typeof userSchema>;
type FormData = z.infer<typeof formSchema>;

function ManyUserForm() {
const [countries, setCountries] = useState<any[]>([]);
const [states, setStates] = useState<any[]>([]);
const [cities, setCities] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [activeTab, setActiveTab] = useState<"school" | "addUser">("school");
  const [addedUsers, setAddedUsers] = useState<UserData[]>([]);
  const [passwordValid, setPasswordValid] = useState(true);
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(
    null
  );
  const [today, setToday] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isOthersSelected = selectedClass?.startsWith("Others");
  const cleanedClass = isOthersSelected ? "Others" : null;

  const [, setSelectedCategoryName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const {
    data,
    isLoading: categorydata_loading,
    refetch,
  } = useOthersCategory(cleanedClass);

  // Set today's date in YYYY-MM-DD format for the date input's max attribute
  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (isOthersSelected) {
      refetch();
    }
  }, [isOthersSelected, refetch]);

  const {
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school_name: "",
      school_class: "",
      country: "IN",
      state: "",
      city: "",
    },
    mode: "onChange",
  });

  const checkPassword = (password: string) => {
    return (
      password.length >= 6 &&
      /[0-9]/.test(password) &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password)
    );
  };

  const formValues = watch();

  const [currentUser, setCurrentUser] = useState<Partial<UserData>>({
    gender: "Male",
  });

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
        // Sort countries alphabetically by name
        const sortedData = [...data].sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(sortedData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load countries");
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (!formValues.country) return;

    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data = await getStates(formValues.country);
        // Sort states alphabetically by name
        const sortedData = [...data].sort((a: any, b: any) => a.name.localeCompare(b.name));
        setStates(sortedData);
        setValue("state", "");
        setValue("city", "");
        setCities([]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, [formValues.country, setValue]);

  useEffect(() => {
    if (!formValues.country || !formValues.state) return;

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const data = await getCities(formValues.country, formValues.state);
        // Sort cities alphabetically by name
        const sortedData = [...data].sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCities(sortedData);
        setValue("city", "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [formValues.country, formValues.state, setValue]);

  const handleAddUser = () => {
    try {
      if (
        !currentUser.fname ||
        !currentUser.email ||
        !currentUser.birth_date ||
        !currentUser.gender ||
        !currentUser.mobile ||
        !currentUser.password
      ) {
        throw new Error(
          "Please fill all required fields (Name, Email, Birth Date, Gender, Mobile, and Password)"
        );
      }
      if (!passwordValid) {
        toast.error("Please enter a valid password that meets all criteria.");
        return;
      }
      if (!/^\d{10}$/.test(currentUser.mobile)) {
        throw new Error("Mobile number must be 10 digits");
      }

      const newUser: UserData = {
        fname: currentUser.fname || "",
        lname: currentUser.lname || "",
        email: currentUser.email || "",
        birth_date: currentUser.birth_date || "",
        gender: currentUser.gender || "Male",
        mobile: currentUser.mobile || "",
        fa_name: currentUser.fa_name || "",
        fa_mobile: currentUser.fa_mobile || "",
        fa_email: currentUser.fa_email || "",
        password: currentUser.password,
        address: currentUser.address || "",
        pincode: currentUser.pincode || "",
      };

      setAddedUsers((prev) => [...prev, newUser]);
      setCurrentUser({ gender: "Male" });
      toast.success("Student added successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeUser = (index: number) => {
    setAddedUsers((prev) => prev.filter((_, i) => i !== index));
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["admin-many-users-create"],
    mutationFn: async (users: UserData[]) => {
      const results = [];
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        setCurrentlyProcessing(`${user.fname} ${user.lname || ""}`);
        try {
          const userFormData = new FormData();
          Object.entries(formValues).forEach(([key, value]) => {
            if (value) userFormData.append(key, String(value));
          });
          Object.entries(user).forEach(([key, value]) => {
            if (value) {
              if (key === "birth_date") {
                const date = new Date(value);
                userFormData.append(key, date.toISOString().split("T")[0]);
              } else {
                userFormData.append(key, String(value));
              }
            }
          });
          const result = await CreateUser(userFormData);
          results.push({ success: true, user, result });
          toast.success(
            `Student ${user.fname} ${user.lname || ""} registered successfully`
          );
          if (i < users.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          results.push({ success: false, user, error });
          const errorMsg =
            error.response?.data?.message ||
            `Failed to register ${user.fname}`;
          toast.error(errorMsg);
        }
      }
      return { results };
    },
    onSuccess: ({ results }) => {
      setCurrentlyProcessing(null);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      const failedUsers = results
        .filter((result) => !result.success)
        .map((result) => result.user);

      if (failedUsers.length === 0) {
        reset();
        setAddedUsers([]);
        navigate("/admin/users/view");
      } else {
        setAddedUsers(failedUsers);
      }
    },
    onError: (error: any) => {
      setCurrentlyProcessing(null);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred during registration.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async () => {
    if (addedUsers.length === 0) {
      toast.error("Please add at least one student");
      return;
    }
    const updatedUsers = addedUsers.map((user) => ({ ...user, ...formValues }));
    mutate(updatedUsers);
  };

  const handleDateChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const enteredDateValue = e.target.value;
    if (!enteredDateValue) return;

    const enteredDate = new Date(enteredDateValue);
    const todayDate = new Date(today);

    if (enteredDate > todayDate) {
      toast.error("Birth date cannot be in the future.");
      setCurrentUser({ ...currentUser, birth_date: "" });
    }
  };

  const inputStyles = `w-full px-3 py-2 text-sm border rounded-md transition-colors bg-transparent border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`;

  return (
    <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8">
      <div className="max-w-6xl p-6 mx-auto bg-white rounded-xl shadow-lg md:p-8">
        <button
          className="flex items-center gap-2 mb-6 text-sm transition-colors duration-200 text-slate-600 hover:text-blue-600"
          onClick={() => navigate("/admin/users/add")}
        >
          <ArrowLeft size={16} />
          <span className="hover:underline">Back to Add User Options</span>
        </button>

        <h2 className="mb-8 text-3xl font-bold tracking-tight text-center text-slate-800">
          Multiple Student Registration
        </h2>

        <div className="flex mb-8 border-b border-slate-200">
          <button
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "school"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("school")}
          >
            1. School Information
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "addUser"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            } disabled:cursor-not-allowed disabled:text-slate-400`}
            onClick={() => setActiveTab("addUser")}
            disabled={!formValues.school_name || !formValues.school_class}
          >
            2. Add Students
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {activeTab === "school" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <h3 className="pb-2 mb-4 text-lg font-semibold border-b text-slate-700 border-slate-200">
                  Common School Information
                </h3>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="school_name"
                  className="text-sm font-medium text-slate-700"
                >
                  School Name*
                </Label>
                <input
                  id="school_name"
                  placeholder="Enter school name"
                  className={`${inputStyles} ${
                    errors.school_name ? "border-red-500" : ""
                  }`}
                  {...register("school_name")}
                />
                {errors.school_name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.school_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="school_class"
                  className="text-sm font-medium text-slate-700"
                >
                  Class/Grade*
                </Label>
                <Select
                  value={selectedClass}
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setValue("school_class", value);
                  }}
                >
                  <SelectTrigger
                    id="school_class"
                    className="w-full text-sm border-slate-300 text-slate-700 focus:ring-blue-500"
                  >
                    <SelectValue placeholder="Select Class/Grade" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
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
                  <div className="pt-3">
                    <h3 className="mb-2 text-sm font-semibold">
                      Others Categories (Select One):
                    </h3>
                    {categorydata_loading ? (
                      <p className="text-xs">Loading categories...</p>
                    ) : (
                      <div className="space-y-1 text-sm text-gray-700">
                        {data?.map((item: CategoryMasterData) => (
                          <label
                            key={item.cat_id}
                            className="flex items-center space-x-2"
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

              <div className="pt-4 mt-4 mb-2 border-t md:col-span-2 border-slate-200">
                <h3 className="pb-2 text-lg font-semibold text-slate-700">
                  Location Information
                </h3>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-slate-700"
                >
                  Country*
                </Label>
                <Select
                  onValueChange={(value) => setValue("country", value)}
                  value={formValues.country}
                >
                  <SelectTrigger
                    id="country"
                    className="w-full text-sm border-slate-300 text-slate-700 focus:ring-blue-500"
                  >
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((country: any) => (
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
                {errors.country && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="state"
                  className="text-sm font-medium text-slate-700"
                >
                  State/Province*
                </Label>
                <Select
                  onValueChange={(value) => setValue("state", value)}
                  disabled={!formValues.country || loadingStates}
                  value={formValues.state}
                >
                  <SelectTrigger
                    id="state"
                    className="w-full text-sm border-slate-300 text-slate-700 focus:ring-blue-500 disabled:bg-slate-50"
                  >
                    <SelectValue
                      placeholder={
                        loadingStates ? "Loading states..." : "Select State"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {states.map((state: any) => (
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
                {errors.state && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-slate-700"
                >
                  City*
                </Label>
                <Select
                  onValueChange={(value) => setValue("city", value)}
                  disabled={!formValues.state || loadingCities}
                  value={formValues.city}
                >
                  <SelectTrigger
                    id="city"
                    className="w-full text-sm border-slate-300 text-slate-700 focus:ring-blue-500 disabled:bg-slate-50"
                  >
                    <SelectValue
                      placeholder={
                        loadingCities ? "Loading cities..." : "Select City"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cities.map((city: any) => (
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
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-6 md:col-span-2">
                <Button
                  type="button"
                  onClick={() => setActiveTab("addUser")}
                  disabled={
                    !formValues.school_name ||
                    !formValues.school_class ||
                    !formValues.country ||
                    !formValues.state ||
                    !formValues.city
                  }
                  className="w-full bg-blue-600 sm:w-auto hover:bg-blue-700"
                >
                  Next: Add Students
                </Button>
              </div>
            </div>
          )}

          {activeTab === "addUser" && (
            <div>
              <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="fname"
                    className="text-sm font-medium text-slate-700"
                  >
                    First Name*
                  </Label>
                  <input
                    id="fname"
                    placeholder="First Name"
                    value={currentUser.fname || ""}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, fname: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lname"
                    className="text-sm font-medium text-slate-700"
                  >
                    Last Name
                  </Label>
                  <input
                    id="lname"
                    placeholder="Last Name"
                    value={currentUser.lname || ""}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, lname: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium text-slate-700"
                  >
                    Gender*
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setCurrentUser({ ...currentUser, gender: value as any })
                    }
                    value={currentUser.gender || ""}
                  >
                    <SelectTrigger
                      id="gender"
                      className="w-full text-sm border-slate-300 text-slate-700 focus:ring-blue-500"
                    >
                      <SelectValue placeholder="Select Gender" />
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

                <div className="space-y-2">
                  <Label
                    htmlFor="birth_date"
                    className="text-sm font-medium text-slate-700"
                  >
                    Birth Date*
                  </Label>
                  <input
                    id="birth_date"
                    type="date"
                    value={currentUser.birth_date || ""}
                    max={today}
                    onBlur={handleDateChange}
                    // Prevent manual typing
                    onKeyDown={(e) => e.preventDefault()}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        birth_date: e.target.value,
                      })
                    }
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email*
                  </Label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={currentUser.email || ""}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, email: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="mobile"
                    className="text-sm font-medium text-slate-700"
                  >
                    Mobile Number*
                  </Label>
                  <input
                    id="mobile"
                    type="tel"
                    maxLength={10}
                    value={currentUser.mobile || ""}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setCurrentUser({
                          ...currentUser,
                          mobile: e.target.value,
                        });
                      }
                    }}
                    className={inputStyles}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="pt-4 mt-4 mb-2 border-t md:col-span-2 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-700">
                    Parent/Guardian Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fa_name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Parent/Guardian Name
                  </Label>
                  <input
                    id="fa_name"
                    placeholder="Enter Name"
                    value={currentUser.fa_name || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        fa_name: e.target.value,
                      })
                    }
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fa_mobile"
                    className="text-sm font-medium text-slate-700"
                  >
                    Parent/Guardian Mobile
                  </Label>
                  <input
                    id="fa_mobile"
                    placeholder="Enter Mobile"
                    type="tel"
                    maxLength={10}
                    value={currentUser.fa_mobile || ""}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setCurrentUser({
                          ...currentUser,
                          fa_mobile: e.target.value,
                        });
                      }
                    }}
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="fa_email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Parent/Guardian Email
                  </Label>
                  <input
                    id="fa_email"
                    placeholder="Enter Email"
                    type="email"
                    value={currentUser.fa_email || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        fa_email: e.target.value,
                      })
                    }
                    className={inputStyles}
                  />
                </div>

                <div className="pt-4 mt-4 mb-2 border-t md:col-span-2 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-700">
                    Student's Address & Password
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-slate-700"
                  >
                    Address
                  </Label>
                  <input
                    id="address"
                    placeholder="Street address"
                    value={currentUser.address || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        address: e.target.value,
                      })
                    }
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="pincode"
                    className="text-sm font-medium text-slate-700"
                  >
                    Pincode/ZIP
                  </Label>
                  <input
                    id="pincode"
                    type="tel"
                    maxLength={6}
                    placeholder="Pincode/ZIP"
                    value={currentUser.pincode || ""}
                    onChange={(e) => {
                      if (/^\d{0,6}$/.test(e.target.value)) {
                        setCurrentUser({
                          ...currentUser,
                          pincode: e.target.value,
                        });
                      }
                    }}
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password*
                  </Label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={currentUser.password || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCurrentUser({ ...currentUser, password: value });
                      setPasswordValid(checkPassword(value));
                    }}
                    className={inputStyles}
                  />

                  {!passwordValid && currentUser.password && (
                    <div className="p-2 mt-1 text-xs text-red-700 bg-red-100 rounded-md">
                      <li>At least 6 characters</li>
                      <li>At least 1 number (0-9)</li>
                      <li>At least 1 lowercase letter (a-z)</li>
                      <li>At least 1 uppercase letter (A-Z)</li>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  type="button"
                  onClick={handleAddUser}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={
                    !currentUser.fname ||
                    !currentUser.email ||
                    !currentUser.birth_date ||
                    !currentUser.gender ||
                    !currentUser.mobile
                  }
                >
                  Save Student
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("school")}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  Back to School Info
                </Button>
              </div>

              {addedUsers.length > 0 && (
                <div className="mb-8">
                  <h3 className="pb-2 mb-4 text-lg font-semibold border-b text-slate-700 border-slate-200">
                    Added Students ({addedUsers.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {addedUsers.map((user, index) => (
                      <div
                        key={index}
                        className="relative p-4 border rounded-lg bg-slate-50 border-slate-200"
                      >
                        <button
                          type="button"
                          onClick={() => removeUser(index)}
                          className="absolute text-slate-400 top-2 right-2 hover:text-red-600"
                        >
                          <X size={18} />
                        </button>
                        <h4 className="pr-6 font-semibold text-slate-800">
                          {user.fname} {user.lname}
                        </h4>
                        <p className="text-sm truncate text-slate-600">
                          {user.email}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-6 mt-8 border-t border-slate-200">
                <Button
                  type="button"
                  onClick={onSubmit}
                  className="w-full px-8 py-3 text-base font-semibold text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 md:w-auto"
                  disabled={addedUsers.length === 0 || isPending}
                >
                  {isPending && currentlyProcessing
                    ? `Processing ${currentlyProcessing}...`
                    : isPending
                    ? "Submitting..."
                    : `Submit ${addedUsers.length} Students`}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ManyUserForm;