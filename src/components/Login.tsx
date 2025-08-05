/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { authAtom } from "../atoms/authAtom";
import { ForgetPasswords} from "../lib/api";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";
import GooglLogin from "./GoogleLogin";
import { api } from "../lib/client";
 
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
export default function Login() {

  const {login , loading} = useAuth()
  const navigate = useNavigate();
  const [ , setAuthState] = useRecoilState(authAtom);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
 
  // const userRole = useRecoilValue(userRoleAtom);
 
  // const handleLogin = async () => {
  //   const formData = new FormData();
  //   formData.append("email", email);
  //   formData.append("password", password);
  //   setLoading(true);
  //   try {
  //     const response = await loginApi(formData);
 
  //     if (response && response.access_token && response.user_id) {
  //       setAuthState({
  //         ...authState,
  //         isLoggedIn: true,
  //         email: email,
  //         token: response.access_token,
  //       });
 
  //       localStorage.setItem("auth_token", response.access_token);
  //       localStorage.setItem("email", email);
  //       localStorage.setItem("userId", response.user_id);
 
  //       navigate(userRole === "admin" ? "/admin-dashboard" : "/dashboard", {
  //         replace: true,
  //       });
  //     } else {
  //       setError("Invalid email or password");
  //     }
  //   } catch (error:any) {
  //     toast.error(error.message || error.msg)
  //     console.error("Login failed:", error);
  //     setError("An error occurred. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const token = sessionStorage.getItem('auth_token')
  const user_id = sessionStorage.getItem('userId')

  useEffect(() => {
    const fetchUser = async () => {
    try {
      const res = await api.get(`/admin/get-user/${user_id}` ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.data
      if(data){
        setEmail(data.email); // ✅ Pre-fill email
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };  
  if(token) {
    fetchUser()
  }
  })
 
  const handleLogin = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      login(email, password); 
    
    } catch (error) {
      toast.error("Login failed Check your credentials")
      console.log(error)
    }
  };

  const { mutate: sendOtp } = useMutation({
    mutationKey: ["otp-send"],
    mutationFn: (email: string) => ForgetPasswords(email),
    onSuccess: (data) => {
      if (data?.msg === "User not found") {
        toast.error("User not found with this email");
        return;
      }

      toast.success("Your OTP has been sent to your email!", {
        position: "top-center",
        duration: 1000,
      });
      setAuthState((prev) => ({ ...prev, email: forgotEmail }));
      navigate("/auth/forgot-password")
    },
    onError: (error: any) => {
      toast.error("Failed to send OTP, please try again.");
      console.error(error);
    },
  });


 
  const handleContinue = async () => {
    const trimmed = forgotEmail.trim();
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await sendOtp(trimmed);
    } catch (error) {
      toast.error("Failed to send OTP, please try again.");
    }
  };
 
  return (
    <div className="flex min-h-screen">
      {/* Left Panel (Image) */}
      <div className="flex-1 bg-gray-100 h-screen w-screen">
        <img
          src="/Landing/memoryChampion.png"
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>
 
      {/* Right Panel (Form) */}
      <div className="flex flex-col w-full max-w-2xl border-r bg-white">
        <div className="flex flex-col justify-center items-center flex-1">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-0">
              Welcome to 
            </h2>
            <h1 className="text-5xl font-bold mt-0">Memory Jamboree</h1>
            <div className="text-right mr-15">
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
 
          {/* Login Form */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-center mt-6 mb-6">
              Login
            </h2>
          </div>
 
          <div className="flex flex-col w-full space-y-4 max-w-sm py-6">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-12 text-black pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
 
            {/* {error && <p className="text-red-500 text-sm">{error}</p>} */}
 
            <p
              onClick={() => setOpen(true)}
              className="text-sm text-[#245cab] hover:underline text-right cursor-pointer"
            >
              Forgot password?
            </p>

            {/* <Button
              onClick={handleGoogleLogin}
              className="h-12 text-lg font-semibold bg-white text-black hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="38" height="38" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              Login with Google
            </Button> */}
            
            <GooglLogin/>

            {loading ? (
              <div className="flex items-center justify-center p-3 bg-[#245cab] rounded-md text-white text-lg font-semibold transition">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="h-12 text-lg font-semibold bg-[#245cab] hover:bg-[#95baed] transition-colors"
              >
                Login
              </Button>
            )}
 
            <p className="text-black text-sm text-center">
              Don’t have an account?{" "}
              <Link to="/auth/first-register" className="text-[#245cab]">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
 
      {/* Forgot Password Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Forgot Password ?</h3>
            <p className="text-sm text-gray-500 mb-4">
              No worries! Click continue to reset your password.
            </p>
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-10 text-sm text-black"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 