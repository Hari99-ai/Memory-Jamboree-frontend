/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { authAtom } from "../atoms/authAtom";
import { ForgetPasswords, ResetPassword } from "../lib/api";
// import {
//   InputOTP,
//   InputOTPGroup,
// //   InputOTPSeparator,
//   InputOTPSlot,
// } from "./ui/input-otp";
import OTPInput from "./OTPInput";
import { useMutation } from "@tanstack/react-query";
import { ResetPassData } from "../types";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const isValidPassword = (password: string) => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordPattern.test(password);
};

const emailRegex = /^(?=.*@)(?=.*\.).*$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  //   const [firstName, setFirstName] = useState("");
  const [auth, setAuthState] = useRecoilState(authAtom);
  const email = auth.email;
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1000);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  useEffect(() => {
    if (confirmPassword && newPassword && confirmPassword !== newPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (newPassword && !isValidPassword(newPassword)) {
      setPasswordError(
        "Password must contain at least 1 uppercase, 1 lowercase & 1 number"
      );
    } else if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [newPassword, confirmPassword]);

  const { mutate } = useMutation({
    mutationKey: ["otp-send"],
    mutationFn: (email: string) => ForgetPasswords(email),
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsResendEnabled(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const { mutate: ResetPass } = useMutation({
    mutationKey: ["reset-password"],
    mutationFn: (data: ResetPassData) => ResetPassword(data),
    onSuccess: (data: any) => {
      if (data?.error) {
        toast.error(data.error); // backend returns "OTP expired", etc.
        return;
      }

      toast.success("Password Reset successfully");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/");
    },
    onError: (err: any) => {
      toast.error("Failed to reset password.");
      console.error(err);
    },
});



  const handleContinue = async () => {
    console.log(email);
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await mutate(email);
      toast.success("Your OTP has been sent to your email!", {
        position: "top-center",
        duration: 1000,
      });
      setAuthState((prev) => ({ ...prev, email }));
      setTimeLeft(300);
      setIsResendEnabled(false);
    } catch (error) {
      toast.error("Failed to send OTP, please try again.");
    }
  };

  const handleReset = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    console.log("email" , email)

    if (!otp || !email || !newPassword) {
      toast.error("Missing fields");
      return;
    }

    ResetPass({
      email,
      otp,
      password: newPassword,
    });
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
      <div className="flex flex-col w-full max-w-2xl border-r bg-white">
         <div className="flex flex-col justify-center items-center flex-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-0">Welcome to</h2>
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
          {/* <div className="text-center"> */}
            <h2 className="text-2xl font-semibold text-center mt-6">
              Create New Password
            </h2>
          {/* </div> */}
          <div className="w-full max-w-md">
            {/* <h2 className="text-2xl font-semibold mb-2 "></h2> */}
            {/* <div className="text-center">
              <h2 className="text-3xl font-bold">Create New Password</h2>
            </div> */}
            <div className="flex flex-col w-full space-y-4 max-w-sm py-6">
              <OTPInput value={otp} onChange={setOtp} />
              <div className="flex justify-between">
                <p className="text-sm text-red-600">
                  {isResendEnabled
                    ? "You can resend OTP now."
                    : `Resend in ${formatTime(timeLeft)}`}
                </p>

                <button
                  onClick={handleContinue}
                  disabled={!isResendEnabled}
                  className={`text-sm rounded-md text-blue-600 transition ${
                    isResendEnabled
                      ? "text-blue-600 hover:text-blue-700 text-xl"
                      : "cursor-not-allowed"
                  }`}
                >
                  {isResendEnabled ? "Resend OTP" : ""}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="h-12 text-black"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showconfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="h-12 text-black"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                >
                  {showconfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}

              <Button
                onClick={handleReset}
                disabled={passwordError !== "" || isResendEnabled}
                className="h-12 text-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-colors"
              >
                Reset
              </Button>
              {/* <p className=" text-black">
                If you dont want ?{" "}
                <Link to={"/login"} className="text-blue-400">
                  Login
                </Link>
              </p> */}
            </div>
          </div>
         </div>
      </div>
    </div>
  );
}
