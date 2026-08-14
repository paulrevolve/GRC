import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "./config";
import logo from "../assets/revolve_color_logo.png";
import revolve from "../assets/logo-22.png";

const Login = () => {
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const username = usernameRef.current?.value.trim();
    const password = passwordRef.current?.value;

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch IP Address
      let ipAddress = "";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          ipAddress = ipData.ip;
        }
      } catch (ipError) {
        console.warn("Failed to retrieve IP address:", ipError);
        // Optional fallback or leave as empty string
      }

      console.log("Ip Address:", ipAddress);

      const response = await fetch(`${backendUrl}/api/User/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, ipAddress }),
      });

      if (response.ok) {
        const data = await response.json();

        // 1. Commit token and user object synchronously to localStorage
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        if (data.role) {
          const userObj = {
            name: data.username,
            role: data.role,
            userId: data.user_Id,
            token: data.token,
            fullName: data.fullName,
          };
          localStorage.setItem("currentUser", JSON.stringify(userObj));
        }

        // 2. Crucial Timing Fix: Let the browser process the state updates before navigating
        // setTimeout(() => {
        //   navigate("/dashboard/project-budget-status", { replace: true });
        // }, 50);
        window.location.href = "/dashboard/home";
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Login failed. Please check your credentials.";

        if (contentType && contentType.includes("application/json")) {
          try {
            const errData = await response.json();
            errorMessage =
              errData.message ||
              errData.error ||
              errData.Message ||
              errData.Error ||
              errorMessage;
          } catch {
            // Fallback handled by default assignment
          }
        } else {
          try {
            const textResponse = await response.text();
            errorMessage = textResponse.trim() || errorMessage;
          } catch {
            // Fallback handled by default assignment
          }
        }

        setError(errorMessage);
      }
    } catch (error) {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // return (
  //   <div className="flex items-center justify-center min-h-screen bg-blue-100">
  //     <div className="bg-white p-6 rounded shadow-md w-80">
  //       <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
  //         Login
  //       </h2>
  //       {error && (
  //         <div className="mb-3 text-red-600 text-center text-sm bg-red-50 p-2 rounded">
  //           {error}
  //         </div>
  //       )}
  //       <input
  //         type="text"
  //         placeholder="Username"
  //         className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  //         ref={usernameRef}
  //         onKeyDown={handleKeyDown}
  //         disabled={loading}
  //       />
  //       <input
  //         type="password"
  //         placeholder="Password"
  //         className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  //         ref={passwordRef}
  //         onKeyDown={handleKeyDown}
  //         disabled={loading}
  //       />
  //       <button
  //         onClick={handleLogin}
  //         className={`w-full py-2 rounded font-medium text-white transition-colors ${
  //           loading
  //             ? "bg-gray-400 cursor-not-allowed"
  //             : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
  //         }`}
  //         disabled={loading}
  //       >
  //         {loading ? "Logging in..." : "Login"}
  //       </button>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#07171F]">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center bg-gray-100 overflow-hidden min-h-[35vh] lg:min-h-screen">
        {/* Background Accent */}
        {/* <div className="absolute inset-0">
          <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-blue-400/10 blur-3xl rounded-full" />
        </div> */}

        {/* Client Branding */}
        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <img
            src={logo}
            alt="Lumina Corps"
            className="w-[80%] max-w-[600px] object-contain"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex items-center justify-center px-6 bg-[#07171F]">
        <div className="w-full max-w-xl">
          {/* Login Card */}
          <div className="bg-[#0F2530] border border-white/10 rounded-3xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            {/* Your Company Logo */}
            <div className="flex justify-center mb-8">
              <img
                src={revolve}
                alt="Revolve"
                className="h-24 object-contain opacity-90"
              />
            </div>

            {/* Heading */}
            {/* <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-white">
            Welcome Back
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            Sign in to continue
          </p>
        </div> */}

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 text-center">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="mb-5">
              <label className="block text-sm text-gray-300 mb-2">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                ref={usernameRef}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#132F3B] border border-[#21414D] px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                ref={passwordRef}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#132F3B] border border-[#21414D] px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                loading
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-cyan-400 hover:bg-cyan-300 text-[#07171F]"
              }`}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-white">
              © 2026{" "}
              <a
                href="https://www.revolvefintech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                Revolve
              </a>
              . All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import React, { useRef, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMsal } from "@azure/msal-react";
// import { loginRequest } from "./config";
// import logo from "../assets/revolve_color_logo.png";
// import revolve from "../assets/logo-22.png";

// const Login = () => {
//   const navigate = useNavigate();
//   const { instance } = useMsal();

//   const usernameRef = useRef(null);
//   const passwordRef = useRef(null);

//   const [cachedAccounts, setCachedAccounts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // 1. Fetch any Microsoft accounts already saved in local storage on component mount
//   useEffect(() => {
//     const accounts = instance.getAllAccounts();
//     if (accounts.length > 0) {
//       setCachedAccounts(accounts);
//     }
//   }, [instance]);

//   // Helper function to handle successful login session storage & routing
//   const finalizeLogin = (account, accessToken) => {
//     // Set active account globally in MSAL so SharePoint/Upload forms use it
//     instance.setActiveAccount(account);

//     // Save tokens and user info synchronously
//     localStorage.setItem("authToken", accessToken);

//     const userObj = {
//       name: account.username,
//       role: "User",
//       userId: account.homeAccountId,
//       token: accessToken,
//       fullName: account.name || account.username,
//     };

//     localStorage.setItem("currentUser", JSON.stringify(userObj));

//     // Redirect to dashboard
//     navigate("/dashboard/home", { replace: true });
//   };

//   // 2. Handle Login using entered Microsoft ID & Password credentials
//   const handleManualLogin = async (e) => {
//     if (e) e.preventDefault();
//     setError("");

//     const enteredEmail = usernameRef.current?.value.trim();

//     if (!enteredEmail) {
//       setError("Please enter your Microsoft ID / Email address.");
//       return;
//     }

//     setLoading(true);

//     try {
//       // Trigger Microsoft login popup pre-filled with the entered email/ID
//       const response = await instance.loginPopup({
//         ...loginRequest,
//         loginHint: enteredEmail,
//       });

//       if (response && response.account) {
//         finalizeLogin(response.account, response.accessToken);
//       }
//     } catch (err) {
//       console.error("Login failed:", err);
//       if (
//         err.errorMessage?.includes("user_cancelled") ||
//         err.name === "BrowserAuthError"
//       ) {
//         setError("Sign-in process was cancelled.");
//       } else {
//         setError(
//           "Microsoft authentication failed. Please verify your credentials.",
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 3. Handle One-Click Login for cached local accounts
//   const handleCachedAccountLogin = async (account) => {
//     setError("");
//     setLoading(true);

//     try {
//       // Try silent login first using saved local account credentials
//       const response = await instance.acquireTokenSilent({
//         ...loginRequest,
//         account: account,
//       });

//       finalizeLogin(account, response.accessToken);
//     } catch (silentError) {
//       console.warn(
//         "Silent token acquisition failed. Opening popup prompt...",
//         silentError,
//       );

//       // Fallback: If local session expired, pop up Microsoft window pre-filled with this ID
//       try {
//         const response = await instance.loginPopup({
//           ...loginRequest,
//           loginHint: account.username,
//         });

//         if (response && response.account) {
//           finalizeLogin(response.account, response.accessToken);
//         }
//       } catch (popupError) {
//         console.error("Popup login error:", popupError);
//         setError(
//           "Session expired. Please sign in with your credentials again.",
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       handleManualLogin(e);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row bg-[#07171F]">
//       {/* LEFT SIDE: Client Branding */}
//       <div className="w-full lg:w-1/2 relative flex items-center justify-center bg-gray-100 overflow-hidden min-h-[35vh] lg:min-h-screen">
//         <div className="relative z-10 flex flex-col items-center text-center px-10">
//           <img
//             src={logo}
//             alt="Lumina Corps"
//             className="w-[80%] max-w-[600px] object-contain"
//           />
//         </div>
//       </div>

//       {/* RIGHT SIDE: Login Form */}
//       <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex items-center justify-center px-6 bg-[#07171F]">
//         <div className="w-full max-w-xl">
//           <div className="bg-[#0F2530] border border-white/10 rounded-3xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
//             {/* Logo */}
//             <div className="flex justify-center mb-8">
//               <img
//                 src={revolve}
//                 alt="Revolve"
//                 className="h-24 object-contain opacity-90"
//               />
//             </div>

//             {/* Error Container */}
//             {error && (
//               <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 text-center">
//                 {error}
//               </div>
//             )}

//             {/* Standard Login Form */}
//             <form onSubmit={handleManualLogin}>
//               {/* Username / Microsoft ID Input */}
//               <div className="mb-5">
//                 <label className="block text-sm text-gray-300 mb-2">
//                   Microsoft ID / Email
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="name@organization.com"
//                   ref={usernameRef}
//                   onKeyDown={handleKeyDown}
//                   disabled={loading}
//                   className="w-full h-12 rounded-xl bg-[#132F3B] border border-[#21414D] px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
//                 />
//               </div>

//               {/* Password Input */}
//               <div className="mb-6">
//                 <label className="block text-sm text-gray-300 mb-2">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   placeholder="Enter your password"
//                   ref={passwordRef}
//                   onKeyDown={handleKeyDown}
//                   disabled={loading}
//                   className="w-full h-12 rounded-xl bg-[#132F3B] border border-[#21414D] px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
//                 />
//               </div>

//               {/* Validate & Login Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
//                   loading
//                     ? "bg-gray-600 text-gray-300 cursor-not-allowed"
//                     : "bg-cyan-400 hover:bg-cyan-300 text-[#07171F]"
//                 }`}
//               >
//                 {loading ? "Validating..." : "Login with Microsoft"}
//               </button>
//             </form>

//             {/* Local Account Section (Appears directly below form if local account exists) */}
//             {cachedAccounts.length > 0 && (
//               <div className="mt-6 pt-6 border-t border-white/10">
//                 <p className="text-xs text-gray-400 mb-3 text-center">
//                   Or continue with saved local account:
//                 </p>

//                 {cachedAccounts.map((acc) => (
//                   <button
//                     key={acc.homeAccountId}
//                     type="button"
//                     onClick={() => handleCachedAccountLogin(acc)}
//                     disabled={loading}
//                     className="w-full p-3.5 bg-[#132F3B] hover:bg-[#1C4252] border border-cyan-400/30 rounded-xl flex items-center justify-between text-left transition-all group"
//                   >
//                     <div className="flex items-center space-x-3 min-w-0 pr-2">
//                       <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-400/30 shrink-0">
//                         {(acc.name || acc.username)[0].toUpperCase()}
//                       </div>
//                       <div className="truncate">
//                         <p className="text-white font-medium text-xs truncate">
//                           {acc.name || "Microsoft User"}
//                         </p>
//                         <p className="text-gray-400 text-[11px] truncate">
//                           {acc.username}
//                         </p>
//                       </div>
//                     </div>
//                     <span className="text-xs text-cyan-400 font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">
//                       Sign in →
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             )}

//             {/* Footer */}
//             <div className="mt-6 text-center text-xs text-white">
//               © 2026{" "}
//               <a
//                 href="https://www.revolvefintech.com/"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
//               >
//                 Revolve
//               </a>
//               . All rights reserved.
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
