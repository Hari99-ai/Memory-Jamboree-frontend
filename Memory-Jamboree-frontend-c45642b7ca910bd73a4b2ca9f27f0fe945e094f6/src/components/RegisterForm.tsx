// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState, useRef } from "react";
// import { Button } from "./ui/button";
// import { Label } from "./ui/label";
// import { Eye, EyeOff } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// // import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import {
//   getCountries,
//   getCities,
//   getStates,
  
// } from "../lib/select";
// import { Register } from "../lib/api";
// import { toast } from "react-hot-toast";
// import { Alert } from "./ui/alert";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { formSchema , getAllClasses } from "../types/schema";
// import { useNavigate } from "react-router-dom";

// type FormValues = z.infer<typeof formSchema>;

// export default function ProfileForm() {
//   const navigate = useNavigate();
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [selectedCountry, setSelectedCountry] = useState("IN");
//   const [selectedState, setSelectedState] = useState("");
//   const [loadingStates, setLoadingStates] = useState(false);
//   const [loadingCities, setLoadingCities] = useState(false);
//   const [formStatus, setFormStatus] = useState({ type: "", message: "" });
//   const [previewImage, setPreviewImage] = useState(
//     "data:image/jpeg;base64,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"
//   );
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors, isSubmitting , isSubmitted , touchedFields },
//   } = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       country: "IN",
//       state: "",
//       city: "",
//       mobile: "",
//     },
//     mode: "onChange",
   
//   });

//   const password = watch("password");

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordMatch, setPasswordMatch] = useState<null | boolean>(null);

//   // const passwordValue = watch("password");
//   const confirmPassword = watch("confirm_password");


  

//   useEffect(() => {
//     if (confirmPassword) {
//       setPasswordMatch(password === confirmPassword);
//     } else {
//       setPasswordMatch(null);
//     }
//   }, [password, confirmPassword]);

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
//     mutationKey: ["create-profile"],
//     mutationFn: async (formDataNative: FormData) => {
//       setFormStatus({ type: "loading", message: "Submitting your profile..." });

//       // Convert FormData to regular object for debugging
//       const formValues: Record<string, any> = {};
//       formDataNative.forEach((value, key) => {
//         formValues[key] = value;
//       });
//       console.log("Submitting:", formValues);

//       return Register(formDataNative);
      
//     },
//     onSuccess: (response:any) => {
//       queryClient.invalidateQueries({ queryKey: ["user-profile"] });
//       toast.success("User registered successfully");
//       setFormStatus({
//         type: "success",
//         message: "Profile successfully created!",
//       });
//       if (response && response.access_token && response.user_id) {
//         sessionStorage.setItem("auth_token", response.access_token);
//         sessionStorage.setItem("userId", response.user_id);
//       }
//       navigate("/payment");
//     },

//     onError: (error: any) => {
//       console.error("Registration error:", error);
//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         "Registration failed. Please try again.";
//       toast.error(errorMessage);
//       setFormStatus({
//         type: "error",
//         message: errorMessage,
//       });
//     },
//   });

//   const onSubmit = async (values: FormValues) => {
//     const formData = new FormData();

//     // Append all form values
//     Object.entries(values).forEach(([key, value]) => {
//       if (value !== undefined && value !== null && value !== "") {
//         if (key === "image" && value instanceof File) {
//           formData.append(key, value);
//         } else {
//           formData.append(key, String(value));
//         }
//       }
//     });

    
    
//     mutate(formData);

//   };

//   useEffect(() => {
//     const saved = localStorage.getItem("registerd_fields");
//     if (saved) {
//       const { email, fname, lname } = JSON.parse(saved);
//       setValue("email", email || "");
//       setValue("fname", fname || "");
//       setValue("lname", lname || "");
//     }
//   }, [setValue]);

//   return (
    
//     <div className="max-w-6xl mx-auto p-4 md:p-8 rounded-lg shadow-lg">
//       <h2 className="text-2xl font-bold text-center mb-8 text-[#245cab]">
//        Registration Form
//       </h2>

//       {formStatus.message && (
//         <Alert
//           className={`mb-6 ${
//             formStatus.type === "error"
//               ? "bg-red-50 border-red-200 text-red-800"
//               : formStatus.type === "success"
//               ? "bg-green-50 border-green-200 text-green-800"
//               : "bg-blue-50 border-blue-200 text-blue-800"
//           }`}
//         >
//           <div>{formStatus.message}</div>
//         </Alert>
//       )}

