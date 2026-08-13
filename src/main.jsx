import { StrictMode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

axios.interceptors.request.use(
  (config) => {
    // Retrieve the clean 'token' matching your Login.jsx configuration
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// =========================================================
// 2. GLOBAL RESPONSE INTERCEPTOR: Handle 401 Session Expiry
// =========================================================
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn("Session expired or token invalid. Redirecting to login...");

      // Wipe data from storage cleanly
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");

      // Force browser redirect back to the custom login screen
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
