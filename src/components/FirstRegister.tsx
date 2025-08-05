/* eslint-disable @typescript-eslint/no-explicit-any */
import {  useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { authAtom } from "../atoms/authAtom";
import { OtpVerification as OtpVerificationApi } from "../lib/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import z from 'zod'


const emailRegex = /^(?=.*@)(?=.*\.).*$/;

const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Invalid email format"),
  firstName: z.string().min(1, "First name is required").transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  lastName: z.string().min(1, "Last name is required").transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
});
 
 
export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [authState, setAuthState] = useRecoilState(authAtom);
  // const [error, setError] = useState("");
  const [loading , setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = async() => {
    const result = registerSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    setFormErrors({});
    setLoading(true);

    try {
      const payload = {
        email,
        fname: firstName,
        lname: lastName,
      };
 
      const response = await OtpVerificationApi(payload);
 
      if (response.success && response.data?.registerd_fields?.email) {
        const { fname, lname, email } = response.data.registerd_fields;
 
        setAuthState({
          ...authState,
          isLoggedIn: true,
          email,
          firstName: fname,
          lastName: lname,
        });

        localStorage.setItem(
          "registerd_fields",
          JSON.stringify(response.data.registerd_fields)
        );
 
        toast.success("Otp sent to your email. Check it.");
        navigate("/otp-verify");
 
      } else {
        toast.error(response.msg || "User already registered.");
      }
 
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-gray-100 h-screen w-screen">
        <img
          src="/Landing/memoryChampion.png"
          alt="Register"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col w-full max-w-2xl border-r bg-white ">
        
        <div className="flex flex-col justify-center items-center flex-1">
         <div className="text-center">
          <h2 className="text-2xl font-bold mb-0">
            Welcome to
          </h2>
          <h1 className="text-5xl font-bold mt-0">Memory Jamboree</h1>
          
          <div className="text-right">
             <p className="text-xs font-medium mt-1">
              Powered By{" "}
              <a
                href="https://whiteforest.academy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e8c740] text-[16px] underline"
              >
                WhiteForest Academy
              </a>
            </p>
          </div>
        </div>

        
          <div className="text-center">
            {/* <h2 className="text-2xl font-semibold mb-2 ">Create Account</h2> */}
             <h2 className="text-2xl font-semibold text-center  mt-6 mb-6">Create Account</h2>
          </div>

          
          <div className="flex flex-col w-full space-y-4 max-w-sm py-6">
            <Input
              type="text"
              placeholder="Enter First Name"
              className="h-12 text-black"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
             {formErrors.firstName && <p className="text-red-500 text-sm">{formErrors.firstName}</p>}
            <Input
              type="text"
              placeholder="Enter Last Name"
              className="h-12 text-black"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              />
            {formErrors.lastName && <p className="text-red-500 text-sm">{formErrors.lastName}</p>}
            <Input
              type="text"
              placeholder="Enter Email"
              className="h-12 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              />
            {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
          {loading ? (
              <div className="flex items-center justify-center p-3 bg-violet-500 rounded-md text-white text-lg font-semibold transition">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : (
              <Button
              onClick={handleRegister}
              className="h-12 text-lg font-semibold bg-[#245cab] hover:bg-[#95baed] transition-colors"
            >
              Register
            </Button>
            )}
             
            <p className=" text-black text-sm text-center">
              Already have an Account ?{" "}
              <Link to={"/auth/login"} className="text-[#245cab]">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}