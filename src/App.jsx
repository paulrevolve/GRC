import React, { useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useOutletContext,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import ChatBot from "./components/ChatBot";
import ManageGroupScreen from "./components/ManageGroup";
import ManageUsers from "./components/ManageUser";
import UserManagementSuite from "./components/ManageURG";
import DocGovApp from "./components/StaticUi";
import DocumentManagementModule, {
  DocumentDetailView,
  DocumentsView,
} from "./components/DocumentsView";
import { UploadDocumentView } from "./components/UploadDocumentView";
import { DocumentVersionUploadModal } from "./components/DocumentVersionUploadModal";
import { TasksView } from "./components/TasksView";

// Helper function to dynamically generate route slugs
const createReportConfig = (title, index) => {
  if (!title) return null;

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  return {
    id: `rep-${index + 1}`,
    datasetName: title,
    path: slug,
  };
};

function DynamicBIReportRoutes({ RequireAdmin }) {
  // 1. Get biReports from Dashboard's Outlet context
  const context = useOutletContext() || {};
  const biReports = context.biReports || [];

  // 2. Extract raw datasets directly from biReports
  const rawDatasets = useMemo(() => {
    const datasetNames = biReports
      .map((item) => item.datasetName || item.label || item.name)
      .filter(Boolean);

    return Array.from(new Set(datasetNames));
  }, [biReports]);

  // 3. Generate report route configs
  const reportRoutes = rawDatasets
    .map((name, index) => createReportConfig(name, index))
    .filter(Boolean);

  return (
    <Routes>
      {reportRoutes.map((report) => (
        <Route
          key={report.id}
          path={report.path}
          element={
            <RequireAdmin>
              <div className="mt-12 ml-2">
                <BIReports datasetName={report.datasetName} />
              </div>
            </RequireAdmin>
          }
        />
      ))}
    </Routes>
  );
}

function App() {
  const getCurrentUserContext = () => {
    try {
      const userString = localStorage.getItem("currentUser");
      if (!userString) return { userId: "", role: "" };
      const userObj = JSON.parse(userString);
      return {
        userId: userObj.userId ?? "",
        role: userObj.role?.toLowerCase() ?? "",
      };
    } catch {
      return { userId: "", role: "" };
    }
  };

  const { role } = getCurrentUserContext();

  const isAuthenticated = Boolean(role);
  const isAdmin = role === "admin";

  const RequireAuth = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  const RequireAdmin = ({ children }) =>
    isAdmin ? children : <Navigate to="/dashboard/project-budgeting" replace />;

  if (import.meta.env.VITE_CHECK === "production") {
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
  }

  function RequirePermission({
    screenKey,
    children,
    fallbackPath = "/dashboard/home",
  }) {
    const context = useOutletContext() || {};
    const canView = context.canView;

    // If permissions haven't loaded or view access is explicitly false
    if (canView && !canView(screenKey)) {
      return <Navigate to={fallbackPath} replace />;
    }

    return children;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard Layout and its Children */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          >
            {/* Default Index View */}
            <Route
              index
              element={
                <div className="flex items-center justify-center min-h-[80vh]">
                  <div className="max-w-md w-full text-center">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-900 text-transparent bg-clip-text">
                      GRC
                    </span>
                    <h1 className="text-2xl font-semibold text-gray-900 mt-4">
                      Document Management & Governance System
                    </h1>
                  </div>
                </div>
              }
            />

            <Route
              path="our-ai"
              element={
                <RequireAdmin>
                  <div className="mt-12 ml-2">
                    <ChatBot />
                  </div>
                </RequireAdmin>
              }
            />
            <Route
              path="home"
              element={
                // <RequireAdmin>
                <div className="mt-12 ml-2">
                  <DocGovApp />
                </div>
                // </RequireAdmin>
              }
            />
            <Route
              path="staticui"
              element={
                // <RequireAdmin>
                <div className="mt-12 ml-2">
                  <DocGovApp />
                </div>
                // </RequireAdmin>
              }
            />
            <Route
              path="create-user"
              element={
                // <RequireAdmin>
                <div className="mt-12 ml-2">
                  <ManageUsers />
                </div>
                // </RequireAdmin>
              }
            />
            <Route
              path="upload-documents"
              element={
                // <RequireAdmin>
                <div className="mt-12 ml-2">
                  <UploadDocumentView />
                </div>
                // </RequireAdmin>
              }
            />
            <Route
              path="documents-details"
              element={
                // <RequireAdmin>
                <div className="mt-12 ml-2">
                  <DocumentManagementModule />
                </div>
                // </RequireAdmin>
              }
            />
            <Route
              path="documents-version-upload"
              element={
                // <RequireAdmin>
                <div className="mt-12 ml-2">
                  <DocumentVersionUploadModal />
                </div>
                // </RequireAdmin>
              }
            />
            <Route
              path="tasks-view"
              element={
                // <RequireAdmin>
                <div className="mt-12 ml-2">
                  <TasksView />
                </div>
                // </RequireAdmin>
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <RequireAdmin>
                <div className="mt-12 ml-2">
                  <DocGovApp />
                </div>
              </RequireAdmin>
            }
          />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        className="!mt-14"
      />
      <ToastContainer
        containerId="alert-container"
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
        closeOnClick={false}
        className="!mt-14"
      />
    </>
  );
}

export default App;
