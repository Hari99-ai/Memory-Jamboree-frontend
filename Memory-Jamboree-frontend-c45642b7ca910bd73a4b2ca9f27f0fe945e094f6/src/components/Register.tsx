// // import { useState } from "react";
// // import { Input, Button, Label, Checkbox } from "@shadcn/ui";
// import { Input } from "@shadcn/ui"
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// // Define validation schema using Zod
// const schema = z.object({
//   name: z.string().min(3, "Name is required").max(100),
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters long"),
//   terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
// });

// const MyForm = () => {
//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//   });

//   const onSubmit = (data: any) => {
//     console.log("Form Data:", data);
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg">
//       <h2 className="text-2xl font-semibold text-center mb-4">Register</h2>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         {/* Name */}
//         <div className="mb-4">
//           <Label htmlFor="name">Name</Label>
//           <Input
//             id="name"
//             type="text"
//             placeholder="Enter your name"
//             {...register("name")}
//             className={`mt-1 w-full p-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"}`}
//           />
//           {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
//         </div>

//         {/* Email */}
//         <div className="mb-4">
//           <Label htmlFor="email">Email</Label>
//           <Input
//             id="email"
//             type="email"
//             placeholder="Enter your email"
//             {...register("email")}
//             className={`mt-1 w-full p-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"}`}
//           />
//           {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
//         </div>

//         {/* Password */}
//         <div className="mb-4">
//           <Label htmlFor="password">Password</Label>
//           <Input
//             id="password"
//             type="password"
//             placeholder="Enter your password"
//             {...register("password")}
//             className={`mt-1 w-full p-2 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"}`}
//           />
//           {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
//         </div>

//         {/* Terms Checkbox */}
//         <div className="mb-4 flex items-center">
//           <Checkbox {...register("terms")} />
//           <Label htmlFor="terms" className="ml-2">I agree to the terms and conditions</Label>
//           {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}
//         </div>

//         {/* Submit Button */}
//         <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">
//           Register
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default MyForm;