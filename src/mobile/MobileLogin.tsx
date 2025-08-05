import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
 
 
export default function MobileLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/event";
  
  const {login , loading} = useAuth()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    
    try {
      e.preventDefault();
      login(email, password); 
      navigate(redirectTo, { replace: true });
      
    } catch (error) {
      toast.error("Login failed Check your credentials")
      console.log(error)
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
          </div>
        </div>
      </div>     
    </div>
  );
}
 