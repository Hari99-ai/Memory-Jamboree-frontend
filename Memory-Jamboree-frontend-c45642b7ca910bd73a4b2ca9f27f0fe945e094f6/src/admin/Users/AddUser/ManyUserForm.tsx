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
import {
  X,
  ArrowLeft,
  School,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Users,
  Building2,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  ArrowRight,
  MapPinned
} from "lucide-react";
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
  fname: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lname: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Invalid gender value." }),
  }),
  birth_date: z.string().min(1, { message: "Birth date is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  mobile: z.string().min(10, { message: "Valid 10-digit phone number is required." }),
  fa_name: z.string().optional(),
  fa_mobile: z.string().optional(),
  fa_email: z.string().email({ message: "Invalid father's email." }).optional().or(z.literal("")),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
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
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(null);
  const [today, setToday] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isOthersSelected = selectedClass?.startsWith("Others");
  const cleanedClass = isOthersSelected ? "Others" : null;
  const [, setSelectedCategoryName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data, isLoading: categorydata_loading, refetch } = useOthersCategory(cleanedClass);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (isOthersSelected) refetch();
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
  const [currentUser, setCurrentUser] = useState<Partial<UserData>>({ gender: "Male" });

  // Load Locations
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
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
        const sortedData = [...data].sort((a: any, b: any) => a.name.localeCompare(b.name));
        setStates(sortedData);
        setValue("state", "");
        setValue("city", "");
        setCities([]);
      } catch (error) {
        console.error(error);
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
        const sortedData = [...data].sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCities(sortedData);
        setValue("city", "");
      } catch (error) {
        console.error(error);
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
        throw new Error("Please fill all required fields marked with *");
      }
      if (!passwordValid) {
        toast.error("Please enter a valid password.");
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
      toast.success("Student added to list");
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
          toast.success(`Student ${user.fname} registered!`);
          if (i < users.length - 1) await new Promise((r) => setTimeout(r, 500));
        } catch (error: any) {
          results.push({ success: false, user, error });
          toast.error(`Failed: ${user.fname}`);
        }
      }
      return { results };
    },
    onSuccess: ({ results }) => {
      setCurrentlyProcessing(null);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      const failedUsers = results.filter((r) => !r.success).map((r) => r.user);
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
      toast.error(error.message || "An unexpected error occurred.");
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
    const enteredDate = new Date(e.target.value);
    const todayDate = new Date(today);
    if (enteredDate > todayDate) {
      toast.error("Birth date cannot be in the future.");
      setCurrentUser({ ...currentUser, birth_date: "" });
    }
  };

  const inputStyles = `w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300`;

  return (
    <div className="min-h-screen p-4 bg-slate-50/50 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="flex items-center gap-2 text-sm font-medium transition-colors text-slate-500 hover:text-blue-600"
            onClick={() => navigate("/admin/users/add")}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Multiple Student Registration
          </h2>
          <div className="w-20 hidden sm:block"></div> {/* Spacer */}
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          <div
            onClick={() => setActiveTab("school")}
            className={`cursor-pointer flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
              activeTab === "school"
                ? "bg-white border-blue-500 shadow-md"
                : "bg-slate-100 border-transparent hover:bg-white hover:border-slate-200"
            }`}
          >
            <div className={`p-2 rounded-full ${activeTab === "school" ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500"}`}>
              <School size={24} />
            </div>
            <span className={`text-sm font-semibold ${activeTab === "school" ? "text-blue-700" : "text-slate-500"}`}>
              1. School Info
            </span>
          </div>

          <button
            onClick={() => setActiveTab("addUser")}
            disabled={!formValues.school_name || !formValues.school_class}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
              activeTab === "addUser"
                ? "bg-white border-blue-500 shadow-md"
                : "bg-slate-100 border-transparent"
            } ${(!formValues.school_name || !formValues.school_class) ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white hover:border-slate-200"}`}
          >
            <div className={`p-2 rounded-full ${activeTab === "addUser" ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500"}`}>
              <Users size={24} />
            </div>
            <span className={`text-sm font-semibold ${activeTab === "addUser" ? "text-blue-700" : "text-slate-500"}`}>
              2. Add Students
            </span>
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* TAB 1: SCHOOL INFO */}
          {activeTab === "school" && (
            <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* School Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Building2 className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-slate-800">School Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="school_name">School Name <span className="text-red-500">*</span></Label>
                    <input
                      id="school_name"
                      placeholder="Enter school name"
                      className={`${inputStyles} ${errors.school_name ? "border-red-500" : ""}`}
                      {...register("school_name")}
                    />
                    {errors.school_name && <p className="text-xs text-red-600">{errors.school_name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="school_class">Class/Grade <span className="text-red-500">*</span></Label>
                    <Select
                      value={selectedClass}
                      onValueChange={(value) => {
                        setSelectedClass(value);
                        setValue("school_class", value);
                      }}
                    >
                      <SelectTrigger className="w-full bg-white border-slate-200">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllClasses().map((className) => (
                          <SelectItem key={className} value={className}>{className}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {isOthersSelected && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 mb-2">Select Category:</p>
                        {categorydata_loading ? (
                          <p className="text-xs text-blue-500">Loading...</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {data?.map((item: CategoryMasterData) => (
                              <label key={item.cat_id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="others_category"
                                  checked={selectedCategory === item.cat_id}
                                  value={item.cat_id}
                                  onChange={() => {
                                    setSelectedCategory(item.cat_id);
                                    setSelectedCategoryName(item.category_name);
                                  }}
                                  className="accent-blue-600 w-4 h-4"
                                />
                                <span className="text-sm text-slate-700">{item.category_name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Globe className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-slate-800">Location</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label>Country <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(v) => setValue("country", v)} value={formValues.country}>
                      <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((c: any) => (
                          <SelectItem key={c.iso2} value={c.iso2}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>State <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(v) => setValue("state", v)} disabled={!formValues.country || loadingStates} value={formValues.state}>
                      <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder={loadingStates ? "Loading..." : "State"} /></SelectTrigger>
                      <SelectContent>
                        {states.map((s: any) => (
                          <SelectItem key={s.iso2} value={s.iso2}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>City <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(v) => setValue("city", v)} disabled={!formValues.state || loadingCities} value={formValues.city}>
                      <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder={loadingCities ? "Loading..." : "City"} /></SelectTrigger>
                      <SelectContent>
                        {cities.map((c: any) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setActiveTab("addUser")}
                  disabled={!formValues.school_name || !formValues.school_class || !formValues.country || !formValues.state || !formValues.city}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  Next Step <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: ADD STUDENTS */}
          {activeTab === "addUser" && (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <User className="text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-slate-800">Student Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>First Name <span className="text-red-500">*</span></Label>
                        <input
                          placeholder="First Name"
                          value={currentUser.fname || ""}
                          onChange={(e) => setCurrentUser({ ...currentUser, fname: e.target.value })}
                          className={inputStyles}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Last Name</Label>
                        <input
                          placeholder="Last Name"
                          value={currentUser.lname || ""}
                          onChange={(e) => setCurrentUser({ ...currentUser, lname: e.target.value })}
                          className={inputStyles}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label>Gender <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(v) => setCurrentUser({ ...currentUser, gender: v as any })} value={currentUser.gender}>
                          <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 relative">
                        <Label>Birth Date <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <input
                            type="date"
                            value={currentUser.birth_date || ""}
                            max={today}
                            onBlur={handleDateChange}
                            onKeyDown={(e) => e.preventDefault()}
                            onChange={(e) => setCurrentUser({ ...currentUser, birth_date: e.target.value })}
                            className={`${inputStyles} pl-10`}
                          />
                          <Calendar className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                        </div>
                      </div>

                      <div className="space-y-1.5 relative">
                        <Label>Email <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="student@email.com"
                            value={currentUser.email || ""}
                            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                            className={`${inputStyles} pl-10`}
                          />
                          <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        </div>
                      </div>

                      <div className="space-y-1.5 relative">
                        <Label>Mobile <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="10-digit number"
                            value={currentUser.mobile || ""}
                            onChange={(e) => /^\d*$/.test(e.target.value) && setCurrentUser({ ...currentUser, mobile: e.target.value })}
                            className={`${inputStyles} pl-10`}
                          />
                          <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parent Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Users className="text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-slate-800">Parent/Guardian</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Name</Label>
                        <input placeholder="Parent Name" value={currentUser.fa_name || ""} onChange={(e) => setCurrentUser({ ...currentUser, fa_name: e.target.value })} className={inputStyles} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Mobile</Label>
                        <input type="tel" maxLength={10} placeholder="Parent Mobile" value={currentUser.fa_mobile || ""} onChange={(e) => /^\d*$/.test(e.target.value) && setCurrentUser({ ...currentUser, fa_mobile: e.target.value })} className={inputStyles} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Email</Label>
                        <input type="email" placeholder="Parent Email" value={currentUser.fa_email || ""} onChange={(e) => setCurrentUser({ ...currentUser, fa_email: e.target.value })} className={inputStyles} />
                      </div>
                    </div>
                  </div>

                  {/* Address & Password */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <MapPinned className="text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-slate-800">Address & Security</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Address</Label>
                        <input placeholder="Street Address" value={currentUser.address || ""} onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })} className={inputStyles} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Pincode</Label>
                        <input type="tel" maxLength={6} placeholder="ZIP Code" value={currentUser.pincode || ""} onChange={(e) => /^\d{0,6}$/.test(e.target.value) && setCurrentUser({ ...currentUser, pincode: e.target.value })} className={inputStyles} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Password <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="Create Password"
                            value={currentUser.password || ""}
                            onChange={(e) => {
                              setCurrentUser({ ...currentUser, password: e.target.value });
                              setPasswordValid(checkPassword(e.target.value));
                            }}
                            className={`${inputStyles} pl-10`}
                          />
                          <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        </div>
                        {!passwordValid && currentUser.password && (
                          <p className="text-xs text-red-500 mt-1">Min 6 chars, 1 number, 1 upper & lower case.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-slate-100">
                     <Button variant="outline" type="button" onClick={() => setActiveTab("school")} className="flex-1">
                      <ArrowLeft size={16} className="mr-2" /> Back to School
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddUser}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={!currentUser.fname || !currentUser.email || !currentUser.birth_date || !currentUser.gender || !currentUser.mobile}
                    >
                      <Plus size={18} className="mr-2" /> Add to List
                    </Button>
                  </div>
                </div>

                {/* Right Column: List of Added Users */}
                <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200 h-fit lg:sticky lg:top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-green-600" />
                      Ready to Submit ({addedUsers.length})
                    </h3>
                  </div>
                  
                  {addedUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-white">
                      <User size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No students added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {addedUsers.map((user, index) => (
                        <div key={index} className="group relative bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <button
                            onClick={() => removeUser(index)}
                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="font-medium text-slate-800 pr-6 truncate">
                            {user.fname} {user.lname}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{user.email}</div>
                          <div className="text-xs text-slate-400 mt-1 flex gap-2">
                             <span>{user.gender}</span>
                             <span>•</span>
                             <span>{user.mobile}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <Button
                      type="button"
                      onClick={onSubmit}
                      disabled={addedUsers.length === 0 || isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isPending ? (currentlyProcessing ? "Processing..." : "Submitting...") : (
                        <> <Save size={18} className="mr-2" /> Submit All </>
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ManyUserForm;