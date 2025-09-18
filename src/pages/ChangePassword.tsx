import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/client";

// Toast component for notifications
const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
    {message}
  </div>
);

const isValidPassword = (password: string) => {
  // Requires: 6+ chars, at least 1 uppercase, 1 lowercase, 1 number, special character is optional
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordPattern.test(password);
};

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // **UPDATED**: Real-time validation for the new password field
  useEffect(() => {
    if (newPassword && !isValidPassword(newPassword)) {
      setPasswordError(
        "Password must be at least 6 characters, include uppercase, lowercase, and a number."
      );
    } else {
      setPasswordError("");
    }
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // **UPDATED**: Mandatory check with the new password requirements
    if (!isValidPassword(newPassword)) {
      setError("Password must be at least 6 characters, include uppercase, lowercase, and a number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const auth_token = sessionStorage.getItem("auth_token");
      if (!auth_token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify({
          password: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // **UPDATED**: Clear session storage and redirect to API_BASE_URL
        sessionStorage.clear();
        setToast("Password changed successfully! Redirecting...");
        setTimeout(() => {
          setToast(null);
          // window.location.href = "https://aidev.memoryjamboree.com"; // Redirect to the base URL
          navigate('/auth/login')
        }, 2000);
      } else {
        setError(data.message || data.error || "Failed to change password.");
      }
    } catch (err:any) {
      console.error(err)
      setError("An error occurred. Please try again later.");
    }
    setLoading(false);
  };

  const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;
  
  // This logic automatically uses the updated isValidPassword function
  const isFormInvalid =
    !currentPassword ||
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword ||
    !isValidPassword(newPassword) ||
    loading;


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {toast && <Toast message={toast} />}
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-sm gap-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-100 p-2 rounded-full"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <div className="flex justify-center mb-6">
          <img
            src="https://media.istockphoto.com/id/1412092602/vector/reset-password-action.jpg?s=612x612&w=0&k=20&c=ihelCKSTEfY2Icc26nBakoN8wpk1qoh2yGVnJ5gi-Os="
            alt="Change Password Illustration"
            className="w-50 h-40"
          />
        </div>
        <h2 className="text-3xl font-bold text-center text-[#245cab] mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
          {/* Current Password */}
          <div className="w-full max-w-md">
            <label className="block text-base font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={isCurrentVisible ? "text" : "password"}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setIsCurrentVisible(!isCurrentVisible)}
                className="absolute right-2 top-2.5 text-sm text-gray-500"
              >
                {isCurrentVisible ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="w-full max-w-md">
            <label className="block text-base font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={isVisible ? "text" : "password"}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-2 top-2.5 text-sm text-gray-500"
              >
                {isVisible ? "🙈" : "👁️"}
              </button>
            </div>
            {passwordError && (
               <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="w-full max-w-md">
            <label className="block text-base font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={isConfirmVisible ? "text" : "password"}
                className={`w-full border ${confirmPassword && !isMatching ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                className="absolute right-2 top-2.5 text-sm text-gray-500"
              >
                {isConfirmVisible ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-sm mt-1 ${isMatching ? "text-green-600" : "text-red-500"}`}>
                {isMatching ? "Passwords match ✅" : "Passwords do not match ❌"}
              </p>
            )}
          </div>
          
          {error && <div className="text-red-600 text-center">{error}</div>}

          <button
            type="submit"
            className="w-full max-w-md bg-[#245cab] hover:bg-[#95baed] text-white py-2 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isFormInvalid}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;