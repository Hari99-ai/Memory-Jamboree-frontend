import { z } from "zod";

// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
// 

export const getAllClasses = () => {
  return [
    "Others (Adult / Senior Citizen)",
    "3rd Grade",
    "4th Grade",
    "5th Grade",
    "6th Grade",
    "7th Grade",
    "8th Grade",
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
  ];
};


export const formSchema = z
  .object({
    fname: z.string().min(1, "First name is required"),
    lname: z.string().optional(),
    gender: z.string().optional(),
    birth_date: z.string().min(1, "Birth date is required"),
    email: z.string().min(1 , "Email is Require").email("Invalid email"),
    mobile: z.string().min(10, "Mobile number is required"),
    image: z.instanceof(File).or(z.string()).optional(), // or z.instanceof(File).optional()
    fa_name: z.string().optional(),
    fa_mobile: z.string().optional(),
    fa_email: z.union([z.string().email("Invalid email"),z.literal("")]),
    // mo_name: z.string().optional(),
    mo_mobile: z.string().optional(),
    // mo_email: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
    school_name: z.string().optional(),
    school_class: z.string().min(1 , 'Please Select any Grade or Others'),
    confirm_password: z.string().optional(),
  })
  // .superRefine((data, ctx) => {
  //   const isSchoolClassOther = data.school_class === "Others (Adult / Senior Citizen)";
  //   const isSchoolInfoFilled =
  //     (data.school_name?.trim() || data.school_class?.trim()) && !isSchoolClassOther;

  //   if (isSchoolInfoFilled) {
  //     if (!data.fa_name || data.fa_name.trim() === "") {
  //       ctx.addIssue({
  //         path: ["fa_name"],
  //         code: z.ZodIssueCode.custom,
  //         message: "Parents/Guardian name is required when school info is provided",
  //       });
  //     }
  //     if (!data.fa_mobile || data.fa_mobile.trim() === "") {
  //       ctx.addIssue({
  //         path: ["fa_mobile"],
  //         code: z.ZodIssueCode.custom,
  //         message: "Parents/Guardian mobile is required when school info is provided",
  //       });
  //     }
  //     // if (!data.mo_name || data.mo_name.trim() === "") {
  //     //   ctx.addIssue({
  //     //     path: ["mo_name"],
  //     //     code: z.ZodIssueCode.custom,
  //     //     message: "Mother's name is required when school info is provided",
  //     //   });
  //     // }
  //     // if (!data.mo_mobile || data.mo_mobile.trim() === "") {
  //     //   ctx.addIssue({
  //     //     path: ["mo_mobile"],
  //     //     code: z.ZodIssueCode.custom,
  //     //     message: "Mother's mobile is required when school info is provided",
  //     //   });
  //     // }
  //     // if (!data.mo_email || data.mo_email.trim() === "") {
  //     //   ctx.addIssue({
  //     //     path: ["mo_email"],
  //     //     code: z.ZodIssueCode.custom,
  //     //     message: "Mother Email is required when school info is provided",
  //     //   });
  //     // }
  //     if (!data.fa_email || data.fa_email.trim() === "") {
  //       ctx.addIssue({
  //         path: ["fa_email"],
  //         code: z.ZodIssueCode.custom,
  //         message: "Parents/Guardian Email is required when school info is provided",
  //       });
  //     }
  //   }
  // });




// export const formSchema = z
//   .object({
    
//   .superRefine((data, ctx) => {
//     const isSchoolClassOther = data.school_class === "Others (Adult / Senior Citizen)";
//     const isSchoolInfoFilled =
//       (data.school_name?.trim() || data.school_class?.trim()) && !isSchoolClassOther;

//     if (isSchoolInfoFilled) {
//       if (!data.fa_name || data.fa_name.trim() === "") {
//         ctx.addIssue({
//           path: ["fa_name"],
//           code: z.ZodIssueCode.custom,
//           message: "Parents/Guardian name is required when school info is provided",
//         });
//       }
//       if (!data.fa_mobile || data.fa_mobile.trim() === "") {
//         ctx.addIssue({
//           path: ["fa_mobile"],
//           code: z.ZodIssueCode.custom,
//           message: "Parents/Guardian mobile is required when school info is provided",
//         });
//       }
//       // if (!data.mo_name || data.mo_name.trim() === "") {
//       //   ctx.addIssue({
//       //     path: ["mo_name"],
//       //     code: z.ZodIssueCode.custom,
//       //     message: "Mother's name is required when school info is provided",
//       //   });
//       // }
//       // if (!data.mo_mobile || data.mo_mobile.trim() === "") {
//       //   ctx.addIssue({
//       //     path: ["mo_mobile"],
//       //     code: z.ZodIssueCode.custom,
//       //     message: "Mother's mobile is required when school info is provided",
//       //   });
//       // }
//       // if (!data.mo_email || data.mo_email.trim() === "") {
//       //   ctx.addIssue({
//       //     path: ["mo_email"],
//       //     code: z.ZodIssueCode.custom,
//       //     message: "Mother Email is required when school info is provided",
//       //   });
//       // }
//       if (!data.fa_email || data.fa_email.trim() === "") {
//         ctx.addIssue({
//           path: ["fa_email"],
//           code: z.ZodIssueCode.custom,
//           message: "Parents/Guardian Email is required when school info is provided",
//         });
//       }
//     }
//   });



export const eventType = z.object({
ename: z.string().min(1, "Event name is required"),
eimage: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: "Image is required" }),
  estatus: z.enum(["0", "1"]), 
  event_start: z.date(),
  event_end: z.date(),
  school_participants: z.array(z.number()).optional(),
  category: z.array(z.number()).min(1, "Select at least one category"),
  disciplines: z.array(z.number()).min(1, "Select at least one discipline"),
  emonitored: z.boolean()
});




