/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
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
// import { isMobile } from "react-device-detect";
// import { api } from "../lib/client";
 
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

  // const token = sessionStorage.getItem('auth_token')
  // const user_id = sessionStorage.getItem('userId')

  // useEffect(() => {
  //   const fetchUser = async () => {
  //   try {
  //     const res = await api.get(`/admin/get-user/${user_id}` ,{
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await res.data
  //     if(data){
  //       setEmail(data.email); // ✅ Pre-fill email
  //     }
  //   } catch (err) {
  //     console.error('Failed to fetch user profile:', err);
  //   }
  // };  
  // if(token) {
  //   fetchUser()
  // }
  // })
 
  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password); 
    
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
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Panel (Image) */}
      <div className="w-full md:w-1/2 h-64 md:h-auto">
        <img
          src="/Landing/memoryChampion.png"
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right Panel (Form) */}
      <div className="flex flex-col w-full md:w-1/2 bg-white">
        <div className="flex flex-col justify-center items-center flex-1 px-4 sm:px-6 md:px-12">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-0">Welcome to</h2>
            <h1 className="text-3xl md:text-5xl font-bold mt-0">Memory Jamboree</h1>
            <div className="text-right mt-2">
              <p className="text-xs md:text-sm font-medium">
                Powered By{" "}
                <a
                  href="https://whiteforest.academy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e8c740] underline"
                >
                  WhiteForest Academy
                </a>
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="text-center mt-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Login</h2>
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


            <p
              onClick={() => setOpen(true)}
              className="text-sm text-[#245cab] hover:underline text-right cursor-pointer"
            >
              Forgot password?
            </p>


            <GooglLogin />

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
 