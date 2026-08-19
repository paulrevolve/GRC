import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate, Outlet } from "react-router-dom";
import NavigationSidebar from "../components/NavigationSidebar";
import TopBar from "../components/TopBar";
import axios from "axios";
import { backendUrl } from "../components/config";
import ChatBot from "../components/ChatBot";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Visibility, Reports, Report Groups & Loading States
  const [visibility, setVisibility] = useState({});
  const [biReports, setBiReports] = useState([]);
  const [reportGroups, setReportGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userId = user?.userId || user?.id;
  const defaultWorkspaceName = import.meta.env.VITE_WORKSPACE_NAME || "";

  const loadConfig = async () => {
    setLoading(true);
    try {
      const currentUserString = localStorage.getItem("currentUser") || "{}";
      const currentUserObj = JSON.parse(currentUserString);
      const userRole = (currentUserObj.role || "").toUpperCase();
      const token = currentUserObj.token ?? "";

      // A. Prepare network promises with inline error handling
      const biReportPromise = axios
        .get(`${backendUrl}/api/PowerBI/BiReport_List`, {
          params: { workspaceName: defaultWorkspaceName },
        })
        .catch((err) => {
          console.warn("PowerBI report list request failed:", err);
          return { data: [] }; // Return fallback object so Promise.all continues
        });

      const reportGroupsPromise = axios.get(`${backendUrl}/api/ReportGroups`);

      let permPromise = Promise.resolve(null);
      if (user?.userId) {
        permPromise = axios.get(
          // `${backendUrl}/api/SecurityAccess/GetUserPermissionsV1/${user.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      // B. Execute all requests concurrently
      const [permRes, biRes, groupsRes] = await Promise.all([
        permPromise,
        biReportPromise,
        reportGroupsPromise,
      ]);

      // C. Process Visibility Data
      if (userRole === "AD") {
        setVisibility({});
      } else if (permRes?.data) {
        const data = permRes.data || {};
        const mergedVisibility = {
          ...(data.screens || {}),
          ...(data.fields || {}),
        };
        setVisibility(mergedVisibility);
      } else {
        setVisibility({});
      }

      // D. Process & Format BI Reports List
      const rawBiData = Array.isArray(biRes?.data) ? biRes.data : [];
      const formattedBiReports = rawBiData.map((item) => {
        const reportName = item.datasetName || item.name || "Unnamed Report";
        const reportId = item.reportId || item.id || reportName;

        return {
          id: String(reportId),
          label: reportName,
          path: `/dashboard/report/${reportId}`,
          ...item,
        };
      });
      setBiReports(formattedBiReports);

      // E. Process Report Groups Data
      const rawGroupsData = Array.isArray(groupsRes?.data)
        ? groupsRes.data
        : [];
      setReportGroups(rawGroupsData);
    } catch (e) {
      console.error("Error loading dashboard configuration data:", e);
      setVisibility({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.userId) return;

    loadConfig();
  }, [user?.userId]);

  // 2. Parse User Metadata & Handle Auth Redirection
  useEffect(() => {
    const userString = localStorage.getItem("currentUser");
    if (userString) {
      try {
        const userObj = JSON.parse(userString);
        setUserName(
          userObj.fullName
            ? userObj.fullName.replace(/\b\w/g, (c) => c.toUpperCase())
            : "null",
        );
      } catch {
        navigate("/login", { replace: true });
      }
    }
  }, [navigate]);

  const canView = useCallback(
    (key) => {
      if (!visibility || Object.keys(visibility).length === 0) return false;

      // Safely target screens or flat structure
      const screensMap = visibility?.screens || visibility;

      // Strict boolean check: MUST explicitly be true
      return screensMap?.[key]?.view === true;
    },
    [visibility],
  );

  const canEdit = useCallback(
    (key) => {
      if (!visibility || Object.keys(visibility).length === 0) return false;

      const screensMap = visibility?.screens || visibility;

      return screensMap?.[key]?.edit === true;
    },
    [visibility],
  );

  const handleLogout = () => {
    try {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
    } catch {}
    navigate("/login", { replace: true });
  };

  // Auth Guard
  if (!localStorage.getItem("currentUser")) {
    return <Navigate to="/login" replace />;
  }

  // Loading State
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen font-inter bg-[#E6F2F5]">
  //       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  //       <span className="ml-2 text-gray-600 text-sm sm:text-base">
  //         Loading Config...
  //       </span>
  //     </div>
  //   );
  // }

  const sidebarWidth = isHovered ? "w-[190px]" : "w-[56px]";

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-90 h-14 bg-white border-b border-gray-200 flex items-center">
        <TopBar fullName={userName} onLogout={handleLogout} />
      </div>

      {/* Main Container */}
      <div className="flex h-screen overflow-hidden bg-[#E6F2F5]">
        {/* Sidebar Container */}
        <div
          className={`group h-full transition-all duration-300 ${sidebarWidth}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <NavigationSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            visibility={visibility}
            biReports={biReports}
            reportGroups={reportGroups}
            canView={canView}
            canEdit={canEdit}
          />
        </div>

        {/* Main Content Area */}
        <div
          className="flex-1 h-full mt-4 overflow-y-auto"
          style={{ scrollbarGutter: "stable" }}
        >
          <Outlet
            context={{
              userId,
              visibility,
              biReports,
              reportGroups,
              canView,
              canEdit,
              loadConfig,
            }}
          />
        </div>
        {/* <ChatBot /> */}
      </div>
    </>
  );
};

export default Dashboard;
