/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signInWithGoogle } from "../firebase/googleLogin";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getRole } from "../lib";
import { API_BASE_URL } from "../lib/client";
import { isMobile } from "react-device-detect";

export default function GooglLogin() {
  const [loading , setLoading] = useState(false)
  const navigate = useNavigate();
  
  const {setToken} = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const result = await signInWithGoogle();
      const email = result.user.email;
      console.log("Google login successful:", result);
      if (email) {
        const payload = {
          email: email,
          fname: result.user.displayName?.split(" ")[0] || "",
          lname: result.user.displayName?.split(" ")[1] || "",
          uid: result.user.uid,
        };

        console.log("Payload for backend:", payload);
        const response = await axios.post(
          `${API_BASE_URL}/google_login`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("backend response:", response.data);
        sessionStorage.setItem("auth_token", response.data.access_token);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("userId", response.data.user_id);
        setToken(response.data.access_token);


         const role = getRole(); // now this works!
          console.log("role", role);
  
          if (role === 'admin') {
            navigate('/admin', { replace: true });
          } 
          if (role === 'user') {
            if (isMobile) {
              navigate("/event", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          }
        setLoading(false)
      } else {
        toast.error("Something went wrong")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
      toast.error("Google login failed");
    }finally {
      setLoading(false)
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex text-center"><Loader2 className="size-10 animate-spin"/></div>
      ) : (
        <>
          <Button
            onClick={handleGoogleLogin}
            variant="outline" // If using shadcn/ui or similar
            className="h-12 px-6 py-3 text-base font-medium text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center gap-3 w-full max-w-md mx-auto rounded-lg shadow-sm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 48 48"
              className="w-6 h-6"
            >
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            <span>Continue with Google</span>
          </Button>
        </>
      )}
    
    </>
  );
}
