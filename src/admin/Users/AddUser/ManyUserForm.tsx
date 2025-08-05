/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  getCountries,
  getCities,
  getStates,
  getAllClasses,
} from "../../../lib/select";
import { CreateUser } from "../../../lib/api";

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
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [activeTab, setActiveTab] = useState<"school" | "addUser">("school");
  const [addedUsers, setAddedUsers] = useState<UserData[]>([]);
  const [passwordValid, setPasswordValid] = useState(true);
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // Current form values
  const formValues = watch();

  // Current user form (for adding new users)
  const [currentUser, setCurrentUser] = useState<Partial<UserData>>({
    gender: "Male",
    mobile: "",
    address: "",
    pincode: "",
  });

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load countries");
      }
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!formValues.country) return;

    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data = await getStates(formValues.country);
        setStates(data);
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

  // Load cities when state changes
  useEffect(() => {
    if (!formValues.country || !formValues.state) return;

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const data = await getCities(formValues.country, formValues.state);
        setCities(data);
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
      // Validate required fields
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
        toast.error("enter valid password");
        return;
      }

      // Validate mobile number format
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
        password:
          currentUser.password || `Edu${Math.random().toString(36).slice(-8)}`,
        address: currentUser.address || "",
        pincode: currentUser.pincode || "",
      };

      setAddedUsers((prev) => [...prev, newUser]);
      setCurrentUser({
        gender: "Male",
        mobile: "",
        address: "",
        pincode: "",
      });
      toast.success("Student added successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeUser = (index: number) => {
    setAddedUsers((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit users sequentially with enhanced error handling
  const { mutate, isPending } = useMutation({
    mutationKey: ["admin-many-users-create"],
    mutationFn: async (users: UserData[]) => {
      const results = [];
      let successCount = 0;
      let failCount = 0;

      // Submit users one by one sequentially
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        setCurrentlyProcessing(`${user.fname} ${user.lname || ""}`);

        try {
          const userFormData = new FormData();

          // Add common fields from form
          Object.entries(formValues).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              userFormData.append(key, String(value));
            }
          });

          // Add user-specific fields
          Object.entries(user).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              if (key === "birth_date") {
                const date = new Date(value);
                const formattedDate = date.toISOString().split("T")[0];
                userFormData.append(key, formattedDate);
              } else {
                userFormData.append(key, String(value));
              }
            }
          });

          const result = await CreateUser(userFormData);
          results.push({ success: true, user, result });
          successCount++;

          // Show individual success message
          toast.success(`Student ${user.fname} ${user.lname || ""} registered successfully`);

          // Add a small delay between requests to avoid overwhelming the server
          if (i < users.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          results.push({ success: false, user, error });
          failCount++;

          // Enhanced error handling
          let errorMessage = ``;

          // Log the full error for debugging
          console.error(`Error for user ${user.fname}:`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });

          // Check for various error indicators
          const errorData = error.response?.data;
          const errorMsg = errorData?.message || errorData?.error || error.message || '';
          const statusCode = error.response?.status;

          // Check for user already exists scenarios
          if (
            statusCode === 409 ||
            statusCode === 400 ||
            statusCode === 422 ||
            errorMsg.toLowerCase().includes('already') ||
            errorMsg.toLowerCase().includes('exists') ||
            errorMsg.toLowerCase().includes('duplicate') ||
            errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('taken') ||
            errorMsg.toLowerCase().includes('unique constraint') ||
            errorMsg.toLowerCase().includes('violation')
          ) {
            errorMessage += "User already registered (duplicate email or user data)";
          } else if (statusCode === 400) {
            if (errorMsg.toLowerCase().includes('validation')) {
              errorMessage += "Validation failed - check data format";
            } else {
              errorMessage += errorMsg || "Bad request - invalid data format";
            }
          } else if (statusCode === 422) {
            errorMessage += "Invalid data format provided";
          } else if (statusCode >= 500) {
            errorMessage += "Server error - please try again later";
          } else if (statusCode === 401) {
            errorMessage += "Authentication failed - please login again";
          } else if (statusCode === 403) {
            errorMessage += `User ${user.fname} ${user.lname || ""}  already registered`;
          } else {
            // Fallback - try to extract meaningful error message
            if (errorMsg) {
              errorMessage += errorMsg;
            } else {
              errorMessage += "Failed to register user - unknown error";
            }
          }

          toast.error(errorMessage);
        }
      }

      return { results, successCount, failCount };
    },
    onSuccess: (data) => {
      setCurrentlyProcessing(null);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      // Only reset and navigate if all users were successful
      if (data.failCount === 0) {
        reset();
        setAddedUsers([]);
        navigate("/admin/users/view");
      } else {
        // Remove successfully registered users from the list
        const failedUsers = data.results
          .filter(result => !result.success)
          .map(result => result.user);
        setAddedUsers(failedUsers);
      }
    },
    onError: (error: any) => {
      setCurrentlyProcessing(null);
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async () => {
    if (addedUsers.length === 0) {
      toast.error("Please add at least one student");
      return;
    }

    if (!formValues.school_name || !formValues.school_class) {
      toast.error("Please complete school information");
      return;
    }

    // Merge form values into each user
    const updatedUsers = addedUsers.map((user) => ({
      ...user,
      ...formValues,
    }));

    console.log("All form values (watch):", formValues);
    console.log("Submitting users:", updatedUsers);

    // Use the mutation instead of direct axios calls
    mutate(updatedUsers);
  };

  return (
    <div className="max-w-5xl p-4 mx-auto bg-white rounded-lg shadow-lg md:p-8">
      <button
        className="flex items-center gap-2 px-4 py-2 mb-4 text-blue-500 transition-colors duration-200 rounded-md hover:text-blue-700"
        onClick={() => navigate("/admin/users/add")}
      >
        <ArrowLeft size={16} />
        <span className="hover:underline">Back</span>
      </button>

      <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
        Multiple Student Registration
      </h2>

      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "school"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
            }`}
          onClick={() => setActiveTab("school")}
        >
          School Information
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "addUser"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
            }`}
          onClick={() => setActiveTab("addUser")}
          disabled={!formValues.school_name || !formValues.school_class}
        >
          Add Students
        </button>
      </div>

      <form>
        {activeTab === "school" && (
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <h3 className="mb-2 text-lg font-semibold text-gray-700">
                Common School Information
              </h3>
            </div>

            <div className="space-y-1">
              <Label htmlFor="school_name" className="text-sm font-medium">
                School Name*
              </Label>
              <input
                id="school_name"
                placeholder="School Name"
                className={`w-full px-3 py-2 border rounded-md ${errors.school_name ? "border-red-500" : "border-gray-300"
                  }`}
                {...register("school_name")}
              />
              {errors.school_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.school_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="school_class" className="text-sm font-medium">
                Class/Grade*
              </Label>
              <Select
                onValueChange={(value) => setValue("school_class", value)}
                value={formValues.school_class}
              >
                <SelectTrigger id="school_class" className="w-full">
                  <SelectValue placeholder="Select Class/Grade" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {getAllClasses().map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.school_class && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.school_class.message}
                </p>
              )}
            </div>

            <div className="mt-4 mb-2 md:col-span-2">
              <h3 className="pb-2 text-lg font-semibold text-gray-700 border-b">
                Location Information
              </h3>
            </div>

            <div className="space-y-1">
              <Label htmlFor="country" className="text-sm font-medium">
                Country*
              </Label>
              <Select
                onValueChange={(value) => setValue("country", value)}
                value={formValues.country}
              >
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {countries.map((country: any) => (
                    <SelectItem key={country.iso2} value={country.iso2}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="state" className="text-sm font-medium">
                State/Province*
              </Label>
              <Select
                onValueChange={(value) => setValue("state", value)}
                disabled={!formValues.country || loadingStates}
                value={formValues.state}
              >
                <SelectTrigger id="state" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingStates
                        ? "Loading states..."
                        : !formValues.country
                          ? "Select country first"
                          : states.length === 0
                            ? "No states available"
                            : "Select State"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {states.map((state: any) => (
                    <SelectItem key={state.iso2} value={state.iso2}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="city" className="text-sm font-medium">
                City*
              </Label>
              <Select
                onValueChange={(value) => setValue("city", value)}
                disabled={!formValues.state || loadingCities}
                value={formValues.city}
              >
                <SelectTrigger id="city" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingCities
                        ? "Loading cities..."
                        : !formValues.state
                          ? "Select state first"
                          : cities.length === 0
                            ? "No cities available"
                            : "Select City"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {cities.map((city: any) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="mt-4 md:col-span-2">
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
                className="w-full bg-blue-600 md:w-auto hover:bg-blue-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {activeTab === "addUser" && (
          <div>
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="fname" className="text-sm font-medium">
                  First Name*
                </Label>
                <input
                  id="fname"
                  placeholder="First Name"
                  value={currentUser.fname || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, fname: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="lname" className="text-sm font-medium">
                  Last Name
                </Label>
                <input
                  id="lname"
                  placeholder="Last Name"
                  value={currentUser.lname || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, lname: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender*
                </Label>
                <Select
                  onValueChange={(value) =>
                    setCurrentUser({ ...currentUser, gender: value as any })
                  }
                  value={currentUser.gender || ""}
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
                  value={currentUser.birth_date || ""}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      birth_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mobile" className="text-sm font-medium">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="mt-4 mb-2 md:col-span-2">
                <h3 className="pb-2 text-lg font-semibold text-gray-700 border-b">
                  Parent/Guardian Information
                </h3>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fa_name" className="text-sm font-medium">
                  Parent/Guardian Name
                </Label>
                <input
                  id="fa_name"
                  placeholder="Enter Name"
                  value={currentUser.fa_name || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, fa_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fa_mobile" className="text-sm font-medium">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fa_email" className="text-sm font-medium">
                  Parent/Guardian Email
                </Label>
                <input
                  id="fa_email"
                  placeholder="Enter Email"
                  type="email"
                  value={currentUser.fa_email || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, fa_email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mt-4 mb-2 md:col-span-2">
                <h3 className="pb-2 text-lg font-semibold text-gray-700 border-b">
                  Student's Address Information
                </h3>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <input
                  id="address"
                  placeholder="Street address"
                  value={currentUser.address || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pincode" className="text-sm font-medium">
                  Pincode/ZIP
                </Label>
                <input
                  id="pincode"
                  type="tel"
                  maxLength={6}
                  placeholder="Pincode/ZIP"
                  value={currentUser.pincode || ""}
                  onChange={(e) => {
                    // Only allow numeric input and maximum 6 digits
                    if (/^\d{0,6}$/.test(e.target.value)) {
                      setCurrentUser({ ...currentUser, pincode: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {currentUser.pincode && currentUser.pincode.length > 0 && currentUser.pincode.length < 6 && (
                  <p className="mt-1 text-xs text-red-500">
                    Pincode must be 6 digits
                  </p>
                )}
              </div>

              <div className="mt-4 mb-2 md:col-span-2">
                <h3 className="pb-2 text-lg font-semibold text-gray-700 border-b">
                  Set Password
                </h3>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />

                {!passwordValid && (
                  <div className="mt-1 text-xs text-red-600">
                    Password must be at least 6 characters <br />
                    Password must Include 1 number <br />
                    Password must Include 1 lowercase <br />
                    Password must Include 1 uppercase letter.
                  </div>
                )}
              </div>
            </div>


            <div className="flex gap-4 mb-8">
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
              >
                Back to School Info
              </Button>
            </div>

            {/* Added Users Preview */}
            {addedUsers.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">
                  Added Students ({addedUsers.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {addedUsers.map((user, index) => (
                    <div
                      key={index}
                      className="relative p-4 border rounded-lg bg-gray-50"
                    >
                      <button
                        type="button"
                        onClick={() => removeUser(index)}
                        className="absolute text-red-500 top-2 right-2 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                      <h4 className="font-medium text-gray-800">
                        {user.fname} {user.lname}
                      </h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.address && (
                        <p className="mt-1 text-sm text-gray-600">
                          Address: {user.address}
                        </p>
                      )}
                      {user.fa_name && (
                        <p className="mt-1 text-sm text-gray-600">
                          Parent/Guardian: {user.fa_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                type="button"
                onClick={onSubmit}
                className="w-full px-8 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 md:w-auto"
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
  );
}

export default ManyUserForm;