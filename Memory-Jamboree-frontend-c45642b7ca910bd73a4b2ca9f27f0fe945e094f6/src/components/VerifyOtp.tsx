/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRecoilState } from "recoil";
import { authAtom } from "../atoms/authAtom";
import { Button } from "./ui/button";
import { 
  // ForgetPasswords, 
  OtpVerification, OtpVerify, setPassword} from "../lib/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { setPasswordData } from "../types";
import OTPInput from "./OTPInput";

// const emailRegex = /^(?=.*@)(?=.*\.).*$/;
const isValidPassword = (password: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useRecoilState(authAtom);
  const email = authState.email;
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // const { mutate: sendOtp } = useMutation({
  //   mutationKey: ["otp-send"],
  //   mutationFn: (email: string) => ForgetPasswords(email),
  // });

  // const { mutateAsync: resetPassword } = useMutation({
  //   mutationKey: ["reset-password"],
  //   mutationFn: (data: ResetPassData) => OtpVerify(data),
  // });

  const { mutateAsync: set_password } = useMutation({
    mutationKey: ["reset-password"],
    mutationFn: (data:setPasswordData) => setPassword(data),
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

  useEffect(() => {
    if (newPassword && !isValidPassword(newPassword)) {
      setPasswordError("Password must contain at least 6 digits , 1 uppercase, 1 lowercase & 1 number");
    } else if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [newPassword, confirmPassword]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleContinue = async () => {
  // if (!emailRegex.test(email)) {
  //   toast.error("Please enter a valid email address");
  //   return;
  // }

  const storedFields = JSON.parse(localStorage.getItem("registerd_fields") || "{}");
  const payload = {
    email: storedFields.email,
    fname: storedFields.fname,
    lname: storedFields.lname,
  };
  try {
    const res = await OtpVerification(payload);
    if (res.success) {
      toast.success("OTP sent to your email!");
      setTimeLeft(300);          // reset countdown
      setIsResendEnabled(false); // disable resend until countdown ends
    } else {
      toast.error(`Failed to send OTP: ${res.msg}`);
      setIsResendEnabled(true);  // allow retry if failed
    }
  } catch (err: any) {
    toast.error("Something went wrong. Please try again.");
    setIsResendEnabled(true);    // allow retry
  }
};


  const handleVerifyOtp = async () => {
    const enteredOtp = authState.otp.join("");
    if (!email) {
      toast.error("Email not found.");
      return;
    }
    if (enteredOtp.length < 5) {
      toast.error("Please enter the complete OTP");
      return;
    }
  
    console.log('enteredOtp' , enteredOtp)
    console.log('')

    try {
      await OtpVerify({ otp: enteredOtp, email });
      toast.success("OTP verified successfully!");
      setIsOtpVerified(true);
    } catch (error: any) {
      toast.error("OTP verification failed.");
      console.error(error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      toast.error("Invalid password format.");
      return;
    }

    try {
      await set_password({
        email,
        password: newPassword,
      });
      setIsOtpVerified(true)
      toast.success("Password set successfully!");
      setAuthState((prev) => ({ ...prev, otp: Array(5).fill("") }));
      setNewPassword("");
      setConfirmPassword("");
      navigate("/");
    } catch (error: any) {
      toast.error("Failed to reset password.");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-white">
      <div className="order-2 md:order-1 w-full md:w-1/2 flex justify-center items-center h-screen">
        <img
          src="/Landing/memoryChampion.png"
          alt="OTP Illustration"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="order-1 md:order-2 w-full md:w-1/2 flex flex-col justify-center items-center h-screen p-8 bg-white">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-0">
              Welcome to <span className="text-[#e8c740]">WFA</span>
            </h2>
            <h1 className="text-5xl font-bold mt-0">Memory Jamboree</h1>
            <div className="text-right mr-10">
              <p className="text-xs font-medium mt-1">
                Powered By{" "}
                <span className="text-[#e8c740] text-[16px]">
                  WhiteForest Academy
                </span>
              </p>
            </div>
          </div>
            <>
              {!isOtpVerified ? (
                <div>
                  <p className="text-center text-gray-600 py-4">Sent to <b>{email}</b></p>
                <OTPInput
                  value={authState.otp.join("")}
                  onChange={(val) => {
                    setAuthState((prev) => ({
                      ...prev,
                      otp: val.split(""),
                    }));
                  }}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-red-600 py-3">
                    {isResendEnabled ? "You can resend OTP now." : `Resend in ${formatTime(timeLeft)}`}
                  </p>
                  <button
                    onClick={handleContinue}
                    disabled={!isResendEnabled}
                    className={`text-[18px] rounded-md transition ${
                      isResendEnabled
                        ? "text-blue-600 hover:text-blue-700"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                  >
                    {isResendEnabled ? "Resend OTP" : ""}
                  </button>
                </div>
                <Button
                  type="submit"
                  onClick={handleVerifyOtp}
                  className="h-12 text-lg pt-2 font-semibold bg-[#245cab] hover:bg-[#95baed] w-full"
                >
                  Continue
                </Button>

                </div>
              ): (
              <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                <h2 className="text-2xl font-semibold text-center mb-6">Set Password</h2>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-4 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#245cab]"
                    minLength={6}
                    required
                  />
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#245cab]"
                    minLength={6}
                    required
                  />
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                  </span>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
                <Button
                  type="submit"
                  disabled={passwordError !== ""}
                  className="h-12 text-lg font-semibold bg-[#245cab] hover:bg-[#95baed] w-full"
                >
                  Set Password
                </Button>
              </form>
              )}
            </>
        </div>
      </div>
    </div>
  );
}
