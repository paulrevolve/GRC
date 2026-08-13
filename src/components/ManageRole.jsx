import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Save,
  RotateCcw,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import axios from "axios";
import { backendUrl } from "./config";
import { useOutletContext } from "react-router-dom";

export default function ManageRoleScreen() {
  // --- Core States ---
  const [roles, setRoles] = useState([]);
  // const [reports, setReports] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  // const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  // Selection & Form State
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    reportIds: [],
    isSystem: false,
  });

  // Search Filters
  const [roleSearch, setRoleSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Toast Notification State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const { biReports = [] } = useOutletContext();

  /**
   * Generates a permanent, deterministic code based on dataset/report name.
   */
  const generateConsistentCode = (name, index = 0) => {
    if (!name) return `REP-${String(index + 1).padStart(3, "0")}`;
    const initials = name
      .trim()
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase())
      .filter(Boolean)
      .join("")
      .slice(0, 3);

    return `${initials || "REP"}-${String(index + 1).padStart(3, "0")}`;
  };

  // --- Initial Data Fetching ---
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await axios.get(`${backendUrl}/api/Roles`);
      const apiData = Array.isArray(response.data) ? response.data : [];

      const mappedRoles = apiData.map((item) => ({
        id: item.roleId,
        name: item.roleName,
      }));
      setRoles(mappedRoles);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      showToast("Failed to fetch roles list.", "error");
    } finally {
      setLoadingRoles(false);
    }
  };

  const defaultWorkspaceName = import.meta.env.VITE_WORKSPACE_NAME || "";

  // const fetchBiReports = async (workspace = defaultWorkspaceName) => {
  //   try {
  //     const response = await axios.get(
  //       `${backendUrl}/api/PowerBI/BiReport_List`,
  //       {
  //         params: { workspaceName: workspace },
  //       }
  //     );

  //     const apiData = Array.isArray(response.data) ? response.data : [];

  //     const dynamicallyLoadedReports = apiData.map((item, index) => {
  //       const reportName = item.datasetName || item.name || "Unnamed Report";
  //       const reportId = item.reportId || item.id || reportName;

  //       return {
  //         id: reportId,
  //         name: reportName,
  //         code: generateConsistentCode(reportName, index),
  //       };
  //     });

  //     setReports(dynamicallyLoadedReports);
  //   } catch (error) {
  //     console.error("Error fetching PowerBI reports:", error);
  //     showToast("Error loading PowerBI report mappings.", "error");
  //   }
  // };

  // Example static navigation screens list (or pass this from props / context)
  const NAVIGATION_SCREENS = [
    { id: "Add_Budget", name: "Add Budget" },
    { id: "E_V_Budget", name: "Edit/View Budget" },
    { id: "Bulk_Budgeting", name: "Bulk Budgeting" },
    { id: "Access_Management", name: "Access Management" },
    { id: "Create_User", name: "Manage Users" },
    { id: "Expense_Budgeting", name: "Expense Budget" },
    { id: "Quick_Budgeting", name: "Quick Budgeting" },
    { id: "Manage_Assumption", name: "Manage Assumptions" },
  ];

  const reports = useMemo(() => {
    // 1. Map PowerBI Reports -> Type: "Report"
    const formattedBiReports = biReports.map((item, index) => {
      const reportName = item.datasetName || item.name || "Unnamed Report";
      const reportId = String(item.reportId || item.id || reportName);

      return {
        id: reportId,
        name: reportName,
        code: reportId,
        type: "Report",
      };
    });

    // 2. Map Navigation Screens -> Type: "Screen"
    const formattedNavigationScreens = NAVIGATION_SCREENS.map((nav, index) => {
      const screenName = nav.name || "Unnamed Screen";
      const screenId = String(nav.id || screenName);

      return {
        id: screenId,
        name: screenName,
        code: screenId,
        type: "Screen",
      };
    });

    // 3. Combine both into a single access control list
    return [...formattedBiReports, ...formattedNavigationScreens];
  }, [biReports]);

  // const reports = useMemo(() => {
  //   return biReports.map((item, index) => {
  //     const reportName = item.datasetName || item.name || "Unnamed Report";
  //     const reportId = String(item.reportId || item.id || reportName);

  //     return {
  //       id: reportId,
  //       name: reportName,
  //       code: generateConsistentCode(reportName, index),
  //     };
  //   });
  // }, [biReports]);

  useEffect(() => {
    fetchRoles();
    // fetchBiReports();
  }, []);

  // --- Reset/Clear Form Handler ---
  const handleResetForm = () => {
    setSelectedRoleId(null);
    setFormData({
      id: null,
      name: "",
      description: "",
      reportIds: [],
      isSystem: false,
    });
  };

  const loadRolePermissions = async (roleId) => {
    // setLoadingPermissions(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/SecurityAccess/role-permissions/${roleId}`,
      );
      if (res.data && res.data.screens) {
        // const assignedCodesOrIds = Object.keys(res.data.screens);
        // const matchedReportIds = reports
        //   .filter(
        //     (rep) =>
        //       assignedCodesOrIds.includes(rep.code) ||
        //       assignedCodesOrIds.includes(rep.id),
        //   )
        //   .map((rep) => rep.id);
        // Extract all keys from response and match against both id and code
        const screensObj = res.data.screens;
        const matchedReportIds = reports
          .filter((rep) => {
            const screenPerm = screensObj[rep.code] || screensObj[rep.id];
            if (!screenPerm) return false;
            return Boolean(screenPerm.view ?? screenPerm.canView);
          })
          .map((rep) => rep.id);

        return matchedReportIds;
      }
    } catch (err) {
      console.error("Failed to fetch role permissions:", err);
      showToast("Could not load permissions for the selected role.", "error");
    } finally {
      // setLoadingPermissions(false);
    }
    return [];
  };

  const handleSelectRole = async (role, e) => {
    if (e) e.stopPropagation();
    setSelectedRoleId(role.id);
    const assignedReportIds = await loadRolePermissions(role.id);

    setFormData({
      id: role.id,
      name: role.name || "",
      description: role.description || "",
      reportIds: assignedReportIds,
      isSystem: role.isSystem || false,
    });
  };

  const handleToggleSelectAll = () => {
    const filteredIds = filteredReports.map((r) => r.id);
    const currentReportIds = Array.isArray(formData.reportIds)
      ? formData.reportIds
      : [];

    const areAllFilteredSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) => currentReportIds.includes(id));

    if (areAllFilteredSelected) {
      setFormData((prev) => ({
        ...prev,
        reportIds: prev.reportIds.filter((id) => !filteredIds.includes(id)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        reportIds: Array.from(new Set([...prev.reportIds, ...filteredIds])),
      }));
    }
  };

  const handleToggleReport = (reportId) => {
    setFormData((prev) => {
      const currentReportIds = Array.isArray(prev.reportIds)
        ? prev.reportIds
        : [];
      const exists = currentReportIds.includes(reportId);

      return {
        ...prev,
        reportIds: exists
          ? currentReportIds.filter((id) => id !== reportId)
          : [...currentReportIds, reportId],
      };
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Role name is required.", "error");
      return;
    }

    setIsSaving(true);
    let currentRoleId = typeof formData.id === "number" ? formData.id : 0;

    try {
      // Step 1: Call Add Role API ONLY IF creating a new role
      if (!selectedRoleId) {
        const roleApiPayload = {
          roleId: 0,
          roleName: formData.name.trim(),
        };

        const roleRes = await axios.post(
          `${backendUrl}/api/Roles`,
          roleApiPayload,
        );

        if (roleRes.data?.roleId) {
          currentRoleId = roleRes.data.roleId;
        }
      }

      const selectedIdsSet = new Set(formData.reportIds.map(String));

      // Map ALL items (both Reports & NAVIGATION_SCREENS)
      const screensArray = reports.map((report) => {
        const isSelected = selectedIdsSet.has(String(report.id));

        return {
          screenCode: String(report.code || report.id),
          canView: isSelected,
          canEdit: isSelected,
        };
      });

      // // Step 2: Map selected report IDs to screens array format
      // const screensArray = formData.reportIds.map((repId) => {
      //   const report = reports.find((r) => r.id === repId);
      //   const code = report ? report.code : String(repId);

      //   return {
      //     screenCode: code,
      //     canView: true,
      //     canEdit: true,
      //   };
      // });

      const permissionsPayload = {
        roleId: currentRoleId,
        screens: screensArray,
        fields: [],
      };

      // Step 3: Post permissions using array payload schema
      await axios.post(
        `${backendUrl}/api/SecurityAccess/role-permissions/bulk`,
        permissionsPayload,
      );

      showToast(
        selectedRoleId
          ? "Role mappings updated successfully!"
          : "Role created successfully!",
      );
      await fetchRoles(); // Refresh roles list
      handleResetForm();
    } catch (err) {
      console.error("Failed to save role or role permissions:", err);
      showToast(
        err.response?.data?.message || "Error saving role settings.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (roleId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    setDeletingRoleId(roleId);
    try {
      await axios.delete(`${backendUrl}/api/Roles/${roleId}`);
      showToast("Role deleted successfully.");
      await fetchRoles();
      if (selectedRoleId === roleId) {
        handleResetForm();
      }
    } catch (err) {
      console.error("Failed to delete role:", err);
      showToast("Failed to delete the selected role.", "error");
    } finally {
      setDeletingRoleId(null);
    }
  };

  // --- Filter Logics ---
  const currentRoles = Array.isArray(roles) ? roles : [];

  const filteredRoles = currentRoles.filter(
    (r) =>
      r.name?.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.description?.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  // const filteredReports = reports.filter(
  //   (r) =>
  //     r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
  //     r.code.toLowerCase().includes(reportSearch.toLowerCase()),
  // );

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.code.toLowerCase().includes(reportSearch.toLowerCase());

    const matchesType =
      typeFilter === "ALL" ||
      r?.type?.toLowerCase() === typeFilter?.toLowerCase();

    return matchesSearch && matchesType;
  });

  const filteredReportIds = filteredReports.map((r) => r.id);
  const selectedFilteredCount = filteredReportIds.filter((id) =>
    formData.reportIds.includes(id),
  ).length;

  const isAllSelected =
    filteredReportIds.length > 0 &&
    selectedFilteredCount === filteredReportIds.length;
  const isIndeterminate =
    selectedFilteredCount > 0 &&
    selectedFilteredCount < filteredReportIds.length;

  return (
    <div className="w-full bg-slate-50 text-slate-700 text-xs antialiased relative">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded shadow-lg border text-xs font-semibold transition-all transform animate-in fade-in slide-in-from-top-2 ${
            toast.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} className="text-red-500" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-500" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-auto mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-4">
        <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2">
          <Shield size={14} className="text-[#0F3A46]" />
          <span className="font-bold text-slate-800 text-[11px]">
            Manage Roles
          </span>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start mt-2">
          {/* LEFT PANEL: Role Directory */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] tracking-wider">
                Role Directory
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Total: {filteredRoles.length}
              </span>
            </div>

            {/* Filter Input */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded px-2 h-7 outline-none bg-white focus:border-slate-400"
              />
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {loadingRoles ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                  <Loader2 size={20} className="animate-spin text-[#0F3A46]" />
                  <span className="text-[11px] font-medium">
                    Loading roles...
                  </span>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="text-center py-10 text-slate-400 italic text-[11px]">
                  No roles found.
                </div>
              ) : (
                filteredRoles.map((role) => {
                  const isSelected = role.id === selectedRoleId;
                  const isDeleting = deletingRoleId === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={(e) => handleSelectRole(role, e)}
                      className={`p-2.5 rounded border transition-all cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? "bg-slate-100 border-[#0F3A46] shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                          <Shield size={12} className="text-[#0F3A46]" />
                          {role.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleSelectRole(role, e)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded"
                          title="Edit Role"
                          disabled={isDeleting}
                        >
                          <Edit2 size={12} />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={(e) => handleDeleteRole(role.id, e)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete Role"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2
                                size={12}
                                className="animate-spin text-red-500"
                              />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Always-Visible Form */}
          <div className="md:col-span-9 bg-white border border-slate-200 rounded flex flex-col h-[560px] relative">
            {/* Loading Overlay when loading role permissions */}
            {/* {loadingPermissions && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center space-y-2">
                <Loader2 size={24} className="animate-spin text-[#0F3A46]" />
                <span className="text-[11px] font-semibold text-slate-600">
                  Fetching permissions...
                </span>
              </div>
            )} */}

            <form onSubmit={handleSaveRole} className="flex flex-col h-full">
              {/* Form Action Header */}
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <div className="flex gap-1 item-center">
                  <span className="font-bold text-slate-700 text-[11px] tracking-wider flex items-center gap-1.5">
                    <Shield size={13} className="text-[#0F3A46]" />
                    {selectedRoleId
                      ? "Edit Role & Access"
                      : "Create Role & Access"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    disabled={isSaving}
                    className="px-2 py-1 bg-slate-100 cursor-pointer hover:bg-slate-200 text-slate-600 font-semibold rounded text-[11px]"
                  >
                    {/* <RotateCcw size={12} /> */}
                    <span>Clear</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-2.5 py-1 bg-[#0F3A46] cursor-pointer hover:bg-[#164e5e] text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={12} />
                        <span>
                          {selectedRoleId ? "Update Role" : "Create Role"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Inline Role Field */}
              <div className="p-3 bg-slate-50/50 border-b border-slate-200 grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-0.5">
                    Role Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compliance Officer"
                    disabled={!!selectedRoleId}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded px-2 h-8 outline-none focus:border-slate-400 bg-white"
                  />
                </div>
              </div>

              {/* Assigned Reports Table Header */}
              <div className="px-3 py-1.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-600 text-[10px] tracking-wider">
                  Select & Assign Reports ({formData.reportIds.length} Selected)
                </span>

                <div className="flex items-center gap-2">
                  {/* Type Filter Dropdown */}
                  <div className="flex items-center gap-1">
                    <Filter size={12} className="text-slate-400" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded px-2 h-6 outline-none bg-white focus:border-slate-400 font-medium text-slate-700"
                    >
                      <option value="ALL">All Types</option>
                      <option value="Report">Report</option>
                      <option value="Screen">Screen</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Filter reports..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="text-xs border border-slate-200 rounded px-2 h-6 w-48 outline-none bg-white focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Assigned Reports Checklist Grid */}
              {/* <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 tracking-wider">
                      <th className="px-3 py-1.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isIndeterminate;
                          }}
                          onChange={handleToggleSelectAll}
                          className="rounded text-[#0F3A46] focus:ring-0 cursor-pointer align-middle"
                          title={isAllSelected ? "Deselect All" : "Select All"}
                        />
                      </th>
                      <th className="px-3 py-1.5">Report Code</th>
                      <th className="px-3 py-1.5">Report Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredReports.map((rep) => {
                      const isAssigned = formData.reportIds.includes(rep.id);
                      return (
                        <tr
                          key={rep.id}
                          onClick={() => handleToggleReport(rep.id)}
                          className={`cursor-pointer transition-colors ${
                            isAssigned
                              ? "bg-indigo-50/40 hover:bg-indigo-50/70"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => {}}
                              className="rounded text-[#0F3A46] focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-1.5 font-mono font-bold text-slate-700">
                            {rep.code}
                          </td>
                          <td className="px-3 py-1.5 font-medium text-slate-800">
                            {rep.name}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div> */}
              {/* Checklist Grid with Name and Type Columns */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 tracking-wider">
                      <th className="px-3 py-1.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isIndeterminate;
                          }}
                          onChange={handleToggleSelectAll}
                          className="rounded text-[#0F3A46] focus:ring-0 cursor-pointer align-middle"
                          title={isAllSelected ? "Deselect All" : "Select All"}
                        />
                      </th>
                      <th className="px-3 py-1.5">Name</th>
                      <th className="px-3 py-1.5 w-28 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-8 text-slate-400 italic"
                        >
                          No matching items found.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((rep) => {
                        const isAssigned = formData.reportIds.includes(rep.id);
                        return (
                          <tr
                            key={rep.id}
                            onClick={() => handleToggleReport(rep.id)}
                            className={`cursor-pointer transition-colors ${
                              isAssigned
                                ? "bg-indigo-50/40 hover:bg-indigo-50/70"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="px-3 py-1.5 text-center">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => {}}
                                className="rounded text-[#0F3A46] focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-1.5 font-medium text-slate-800">
                              {rep.name}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                                  rep.type === "Screen"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {rep.type}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Summary & Action Bar */}
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">
                  Selected Reports: {formData.reportIds.length} /{" "}
                  {reports.length}
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