//       <div className="flex justify-center mb-8">
//         <div className="relative">
//           <img
//             src={previewImage}
//             alt="Profile Avatar"
//             className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
//           />
//           <button
//             type="button"
//             onClick={() => fileInputRef.current?.click()}
//             className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full p-2 cursor-pointer transition-colors duration-200 shadow-md"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-5 h-5"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
//               <circle cx="12" cy="13" r="4"></circle>
//             </svg>
//           </button>
//           <input
//             type="file"
//             id="image"
//             accept="image/*"
//             className="hidden"
//             onChange={handleImageChange}
//             ref={fileInputRef}
//           />
//         </div>
//       </div>

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="grid grid-cols-1 md:grid-cols-2 gap-6"
//       >
//         {/* Personal Information */}
//         <div className="space-y-1">
//           <Label htmlFor="fname" className="text-sm font-medium">
//             First Name <span className="text-red-500">*</span>
//           </Label>
//           <input
//             id="fname"
//             placeholder="First Name"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${errors.fname ? "border-red-500" : "border-gray-300"}`}
//             {...register("fname", {
//               required: "First name is required",
//               onChange: (e) => {
//                 const value = e.target.value;
//                 e.target.value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//               },
//             })}
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
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${errors.lname ? "border-red-500" : "border-gray-300"}`}
//             {...register("lname", {
//               onChange: (e) => {
//                 const value = e.target.value;
//                 e.target.value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//               },
//             })}
//           />
//           {errors.lname && (
//             <p className="text-red-500 text-xs mt-1">{errors.lname.message}</p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="gender" className="text-sm font-medium">
//             Gender<span className="text-red-500 text-xl">*</span>
//           </Label>
//           <Select
//             onValueChange={(value) =>
//               setValue("gender", value, { shouldValidate: true })
//             }
//             value={watch("gender")}
            
//           >
//             <SelectTrigger
//               id="gender"
//               className={`w-full bg-white ${errors.gender ? "border-red-500" : ""}`}
//             >
//               <SelectValue placeholder="Select Gender" />
//             </SelectTrigger>
//             <SelectContent className="bg-white">
//               <SelectItem value="male">Male</SelectItem>
//               <SelectItem value="female">Female</SelectItem>
//               <SelectItem value="other">Other</SelectItem>
//             </SelectContent>
//           </Select>
//           {errors.gender && (
//             <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="birth_date" className="text-sm font-medium">
//             Birth Date<span className="text-red-500 text-xl">*</span>
//           </Label>
//           <input
//             id="birth_date"
//             type="date"
//             onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
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
//             Email<span className="text-red-500 text-xl">*</span>
//           </Label>
//           <input
//             id="email"
//             type="email"
//             placeholder="Email"
//             disabled
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
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
//             Mobile Number<span className="text-red-500 text-xl">*</span>
//           </Label>
//           <input
//             type="tel"
//             maxLength={10}
//             inputMode="numeric"
//             pattern="[0-9]*"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
//               errors.mobile ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("mobile", {
//               required: "Mobile number is required",
//               pattern: {
//                 value: /^[0-9]{10}$/,
//                 message: "Mobile number must be exactly 10 digits",
//               },
//             })}
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             onInput={(e: any) => {
//               e.target.value = e.target.value
//                 .replace(/[^0-9]/g, "")
//                 .slice(0, 10);
//             }}
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
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
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
//             Cateogy/Class/Grade
//           </Label>
//           <Select
//             onValueChange={(value) =>
//             {
//               setValue("school_class", value , { shouldValidate: true })
//               // setSelected(value ?? "")
//             }
//             }
//             value={watch("school_class")}
//           >
//             <SelectTrigger id="school_class" className="w-full">
//               <SelectValue placeholder="Select Class/Grade" />
//             </SelectTrigger>
//             <SelectContent className="max-h-60 overflow-auto">
//               {getAllClasses()?.map((className) => (
//                 <SelectItem key={className} value={className}>
//                   {className}
//                 </SelectItem>
//               ))}
//             </SelectContent>
        
//           </Select>

//         </div>

//         {/* Parent Information */}
//         <div className="md:col-span-2 mt-4 mb-2">
//           <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
//             Parents/Guardian Information
//           </h3>
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="fa_name" className="text-sm font-medium">
//            Name
//           </Label>
//           <input
//             id="fa_name"
//             placeholder="Enter Name"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
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

//         {/* <div className="space-y-1">
//           <Label htmlFor="mo_name" className="text-sm font-medium">
//             Mother's Name
//           </Label>
//           <input
//             id="mo_name"
//             placeholder="Mother's Name"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
//               errors.mo_name ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("mo_name")}
//           />
//           {errors.mo_name && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.mo_name.message}
//             </p>
//           )}
//         </div> */}
//         <div className="space-y-1">
//           <Label htmlFor="fa_mobile" className="text-sm font-medium">
//             Mobile
//           </Label>
//           <input
//             type="tel"
//             maxLength={10}
//             inputMode="numeric"
//             pattern="[0-9]*"
//             id="fa_mobile"
//             placeholder="Enter Mobile"
//             onInput={(e) => {
//               e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
//             }}
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
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
//             Email
//           </Label>
//           <input
//             id="fa_email"
//             type="email"
//             placeholder="Enter Email"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
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


//         {/* Alternate Mobile Number */}
//         <div className="space-y-1">
//           <Label htmlFor="mo_mobile" className="text-sm font-medium">
//             Alternate Mobile
//           </Label>
//           <input
//             type="tel"
//             maxLength={10}
//             inputMode="numeric"
//             pattern="[0-9]*"
//             id="mo_mobile"
//             onInput={(e) => {
//               e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
//             }}
//             placeholder="Enter Alternate Mobile"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
//               errors.mo_mobile ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("mo_mobile")}
//           />
//           {errors.mo_mobile && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.mo_mobile.message}
//             </p>
//           )}
//         </div>

        

//         {/* <div className="space-y-1">
//           <Label htmlFor="mo_email" className="text-sm font-medium">
//             Mother's Email
//           </Label>
//           <input
//             id="mo_email"
//             type="email"
//             placeholder="Mother's Email"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
//               errors.mo_email ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("mo_email")}
//           />
//           {errors.mo_email && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.mo_email.message}
//             </p>
//           )}
//         </div> */}

//         {/* Address Information */}
//         <div className="md:col-span-2 mt-4 mb-2">
//           <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
//             Address Information
//           </h3>
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="country" className="text-sm font-medium">
//             Country <span className="text-red-500 text-xl">*</span>
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

//           {errors.country && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.country.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="state" className="text-sm font-medium">
//             State/Province <span className="text-red-500 text-xl">*</span>
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

//           {errors.state && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.state.message}
//             </p>
//           )}
//         </div>



//         <div className="space-y-1">
//           <Label htmlFor="city" className="text-sm font-medium">
//             City <span className="text-red-500 text-xl">*</span>
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
          
//           {errors.city && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.city.message}
//             </p>
//           )}
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="address" className="text-sm font-medium">
//             Address
//           </Label>
//           <input
//             id="address"
//             placeholder="Street address"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
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
//             Pincode/ZIP <span className="text-red-500 text-xl">*</span>
//           </Label>
//           <input
//             id="pincode"
//             maxLength={6}
//             inputMode="numeric"
//             pattern="[0-9]*"
//             placeholder="Pincode/ZIP"
//             onInput={(e) => {
//               e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
//             }}
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
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

//         {/* Password Field */}
//         <div className="space-y-1 md:col-span-2 relative">
//           <Label htmlFor="password" className="text-sm font-medium">
//             Password <span className="text-red-500">*</span>
//           </Label>

//           <input
//             id="password"
//             type={showPassword ? "text" : "password"}
//             placeholder="Create a secure password"
//             className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10 ${
//               errors.password ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("password")}
//           />

//           <button
//             type="button"
//             className="absolute right-3 top-[34px] text-gray-500"
//             onClick={() => setShowPassword((p) => !p)}
//           >
//             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//           </button>

//           {errors.password && (touchedFields.password || isSubmitted) && (
//           <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//         )}


//           <div className=" text-gray-700">
//             <p className="text-sm"> Your password must be at least 6 characters long</p>
//             <p className="text-sm">Your password should contain a combination of the following character types:</p>
//            <div className="p-2">
//             <p className="text-sm text-gray-500"><span className="text-red-500">*</span> Minimum 1 number is required</p>
//             <p className="text-sm text-gray-500"><span className="text-red-500">*</span> Minimum 1 lowercase letter is required</p>
//             <p className="text-sm text-gray-500"><span className="text-red-500">*</span> Minimum 1 uppercase letter is required</p>
//            </div>
//           </div>

//         </div>

//         {/* Confirm Password Field */}
//         <div className="space-y-1 md:col-span-2 relative">
//           <label
//             htmlFor="confirmPassword"
//             className="block text-sm font-medium"
//           >
//             Confirm Password <span className="text-red-500">*</span>
//           </label>
//           <input
//             id="confirmPassword"
//             type={showConfirmPassword ? "text" : "password"}
//             placeholder="Re-enter your password"
//             className="w-full px-3 py-2 border rounded-md pr-10 border-gray-300 text-sm"
//             {...register("confirm_password")}
//           />
//           <button
//             type="button"
//             className="absolute right-3 top-[30px] text-gray-500"
//             onClick={() => setShowConfirmPassword((prev) => !prev)}
//           >
//             {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//           </button>

//           {/* Live password match feedback */}
//           {passwordMatch !== null && (
//             <p
//               className={`text-xs mt-1 ${
//                 passwordMatch ? "text-green-600" : "text-red-500"
//               }`}
//             >
//               {passwordMatch
//                 ? ""
//                 : "❌ Passwords do not match"}
//             </p>
//           )}

//           {/* <button
//             type="button"
//             className="absolute right-3 top-[38px] text-gray-500"
//             onClick={() => setShowConfirmPassword((p) => !p)}
//           >
//             {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//           </button> */}

//           {errors.confirm_password && (
//             <p className="text-red-500 text-xs mt-1">
//               {errors.confirm_password.message}
//             </p>
//           )}
//         </div>

//         {/* Submit Button */}
//           <div className="md:col-span-2 flex justify-center mt-6">
//           <Button
//             type="submit"
//             className={`w-[200px] bg-blue-600 text-white py-2 rounded-md transition-opacity ${
//               passwordMatch === false || !confirmPassword
//                 ? "opacity-50 cursor-not-allowed"
//                 : ""
//             }`}
//             disabled={
//               isSubmitting ||
//               isPending ||
//               passwordMatch === false ||
//               !confirmPassword
//             }
//           >
//             {isSubmitting || isPending ? "Submitting..." : "Create Profile"}
//           </Button>
//         </div>

//       </form>
//     </div>
//   );
// }
