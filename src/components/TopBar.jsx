import React, { useState, useEffect } from "react";
import logo from "../assets/logo-22.png";
import { User, LogOut, Key, X, Lock, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "./config";

// Assuming toast and axios are available in your project environment
// import { toast } from "react-hot-toast";
// import axios from "axios";

function TopBar({ onLogout }) {
  // --- STATE MANAGEMENT ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  // Controls showing either the user profiles details OR the reset form inside the drawer
  const [showInlineReset, setShowInlineReset] = useState(false);

  // States from your password reset reference code
  const [userNewPassword, setUserNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [userFormResetLoading, setUserFormResetLoading] = useState(false);

  // --- FETCH USER FROM LOCALSTORAGE ---
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading currentUser from localStorage:", error);
    }
  }, []);

  // Clean data safely mapped out from your localStorage payload schema
  const fullName = userData?.fullName || userData?.name || "";
  const userRole = userData?.role || "";
  // const userEmail = userData?.email || "admin@example.com";
  const userName = userData?.user || userData?.fullName || "";
  const userId = userData?.userId;

  console.log(userData);

  // --- PASSWORD RESET API LOGIC ---
  const handleResetPassword = async (id) => {
    // if (userNewPassword !== userConfirmPassword) {
    //   if (typeof toast !== "undefined") toast.error("New password and confirmation do not match.");
    //   return;
    // }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(userNewPassword)) {
      if (typeof toast !== "undefined") {
        toast.error(
          "Password must be at least 8 characters long and include a special character.",
        );
      }
      return;
    }

    try {
      setUserFormResetLoading(true);
      const payload = {
        currentPassword: currentPassword,
        newPassword: userNewPassword,
      };

      if (typeof axios !== "undefined") {
        await axios.put(
          `${backendUrl}/api/User/${id}/update-password`,
          payload,
        );
      }

      if (typeof toast !== "undefined")
        toast.success("Password updated successfully.");

      // Clear states and navigate back to profile view inside drawer
      setUserNewPassword("");
      setUserConfirmPassword("");
      setShowInlineReset(false);
    } catch (e) {
      console.error("Password update failed", e);
      const apiMessage =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        "Failed to update password.";
      if (typeof toast !== "undefined") toast.error(apiMessage);
    } finally {
      setUserFormResetLoading(false);
    }
  };

  // Helper function to handle full drawer closure resets
  const closeDrawerAll = () => {
    setIsDrawerOpen(false);
    setShowInlineReset(false);
    setUserNewPassword("");
    setUserConfirmPassword("");
  };

  return (
    <>
      <header className="w-full border-b border-border bg-[#0F3A46] text-white sticky top-0 z-40">
        <div className="mx-auto flex h-12 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Side Brand */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-white">
              GRC
            </span>
          </div>

          {/* Center Brand Identity Logo */}
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Lumina Corps"
              className="h-12 object-contain w-auto"
            />
          </div>

          {/* Right Profile Actions Trigger Element */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 rounded-full p-0.5 hover:bg-white/10 transition-colors focus:outline-none group"
              title="View Profile Details"
            >
              <div className="w-7 h-7 rounded-full bg-white  text-[#17414d] flex items-center justify-center font-bold text-xs border border-blue-400/30 shadow-inner group-hover:scale-105 transition-transform duration-150">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-white/20 px-3 py-1 text-xs font-medium text-white hover:bg-white/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* --- SIDE-OVER INTERACTIVE DRAWER CONTAINER --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay Backdrop Blur filter layout mask */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={closeDrawerAll}
          />

          {/* Container Panel: Changed to right-4, top-14 (below header), and max-h-[80vh] */}
          <div className="absolute right-4 top-14 z-50 flex max-w-full">
            <div className="w-screen max-w-xs max-h-[80vh] bg-white shadow-2xl flex flex-col rounded-xl border border-gray-200 transition-transform duration-300 transform translate-x-0 overflow-hidden">
              {/* Drawer Header Conditional Rendering */}
              <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                {!showInlineReset ? (
                  <div className="flex items-center gap-2 text-gray-700">
                    <User size={15} className="text-gray-500" />
                    <span className="text-xs font-semibold tracking-tight">
                      Profile
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowInlineReset(false)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Back to Profile</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeDrawerAll}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Content Panel Viewport switcher */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {!showInlineReset ? (
                  /* --- VIEW 1: USER ACCOUNT METADATA INFO PROFILE VIEW --- */
                  <div className="space-y-4">
                    {/* Centered Avatar Badge info */}
                    <div className="flex flex-col items-center py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-[#17414d] text-white flex items-center justify-center text-lg font-bold mb-1.5 shadow-sm">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">
                        {fullName}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full mt-0.5">
                        {userRole}
                      </span>
                    </div>

                    {/* Metadata property rows */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-semiboldtracking-wider">
                        Details
                      </h4>

                      <div className="flex justify-between items-center py-1.5 px-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[11px] text-gray-500 font-medium">
                          User Name
                        </span>
                        <span className="text-[11px] text-gray-800 font-mono font-medium">
                          {fullName}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 px-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[11px] text-gray-500 font-medium">
                          Full Name
                        </span>
                        <span className="text-[11px] text-gray-800 font-medium">
                          {fullName}
                        </span>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Security Management operations box */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-semibold tracking-wider">
                        Security
                      </h4>

                      {/* Swaps view inline to current form */}
                      <button
                        type="button"
                        onClick={() => setShowInlineReset(true)}
                        className="w-full flex items-center justify-between px-2.5 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 text-gray-700 hover:text-blue-700 rounded-lg text-[11px] font-medium transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Key size={13} className="text-gray-400" />
                          <span>Reset Account Password</span>
                        </div>
                        <span className="text-gray-400 text-[11px]">→</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* --- VIEW 2: INLINE FORM RESET CONTAINER --- */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResetPassword(userId);
                    }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-xs pb-0.5">
                      <Lock size={14} className="text-gray-500" />
                      <span>Update Password Fields</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Current password"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={userNewPassword}
                        onChange={(e) => setUserNewPassword(e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <p className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100 leading-normal">
                      Min 8 chars. Include special character (e.g., @, #, $).
                    </p>

                    <div className="flex flex-col gap-1.5 pt-1">
                      <button
                        type="submit"
                        disabled={userFormResetLoading}
                        className="w-full py-1.5 bg-[#17414d] text-white rounded-lg text-[11px] font-medium transition-colors shadow-sm disabled:opacity-60"
                      >
                        {userFormResetLoading
                          ? "Updating Password..."
                          : "Save New Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInlineReset(false)}
                        className="w-full py-1.5 border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Drawer Global Base Footer */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-1.5 border border-gray-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-gray-700 text-[11px] font-medium rounded-lg transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TopBar;
