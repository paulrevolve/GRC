import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  Users,
  FileText,
  RefreshCw,
  Save,
  Loader2,
  Filter,
} from "lucide-react";
import { backendUrl } from "./config";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

export default function ManageUserAccess() {
  const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const currentUserId = loggedInUser.userId || loggedInUser.id;

  const { biReports = [] } = useOutletContext();

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

  // Dynamic Reports State & Selection
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [rawUsers, setRawUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const headerCheckboxRef = useRef(null);

  const [typeFilter, setTypeFilter] = useState("ALL");

  // const reports = useMemo(() => {
  //   return biReports.map((item, index) => {
  //     const reportName = item.datasetName || item.name || "Unnamed Report";
  //     const reportId = String(item.reportId || item.id || reportName);

  //     return {
  //       id: reportId,
  //       name: reportName,
  //       code: generateCode(reportName, index),
  //     };
  //   });
  // }, [biReports]);
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

  // const filteredReports = useMemo(() => {
  //   const search = reportSearch.toLowerCase().trim();
  //   if (!search) return reports;

  //   return reports.filter(
  //     (r) =>
  //       r.name.toLowerCase().includes(search) ||
  //       r.code.toLowerCase().includes(search),
  //   );
  // }, [reports, reportSearch]);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.code.toLowerCase().includes(reportSearch.toLowerCase());

    const matchesType =
      typeFilter === "ALL" ||
      r?.type?.toLowerCase() === typeFilter?.toLowerCase();

    return matchesSearch && matchesType;
  });

  const isAllSelected = useMemo(() => {
    if (!filteredReports || filteredReports.length === 0) return false;
    return filteredReports.every((r) =>
      selectedReportIds.includes(String(r.id)),
    );
  }, [filteredReports, selectedReportIds]);

  const isSomeSelected = useMemo(() => {
    if (!filteredReports || filteredReports.length === 0) return false;
    return filteredReports.some((r) =>
      selectedReportIds.includes(String(r.id)),
    );
  }, [filteredReports, selectedReportIds]);

  // The header "select all" checkbox was created with a ref (presumably to
  // show an indeterminate state when only some reports are selected) but
  // nothing ever set `.indeterminate` on it, so it silently just looked
  // "unchecked" whenever the selection was partial. Wiring it up here.
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        isSomeSelected && !isAllSelected;
    }
  }, [isSomeSelected, isAllSelected]);

  const handleToggleSelectAll = () => {
    const filteredStrIds = filteredReports.map((r) => String(r.id));
    if (isAllSelected) {
      setSelectedReportIds((prev) =>
        prev.filter((id) => !filteredStrIds.includes(id)),
      );
    } else {
      setSelectedReportIds((prev) =>
        Array.from(new Set([...prev, ...filteredStrIds])),
      );
    }
  };

  const handleToggleReport = (reportId) => {
    const strId = String(reportId);
    setSelectedReportIds((prev) =>
      prev.includes(strId)
        ? prev.filter((id) => id !== strId)
        : [...prev, strId],
    );
  };

  const fetchUserAllowedReportIds = async (userId, reportsList = []) => {
    if (!userId) return [];

    try {
      // setLoading(true);
      const mappingRes = await axios.get(
        `${backendUrl}/api/SecurityAccess/GetUserPermissionsV1/${userId}`,
      );

      const mappedData = mappingRes.data?.data || mappingRes.data;
      let activeCodesOrIds = [];

      if (mappedData?.screens) {
        if (Array.isArray(mappedData.screens)) {
          activeCodesOrIds = mappedData.screens
            .filter((s) => s.view || s.edit || s.canView || s.canEdit)
            .map((s) =>
              String(
                s.screenCode || s.screenId || s.reportId || s.id || "",
              ).toLowerCase(),
            )
            .filter(Boolean);
        } else if (typeof mappedData.screens === "object") {
          activeCodesOrIds = Object.entries(mappedData.screens)
            .filter(([_, perm]) => {
              if (typeof perm === "boolean") return perm;
              return perm?.view || perm?.edit || perm?.canView || perm?.canEdit;
            })
            .map(([screenCode]) => String(screenCode).toLowerCase())
            .filter(Boolean);
        }
      }

      if (!reportsList || reportsList.length === 0) {
        return activeCodesOrIds;
      }

      const matchedReportIds = reportsList
        .filter((rpt) => {
          const reportIdStr = String(
            rpt.id || rpt.reportId || "",
          ).toLowerCase();
          const reportCodeStr = String(
            rpt.code || rpt.screenCode || rpt.datasetName || "",
          ).toLowerCase();

          return (
            (reportIdStr && activeCodesOrIds.includes(reportIdStr)) ||
            (reportCodeStr && activeCodesOrIds.includes(reportCodeStr))
          );
        })
        .map((rpt) => rpt.id || rpt.reportId);

      return matchedReportIds.length > 0 ? matchedReportIds : activeCodesOrIds;
    } catch (err) {
      console.error(
        `Failed to fetch report permissions for user ${userId}:`,
        err,
      );
      return [];
    } finally {
      // setLoading(false);
    }
  };

  // Fetches the plain user list only (no report hydration). Runs once on
  // mount. Report hydration is handled separately below so it can re-run
  // whenever `reports` becomes available/changes.
  const fetchRawUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/User`);
      const rawUserList = response.data?.data || response.data || [];
      const validUserList = Array.isArray(rawUserList) ? rawUserList : [];

      //   const eligibleUsers = validUserList.filter((u) => {
      //     const isCurrentLoggedInUser =
      //       String(u.userId || u.id) === String(currentUserId);
      //     const isAdmin = u.role?.toUpperCase() === "ADMIN";

      //     return !isCurrentLoggedInUser && !isAdmin;
      //   });

      setRawUsers(validUserList);

      // if (validUserList.length === 0) {
      setLoading(false);
      // }
    } catch (err) {
      console.warn("Could not fetch users from backend:", err);
      const savedUsers = JSON.parse(localStorage.getItem("app_users") || "[]");

      const eligibleSavedUsers = savedUsers.filter((u) => {
        const isCurrentLoggedInUser =
          String(u.userId || u.id) === String(currentUserId);
        const isAdmin = u.role?.toUpperCase() === "ADMIN";

        return !isCurrentLoggedInUser && !isAdmin;
      });

      setRawUsers(eligibleSavedUsers);

      if (eligibleSavedUsers.length === 0) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRawUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-hydrates each user's allowedReports whenever the raw user list or
  // the resolved `reports` list changes. This is the actual fix for the
  // race condition: if `biReports` arrives from the outlet context after
  // this component mounts, this effect re-runs and re-resolves everyone's
  // permissions against the now-available reports instead of leaving them
  // stuck with unmatched/raw codes forever.
  // useEffect(() => {
  //   if (rawUsers.length === 0) {
  //     setUsers([]);
  //     // setLoading(false);
  //     return;
  //   }

  //   let cancelled = false;

  //   (async () => {
  //     setLoading(true);
  //     try {
  //       const hydratedUsers = await Promise.all(
  //         rawUsers.map(async (u) => {
  //           const userId = u.userId || u.id;
  //           const allowedReports = await fetchUserAllowedReportIds(
  //             userId,
  //             reports,
  //           );
  //           return {
  //             ...u,
  //             allowedReports,
  //           };
  //         }),
  //       );

  //       if (!cancelled) {
  //         setUsers(hydratedUsers);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching allowed reports:", error);
  //     } finally {
  //       if (!cancelled) {
  //         setLoading(false);
  //       }
  //     }
  //   })();

  //   return () => {
  //     cancelled = true;
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [rawUsers, reports]);

  useEffect(() => {
    setUsers(rawUsers);
  }, [rawUsers]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setLoadingReports(true);

    try {
      const targetUserId = user.userId || user.id;

      const allowedIds = await fetchUserAllowedReportIds(targetUserId, reports);

      setSelectedReportIds((allowedIds || []).map(String));

      setUsers((prev) =>
        prev.map((u) =>
          String(u.userId || u.id) === String(targetUserId)
            ? { ...u, allowedReports: allowedIds }
            : u,
        ),
      );
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSaveUserMappings = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.warning("Please select a user first.");
      return;
    }

    // Guard against accidentally wiping out all of a user's report access
    // with an empty save — require explicit confirmation.
    if (selectedReportIds.length === 0) {
      const confirmClear = window.confirm(
        `No reports are selected. This will remove all report access for ${selectedUser.username}. Continue?`,
      );
      if (!confirmClear) return;
    }

    const targetUserId = selectedUser.userId || selectedUser.id;
    setIsSaving(true);

    try {
      const screenPermissions = reports.map((report) => {
        const isSelected = selectedReportIds.includes(String(report.id));
        return {
          screenCode: String(report.id),
          canView: isSelected,
          canEdit: isSelected,
        };
      });

      const bulkPermissionsPayload = {
        userId: Number(targetUserId),
        screens: screenPermissions,
        fields: [],
      };

      await axios.post(
        `${backendUrl}/api/SecurityAccess/user-permissions/bulk`,
        bulkPermissionsPayload,
      );

      // Update Local Users State
      const updatedUsers = users.map((u) => {
        const uId = u.userId || u.id;
        if (String(uId) === String(targetUserId)) {
          return { ...u, allowedReports: selectedReportIds };
        }
        return u;
      });

      setUsers(updatedUsers);
      localStorage.setItem("app_users", JSON.stringify(updatedUsers));
      toast.success(`Report mappings updated for ${selectedUser.username}!`);
    } catch (error) {
      console.error("Failed to save report mappings:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to process report mappings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.username?.toLowerCase().includes(search) ||
      u.fullName?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    );
  });

  const handleResetForm = () => {
    setSelectedUser(null); // Deselect the currently active user
    setSelectedReportIds([]); // Clear all checked report IDs
    setReportSearch(""); // Clear the report table filter input
  };

  const selectedUserId = selectedUser?.userId || selectedUser?.id;

  return (
    <div className="w-full bg-slate-50 text-slate-700 text-xs antialiased relative">
      <div className="max-w-auto mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-4">
        {/* HEADER */}
        <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#0F3A46]" />
            <span className="font-bold text-slate-800 text-[11px]">
              User Screen/Report Mappings
            </span>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start mt-2">
          {/* LEFT PANEL: User Directory */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] tracking-wider">
                Select User ({filteredUsers.length})
              </span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 h-7 w-40 outline-none bg-white focus:border-slate-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Username</th>
                    <th className="px-3 py-2 ">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-10 text-slate-400 italic"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2
                            size={20}
                            className="animate-spin text-[#0F3A46]"
                          />
                          <span className="text-[11px] font-medium">
                            Loading financial data...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : rawUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center py-10 text-slate-400 italic"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const uId = user.userId || user.id;
                      const isSelected = String(selectedUserId) === String(uId);

                      return (
                        <tr
                          key={uId}
                          onClick={() => handleSelectUser(user)}
                          className={`cursor-pointer  transition-colors border-b border-gray-200 ${
                            isSelected
                              ? "bg-teal-50/80 border-l-4 border-l-[#0F3A46]"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-3 py-2">
                            <div className="font-semibold text-slate-800">
                              {user.username}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-[12px] text-slate-500">
                              {user.role
                                ? user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1).toLowerCase()
                                : ""}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL: Mapped Reports Checklist */}
          <div className="md:col-span-9 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
            <form
              onSubmit={handleSaveUserMappings}
              className="flex flex-col h-full"
            >
              {/* Form Action Header */}
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-[#0F3A46]" />
                  <span className="font-bold text-slate-700 text-[11px] tracking-wider">
                    {selectedUser
                      ? `Mapped Reports: ${selectedUser.username}`
                      : "Mapped Reports (Select User to Edit)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    disabled={!selectedUser}
                    className="px-2 py-1 bg-slate-100 cursor-pointer hover:bg-slate-200 text-slate-600 font-semibold rounded text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !selectedUser}
                    className="px-2.5 py-1 bg-[#0F3A46] cursor-pointer hover:bg-[#164e5e] text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    <span>{isSaving ? "Saving..." : "Save Mappings"}</span>
                  </button>
                </div>
              </div>

              {/* Filter & Subheader */}
              <div className="px-3 py-1.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-600 text-[10px] tracking-wider">
                  Select & Assign Reports ({selectedReportIds.length} Selected)
                </span>

                <div className="flex items-center gap-2">
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
                    disabled={!selectedUser}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="text-xs border border-slate-200 rounded px-2 h-6 w-48 outline-none bg-white focus:border-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Reports Table Container */}
              <div className="flex-1 overflow-y-auto relative">
                {loadingReports ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                    <Loader2
                      size={20}
                      className="animate-spin text-[#0F3A46]"
                    />
                    <span className="text-[11px] font-medium">
                      Loading BI Reports...
                    </span>
                  </div>
                ) : (
                  <table
                    className={`w-full text-left border-collapse transition-opacity ${
                      !selectedUser
                        ? "opacity-50 pointer-events-none select-none"
                        : ""
                    }`}
                  >
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 tracking-wider z-10">
                      <tr>
                        <th className="px-3 py-1.5 w-10 text-center">
                          <input
                            type="checkbox"
                            ref={headerCheckboxRef}
                            checked={isAllSelected}
                            disabled={!selectedUser}
                            onChange={handleToggleSelectAll}
                            className="rounded text-[#0F3A46] focus:ring-0 cursor-pointer align-middle disabled:cursor-not-allowed"
                            title={
                              isAllSelected ? "Deselect All" : "Select All"
                            }
                          />
                        </th>
                        <th className="px-3 py-1.5">Name</th>
                        <th className="px-3 py-1.5 w-28">Type</th>
                        <th className="px-3 py-1.5 w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-10 text-slate-400 italic"
                          >
                            No reports available.
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((rep) => {
                          const strRepId = String(rep.id);
                          const isAssignedToCurrent =
                            selectedReportIds.includes(strRepId);

                          return (
                            <tr
                              key={rep.id}
                              onClick={() =>
                                selectedUser && handleToggleReport(rep.id)
                              }
                              className={`transition-colors ${
                                !selectedUser
                                  ? "cursor-not-allowed"
                                  : isAssignedToCurrent
                                    ? "bg-indigo-50/40 hover:bg-indigo-50/70 cursor-pointer"
                                    : "hover:bg-slate-50 cursor-pointer"
                              }`}
                            >
                              <td className="px-3 py-1.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isAssignedToCurrent}
                                  disabled={!selectedUser}
                                  onChange={() => {}}
                                  className="rounded text-[#0F3A46] focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="px-3 py-1.5 font-mono font-bold text-slate-700">
                                {rep.name}
                              </td>
                              <td className="px-3 py-1.5 font-medium text-slate-800">
                                {rep.type}
                              </td>
                              <td className="px-3 py-1.5">
                                {isAssignedToCurrent ? (
                                  <span className="inline-block text-emerald-600 font-medium">
                                    Mapped
                                  </span>
                                ) : (
                                  <span className="text-slate-400">
                                    Available
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer Summary Bar */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 font-medium flex justify-between">
                <span>Selected Reports: {selectedReportIds.length}</span>
                <span>Total Available: {reports.length}</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
