// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import {
//   UserPlus,
//   Edit2,
//   Trash2,
//   Key,
//   Save,
//   Users,
//   FileText,
//   CheckSquare,
//   Square,
//   RefreshCw,
// } from "lucide-react";
// import { backendUrl } from "./config";
// import { useOutletContext } from "react-router-dom";
// import { toast } from "react-toastify";

// const defaultWorkspaceName =
//   import.meta.env.VITE_WORKSPACE_NAME || "Revolve Dashboards";

// export default function ManageUsers() {
//   const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
//   const currentUserId = loggedInUser.userId || loggedInUser.id;
//   // --- Helper Functions ---
//   const generateCode = (name, index) => {
//     if (!name) return `REP-${String(index + 1).padStart(3, "0")}`;
//     const initials = name
//       .trim()
//       .split(/\s+/)
//       .map((word) => word[0]?.toUpperCase())
//       .filter(Boolean)
//       .join("")
//       .slice(0, 3);

//     const paddedNumber = String(index + 1).padStart(3, "0");
//     return `${initials || "REP"}-${paddedNumber}`;
//   };

//   const { biReports = [] } = useOutletContext();

//   // Normalizes different backend shapes for a "screens" permissions object
//   // into a flat array of active screen codes/ids. Handles:
//   //   - array of { screenCode | screenId | id, canView, edit }
//   //   - dictionary of { [screenCode]: boolean }
//   //   - dictionary of { [screenCode]: { canView, edit } }
//   const extractActiveScreenCodes = (screensData) => {
//     if (!screensData) return [];

//     if (Array.isArray(screensData)) {
//       return screensData
//         .filter((item) => item?.view || item?.edit)
//         .map((item) => item.screenCode ?? item.screenId ?? item.id)
//         .filter((v) => v !== undefined && v !== null);
//     }

//     if (typeof screensData === "object") {
//       return Object.entries(screensData)
//         .filter(([, perm]) => {
//           if (typeof perm === "boolean") return perm;
//           if (perm && typeof perm === "object") {
//             return Boolean(perm.view || perm.edit);
//           }
//           return false;
//         })
//         .map(([screenCode]) => screenCode);
//     }

//     return [];
//   };

//   // Matches a list of raw active screen codes against the loaded `reports`
//   // list, comparing case-insensitively against both report.id and report.code.
//   const matchReportIdsToCodes = (reportsList, activeCodes) => {
//     if (!activeCodes || activeCodes.length === 0) return [];
//     return reportsList
//       .filter((rpt) =>
//         activeCodes.some(
//           (code) =>
//             String(code).toLowerCase() === String(rpt.id).toLowerCase() ||
//             String(code).toLowerCase() === String(rpt.code).toLowerCase(),
//         ),
//       )
//       .map((rpt) => rpt.id);
//   };

//   // Form State
//   const [userNameInput, setUserNameInput] = useState("");
//   const [userFullNameInput, setUserFullNameInput] = useState("");
//   const [userEmailInput, setUserEmailInput] = useState("");
//   const [userRoleInput, setUserRoleInput] = useState("");
//   const [userIsActive, setUserIsActive] = useState(true);
//   const [selectedGroupId, setSelectedGroupId] = useState("");
//   const [userPasswordInput, setUserPasswordInput] = useState("");
//   const [userPasswordInputConfirm, setUserPasswordInputConfirm] = useState("");

//   // Dynamic Roles State
//   const [roles, setRoles] = useState([]);
//   const [loadingRoles, setLoadingRoles] = useState(false);

//   // Dynamic Reports State & Selection
//   // const [reports, setReports] = useState([]);
//   const [loadingReports, setLoadingReports] = useState(false);
//   const [selectedReportIds, setSelectedReportIds] = useState([]);

//   // Raw active screen codes fetched for the user currently being edited.
//   // Kept separate from selectedReportIds so we can re-resolve them against
//   // `reports` any time `reports` finishes loading (fixes the race condition
//   // where clicking Edit before reports had loaded left selections empty).
//   const [editingRawActiveCodes, setEditingRawActiveCodes] = useState(null);

//   // Data & UI State
//   const [users, setUsers] = useState([]);
//   const [availableGroups, setAvailableGroups] = useState([]);
//   const [editingUserId, setEditingUserId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//   // Password Modal State
//   const [passwordModalOpen, setPasswordModalOpen] = useState(false);
//   const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
//   const [expandedUserIds, setExpandedUserIds] = useState([]);

//   const toggleExpandUser = (userId) => {
//     setExpandedUserIds((prev) =>
//       prev.includes(userId)
//         ? prev.filter((id) => id !== userId)
//         : [...prev, userId],
//     );
//   };

//   // --- Dynamic API Fetching ---
//   const fetchRoles = async () => {
//     setLoadingRoles(true);
//     try {
//       const response = await axios.get(`${backendUrl}/api/Roles`);
//       const apiData = Array.isArray(response.data) ? response.data : [];

//       const mappedRoles = apiData.map((item) => ({
//         id: item.roleId,
//         name: item.roleName,
//       }));

//       setRoles(mappedRoles);
//       if (mappedRoles.length > 0 && !userRoleInput) {
//         setUserRoleInput(String(mappedRoles[0].id));
//       }
//     } catch (err) {
//       console.error("Failed to fetch roles:", err);
//     } finally {
//       setLoadingRoles(false);
//     }
//   };

//   const fetchUserAllowedReportIds = async (userId, reportsList = []) => {
//     if (!userId) return [];

//     try {
//       const mappingRes = await axios.get(
//         `${backendUrl}/api/SecurityAccess/GetUserPermissionsV1/${userId}`,
//       );

//       const mappedData = mappingRes.data?.data || mappingRes.data;
//       let activeCodesOrIds = [];

//       // 1. Extract active screen codes/IDs where view or edit is true
//       if (mappedData?.screens) {
//         if (Array.isArray(mappedData.screens)) {
//           activeCodesOrIds = mappedData.screens
//             .filter((s) => s.view || s.edit || s.canView || s.canEdit)
//             .map((s) =>
//               String(
//                 s.screenCode || s.screenId || s.reportId || s.id || "",
//               ).toLowerCase(),
//             )
//             .filter(Boolean);
//         } else if (typeof mappedData.screens === "object") {
//           activeCodesOrIds = Object.entries(mappedData.screens)
//             .filter(([_, perm]) => {
//               if (typeof perm === "boolean") return perm;
//               return perm?.view || perm?.edit || perm?.canView || perm?.canEdit;
//             })
//             .map(([screenCode]) => String(screenCode).toLowerCase())
//             .filter(Boolean);
//         }
//       }

//       // 2. Fallback: If reportsList isn't loaded yet, return the raw keys directly
//       if (!reportsList || reportsList.length === 0) {
//         return activeCodesOrIds;
//       }

//       // 3. Map active permissions against the local `reportsList`
//       const matchedReportIds = reportsList
//         .filter((rpt) => {
//           const reportIdStr = String(
//             rpt.id || rpt.reportId || "",
//           ).toLowerCase();
//           const reportCodeStr = String(
//             rpt.code || rpt.screenCode || rpt.datasetName || "",
//           ).toLowerCase();

//           return (
//             (reportIdStr && activeCodesOrIds.includes(reportIdStr)) ||
//             (reportCodeStr && activeCodesOrIds.includes(reportCodeStr))
//           );
//         })
//         .map((rpt) => rpt.id || rpt.reportId);

//       // If ID mapping missed due to format differences, return raw codes so badges don't break
//       return matchedReportIds.length > 0 ? matchedReportIds : activeCodesOrIds;
//     } catch (err) {
//       console.error(
//         `Failed to fetch report permissions for user ${userId}:`,
//         err,
//       );
//       return [];
//     }
//   };

//   // const fetchBiReports = async (workspace = defaultWorkspaceName) => {
//   //   setLoadingReports(true);
//   //   try {
//   //     const response = await axios.get(
//   //       `${backendUrl}/api/PowerBI/BiReport_List`,
//   //       {
//   //         params: { workspaceName: workspace },
//   //       },
//   //     );

//   //     const apiData = Array.isArray(response.data) ? response.data : [];

//   //     const dynamicallyLoadedReports = apiData.map((item, index) => {
//   //       const reportName = item.datasetName || item.name || "Unnamed Report";
//   //       const reportId = item.reportId || item.id || reportName;

//   //       return {
//   //         id: reportId,
//   //         name: reportName,
//   //         code: generateCode(reportName, index),
//   //       };
//   //     });

//   //     setReports(dynamicallyLoadedReports);
//   //     return response.data;
//   //   } catch (error) {
//   //     console.error("Error fetching PowerBI reports:", error);
//   //   } finally {
//   //     setLoadingReports(false);
//   //   }
//   // };

//   const reports = useMemo(() => {
//     return biReports.map((item, index) => {
//       const reportName = item.datasetName || item.name || "Unnamed Report";
//       const reportId = String(item.reportId || item.id || reportName);

//       return {
//         id: reportId,
//         name: reportName,
//         code: generateCode(reportName, index),
//       };
//     });
//   }, [biReports]);

//   const loadRolePermissions = async (roleId) => {
//     if (!roleId) return [];
//     try {
//       const res = await axios.get(
//         `${backendUrl}/api/SecurityAccess/role-permissions/${roleId}`,
//       );
//       const screensData = res.data?.data?.screens || res.data?.screens;
//       const activeCodes = extractActiveScreenCodes(screensData);
//       return matchReportIdsToCodes(reports, activeCodes);
//     } catch (err) {
//       console.error("Failed to fetch role permissions:", err);
//     }
//     return [];
//   };

//   // Load existing users, dynamic roles, and PowerBI reports on mount
//   useEffect(() => {
//     fetchUsers();
//     fetchRoles();
//     // fetchBiReports();

//     const savedGroups = JSON.parse(localStorage.getItem("app_groups") || "[]");
//     if (savedGroups.length > 0) {
//       setAvailableGroups(savedGroups);
//     }
//   }, []);

//   // Whenever `reports` finishes loading (or changes), re-resolve any pending
//   // raw active codes from the currently-edited user into selectedReportIds.
//   // This is what fixes selections showing up empty when Edit is clicked
//   // before the reports list has finished loading.
//   useEffect(() => {
//     if (!editingRawActiveCodes || editingRawActiveCodes.length === 0) return;
//     if (reports.length === 0) return;

//     const matched = matchReportIdsToCodes(reports, editingRawActiveCodes);
//     if (matched.length > 0) {
//       setSelectedReportIds(matched);
//     }
//   }, [reports, editingRawActiveCodes]);

//   // Sync role-based report presets whenever userRoleInput changes
//   const handleRoleChange = async (newRoleId) => {
//     setUserRoleInput(newRoleId);
//     if (!editingUserId) {
//       const defaultRoleReportIds = await loadRolePermissions(newRoleId);
//       if (defaultRoleReportIds.length > 0) {
//         setSelectedReportIds(defaultRoleReportIds);
//       }
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       // 1. Get current logged-in user ID from localStorage
//       const loggedInUser = JSON.parse(
//         localStorage.getItem("currentUser") || "{}",
//       );
//       const currentUserId = loggedInUser.userId || loggedInUser.id;

//       const response = await axios.get(`${backendUrl}/api/User`);
//       const rawUserList = response.data?.data || response.data || [];
//       const validUserList = Array.isArray(rawUserList) ? rawUserList : [];

//       // 2. Filter out Admin users and Current Logged-In User BEFORE fetching permissions
//       const eligibleUsers = validUserList.filter((u) => {
//         const isCurrentLoggedInUser =
//           String(u.userId || u.id) === String(currentUserId);
//         const isAdmin = u.role?.toUpperCase() === "ADMIN";

//         return !isCurrentLoggedInUser;
//       });

//       // 3. Hydrate ONLY the remaining eligible users with allowedReports
//       const hydratedUsers = await Promise.all(
//         eligibleUsers.map(async (u) => {
//           const userId = u.userId || u.id;
//           const allowedReports = await fetchUserAllowedReportIds(
//             userId,
//             reports,
//           );

//           console.log(allowedReports);
//           return {
//             ...u,
//             allowedReports,
//           };
//         }),
//       );

//       setUsers(hydratedUsers);
//     } catch (err) {
//       console.warn(
//         "Could not fetch users from backend, loading local fallback:",
//         err,
//       );
//       const savedUsers = JSON.parse(localStorage.getItem("app_users") || "[]");

//       const loggedInUser = JSON.parse(
//         localStorage.getItem("currentUser") || "{}",
//       );
//       const currentUserId = loggedInUser.userId || loggedInUser.id;

//       // Filter fallback list as well
//       const eligibleSavedUsers = savedUsers.filter((u) => {
//         const isCurrentLoggedInUser =
//           String(u.userId || u.id) === String(currentUserId);
//         const isAdmin = u.role?.toUpperCase() === "ADMIN";

//         return !isCurrentLoggedInUser && !isAdmin;
//       });

//       const hydratedSavedUsers = await Promise.all(
//         eligibleSavedUsers.map(async (u) => {
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

//       setUsers(hydratedSavedUsers);
//     }
//   };

//   const resetForm = () => {
//     setUserNameInput("");
//     setUserFullNameInput("");
//     setUserEmailInput("");
//     setUserPasswordInput("");
//     setUserRoleInput(roles.length > 0 ? String(roles[0].id) : "");
//     setUserIsActive(true);
//     setSelectedGroupId("");
//     setSelectedReportIds([]);
//     setEditingRawActiveCodes(null);
//     setEditingUserId(null);
//   };

//   const handleGroupChange = (groupId) => {
//     setSelectedGroupId(groupId);
//     if (groupId) {
//       const groupObj = availableGroups.find(
//         (g) => String(g.id) === String(groupId),
//       );
//       if (groupObj && Array.isArray(groupObj.reports)) {
//         const merged = Array.from(
//           new Set([...selectedReportIds, ...groupObj.reports]),
//         );
//         setSelectedReportIds(merged);
//       }
//     }
//   };

//   const toggleReportSelection = (reportId) => {
//     if (userNameInput !== "") {
//       setSelectedReportIds((prev) =>
//         prev.includes(reportId)
//           ? prev.filter((id) => id !== reportId)
//           : [...prev, reportId],
//       );
//     }
//   };

//   const handleSelectAllReports = () => {
//     if (selectedReportIds.length === reports.length) {
//       setSelectedReportIds([]);
//     } else {
//       setSelectedReportIds(reports.map((r) => r.id));
//     }
//   };

//   const handleSaveUser = async (e) => {
//     e.preventDefault();

//     if (!userNameInput.trim() || !userEmailInput.trim()) {
//       toast.warning("Please fill in required fields (Username & Email).");
//       return;
//     }

//     if (!editingUserId && !userPasswordInput.trim()) {
//       toast.warning("Please enter a password for the new user.");
//       return;
//     }

//     setIsSaving(true);

//     // Parse numerical role ID accurately
//     const numericRoleId = userRoleInput ? Number(userRoleInput) : 0;

//     try {
//       let targetUserId = editingUserId;
//       let savedUser;

//       // --- STEP 1: CREATE OR UPDATE USER ACCOUNT ---
//       if (editingUserId) {
//         // Body payload tailored for PUT /api/User/{id}
//         const updatePayload = {
//           userId: Number(editingUserId),
//           fullName: userFullNameInput.trim(),
//           email: userEmailInput.trim(),
//           roleId: numericRoleId,
//           isActive: Boolean(userIsActive),
//         };

//         const userRes = await axios.put(
//           `${backendUrl}/api/User/${editingUserId}`,
//           updatePayload,
//         );
//         savedUser = userRes.data?.data ||
//           userRes.data || {
//             ...updatePayload,
//             username: userNameInput.trim(),
//           };
//       } else {
//         // Payload for POST /api/User (New User Creation)
//         const selectedGroupObj = availableGroups.find(
//           (g) => String(g.id) === String(selectedGroupId),
//         );
//         const selectedRoleObj = roles.find(
//           (r) => String(r.id) === String(userRoleInput),
//         );

//         const createPayload = {
//           userId: 0,
//           username: userNameInput.trim(),
//           fullName: userFullNameInput.trim(),
//           email: userEmailInput.trim(),
//           password: userPasswordInput.trim(),
//           isFirstLogin: true,
//           role: selectedRoleObj
//             ? selectedRoleObj.name
//             : String(userRoleInput || ""),
//           roleId: numericRoleId,
//           isActive: Boolean(userIsActive),
//           groupId: selectedGroupId ? Number(selectedGroupId) : null,
//           groupName: selectedGroupObj
//             ? selectedGroupObj.groupName
//             : "Direct Mapping",
//           allowedReports: selectedReportIds,
//         };

//         const userRes = await axios.post(
//           `${backendUrl}/api/User`,
//           createPayload,
//         );
//         savedUser = userRes.data?.data || userRes.data || createPayload;
//         targetUserId = savedUser.userId || savedUser.id;
//       }

//       // --- STEP 2: BULK SAVE REPORT PERMISSIONS ---
//       // Sends all reports: selected reports get canView/edit = true, unchecked get false
//       if (targetUserId) {
//         const screenPermissions = reports.map((report) => {
//           const isSelected = selectedReportIds.includes(report.id);
//           return {
//             screenCode: String(report.id),
//             canView: isSelected,
//             canEdit: isSelected,
//           };
//         });

//         const bulkPermissionsPayload = {
//           userId: Number(targetUserId),
//           screens: screenPermissions,
//           fields: [],
//         };

//         await axios.post(
//           `${backendUrl}/api/SecurityAccess/user-permissions/bulk`,
//           bulkPermissionsPayload,
//         );
//       }

//       // Attach allowedReports to local UI state update
//       savedUser.allowedReports = selectedReportIds;
//       savedUser.username = userNameInput.trim();

//       // --- STEP 3: UPDATE LOCAL UI STATE ---
//       let updatedUsers = [];
//       if (editingUserId) {
//         updatedUsers = users.map((u) =>
//           u.userId === editingUserId ? { ...u, ...savedUser } : u,
//         );
//       } else {
//         updatedUsers = [...users, savedUser];
//       }

//       setUsers(updatedUsers);
//       localStorage.setItem("app_users", JSON.stringify(updatedUsers));

//       // Re-fetch users from API to guarantee freshness
//       fetchUsers();

//       resetForm();
//       toast.success(
//         `User ${editingUserId ? "updated" : "created"} successfully!`,
//       );
//     } catch (error) {
//       console.error("Failed to save user or report mappings:", error);
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to process user and report mappings.",
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   //   const handleEdit = async (user) => {
//   //   // Populate standard user input fields
//   //   setEditingUserId(user.userId);
//   //   setUserNameInput(user.username || "");
//   //   setUserFullNameInput(user.fullName || "");
//   //   setUserEmailInput(user.email || "");
//   //   setUserRoleInput(String(user.roleId || user.role || ""));
//   //   setUserIsActive(user.isActive ?? true);
//   //   setSelectedGroupId(user.groupId ? String(user.groupId) : "");

//   //   // Reset current selection while fetching to avoid showing stale data from previous edits
//   //   setSelectedReportIds([]);

//   //   try {
//   //     // 1. Fetch user permissions directly from the Security API
//   //     const mappingRes = await axios.get(
//   //       `${backendUrl}/api/SecurityAccess/GetUserPermissionsV1/${user.userId}`
//   //     );

//   //     const mappedData = mappingRes.data?.data || mappingRes.data;
//   // console.log(mappedData)
//   //     let activeCodesOrIds = [];

//   //     // 2. Extract screen codes/IDs where canView is true (or canEdit is true)
//   //     if (mappedData?.screens) {
//   //       if (Array.isArray(mappedData.screens)) {
//   //         // Handle array response: [{ screenCode: "ER-001", canView: true }, ...]
//   //         activeCodesOrIds = mappedData.screens
//   //           .filter((s) => s.view || s.edit)
//   //           .map((s) => String(s.screenCode || s.screenId || s.id).toLowerCase());
//   //       } else if (typeof mappedData.screens === "object") {
//   //         // Handle dictionary response: { "ER-001": { view: true }, "1": { view: true } }
//   //         activeCodesOrIds = Object.entries(mappedData.screens)
//   //           .filter(([_, perm]) => {
//   //             if (typeof perm === "boolean") return perm;
//   //             return perm?.canView || perm?.edit;
//   //           })
//   //           .map(([screenCode]) => String(screenCode).toLowerCase());
//   //       }
//   //     }

//   //     // 3. Map the active screen codes/IDs returned by the Security API back to your `reports` list
//   //     const matchedReportIds = reports
//   //       .filter((rpt) => {
//   //         const reportIdStr = String(rpt.id).toLowerCase();
//   //         const reportCodeStr = String(rpt.code || rpt.screenCode || "").toLowerCase();

//   //         return (
//   //           activeCodesOrIds.includes(reportIdStr) ||
//   //           (reportCodeStr && activeCodesOrIds.includes(reportCodeStr))
//   //         );
//   //       })
//   //       .map((rpt) => rpt.id);

//   //     // Set the selected report checkboxes based strictly on API results
//   //     setSelectedReportIds(matchedReportIds);

//   //   } catch (err) {
//   //     console.error("Failed to fetch report permissions from Security API:", err);
//   //     setSelectedReportIds([]); // Default to empty selection if API call fails
//   //   }
//   // };

//   const handleEdit = async (user) => {
//     // Populate standard user input fields
//     setEditingUserId(user.userId);
//     setUserNameInput(user.username || "");
//     setUserFullNameInput(user.fullName || "");
//     setUserEmailInput(user.email || "");
//     setUserRoleInput(String(user.roleId || user.role || ""));
//     setUserIsActive(user.isActive ?? true);
//     setSelectedGroupId(user.groupId ? String(user.groupId) : "");

//     // Reset current selection while fetching to avoid showing stale data
//     setSelectedReportIds([]);

//     // Use helper function or fallback to pre-populated allowedReports if already present
//     let allowedIds = user.allowedReports;
//     if (!allowedIds) {
//       allowedIds = await fetchUserAllowedReportIds(user.userId, reports);
//     }

//     setSelectedReportIds(allowedIds);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       try {
//         await axios.delete(`${backendUrl}/api/User/${id}`);
//       } catch (err) {
//         console.warn("Delete API call failed, removing locally:", err);
//       }

//       const updated = users.filter((u) => u.userId !== id);
//       setUsers(updated);
//       localStorage.setItem("app_users", JSON.stringify(updated));
//       if (editingUserId === id) resetForm();
//     }
//   };

//   // --- Reset Password Handlers ---
//   const handleOpenPasswordModal = (user) => {
//     setSelectedUserForPassword(user);
//     setNewPassword("");
//     setConfirmPassword("");
//     setPasswordError("");
//     setPasswordModalOpen(true);
//   };

//   const handleClosePasswordModal = () => {
//     setPasswordModalOpen(false);
//     setSelectedUserForPassword(null);
//     setNewPassword("");
//     setConfirmPassword("");
//     setPasswordError("");
//   };

//   const handleResetPasswordSubmit = async (e) => {
//     e.preventDefault();

//     if (!newPassword.trim()) {
//       setPasswordError("Password cannot be empty.");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setPasswordError("Passwords do not match.");
//       return;
//     }

//     setIsSubmittingPassword(true);
//     setPasswordError("");

//     try {
//       const response = await fetch(
//         `${backendUrl}/api/User/${selectedUserForPassword.userId}/reset-password`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ newPassword }),
//         },
//       );

//       if (response.ok || response.status === 204) {
//         toast.success(
//           `Password reset successfully for ${selectedUserForPassword.username}`,
//         );
//         handleClosePasswordModal();
//       } else {
//         const errData = await response.text();
//         setPasswordError(errData || "Failed to reset password.");
//       }
//     } catch (err) {
//       console.error("Password reset error:", err);
//       setPasswordError("Server communication error.");
//     } finally {
//       setIsSubmittingPassword(false);
//     }
//   };

//   console.log(users);

//   const filteredUsers = users.filter((u) => {
//     const search = searchTerm.toLowerCase();
//     return (
//       u.username?.toLowerCase().includes(search) ||
//       u.fullName?.toLowerCase().includes(search) ||
//       u.email?.toLowerCase().includes(search)
//     );
//   });

//   const selectedRoleObj = roles.find(
//     (r) => String(r.id) === String(userRoleInput),
//   );
//   const isSelectedRoleAdmin = selectedRoleObj?.name?.toUpperCase() === "ADMIN";

//   return (
//     <div className="w-full bg-slate-50 text-slate-700 text-xs antialiased relative ">
//       <div className="max-w-auto mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-4">
//         <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Users size={14} className="text-[#0F3A46]" />
//             <span className="font-bold text-slate-800 text-[11px]">
//               Manage Users & PowerBI Report Mappings
//             </span>
//           </div>
//           {/* <button
//             onClick={() => fetchBiReports()}
//             disabled={loadingReports}
//             className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-[#0F3A46] bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs"
//           >
//             <RefreshCw
//               size={10}
//               className={loadingReports ? "animate-spin" : ""}
//             />
//             Reload BI Reports
//           </button> */}
//         </div>

//         <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start mt-2">
//           {/* LEFT PANEL: Form */}
//           <div className="md:col-span-3 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
//             <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
//               <span className="font-bold text-slate-700 text-[11px] tracking-wider">
//                 Manage user ({filteredUsers.length})
//               </span>
//               <input
//                 type="text"
//                 placeholder="Search users..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="text-xs border border-slate-200 rounded px-2 h-7 w-44 outline-none bg-white focus:border-slate-400"
//               />
//             </div>

//             <div className="flex-1 overflow-y-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 tracking-wider">
//                     <th className="px-3 py-2">User Details</th>
//                     <th className="px-3 py-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-[11px]">
//                   {filteredUsers.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan="4"
//                         className="text-center py-10 text-slate-400 italic"
//                       >
//                         No users found.
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredUsers.map((user) => (
//                       <tr
//                         key={user.userId}
//                         className="hover:bg-slate-50 transition-colors"
//                       >
//                         <td className="px-3 py-2">
//                           <div className="font-semibold text-slate-800">
//                             {user.username}
//                           </div>
//                           <div className="text-[10px] text-slate-400">
//                             {user.email}
//                           </div>
//                           {/* <div className="text-[10px] capitalize text-slate-400">
//                             {user.role}
//                           </div> */}
//                         </td>
//                         <td className="px-3 py-2">
//                           <div className="flex items-center gap-2 ">
//                             <button
//                               onClick={() => handleOpenPasswordModal(user)}
//                               className=" text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
//                               title="Reset Password"
//                             >
//                               <Key size={13} />
//                             </button>
//                             <button
//                               onClick={() => handleEdit(user)}
//                               className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
//                               title="Edit User & Access"
//                             >
//                               <Edit2 size={13} />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(user.userId)}
//                               className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
//                               title="Delete User"
//                             >
//                               <Trash2 size={13} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* RIGHT PANEL: User Directory */}
//           <div className="md:col-span-9 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
//             <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center gap-2">
//               <div className="flex gap-1 items-center">
//                 <UserPlus size={14} className="text-[#0F3A46]" />
//                 <span className="font-bold text-slate-700 text-[11px] tracking-wider">
//                   {editingUserId
//                     ? "Edit User & Access"
//                     : "Create User & Map Reports"}
//                 </span>
//               </div>
//               <div className="flex items-center justify-end gap-2  border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-[11px]"
//                 >
//                   Clear
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSaving}
//                   onClick={handleSaveUser}
//                   className="px-2.5 py-1 bg-[#0F3A46] hover:bg-[#164e5e] text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50"
//                 >
//                   {isSaving ? (
//                     <RefreshCw size={13} className="animate-spin" />
//                   ) : (
//                     <Save size={13} />
//                   )}
//                   <span>{editingUserId ? "Update User" : "Create User"}</span>
//                 </button>
//               </div>
//             </div>

//             <form className="p-4 space-y-4">
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                     Username <span className="text-red-400">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={userNameInput}
//                     onChange={(e) => setUserNameInput(e.target.value)}
//                     placeholder="e.g. jdoe"
//                     className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     value={userFullNameInput}
//                     onChange={(e) => setUserFullNameInput(e.target.value)}
//                     placeholder="e.g. John Doe"
//                     className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                   Email Address <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   required
//                   value={userEmailInput}
//                   onChange={(e) => setUserEmailInput(e.target.value)}
//                   placeholder="john.doe@company.com"
//                   className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
//                 />
//               </div>

//               {!editingUserId && (
//                 <>
//                   <div>
//                     <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                       Password <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                       type="password"
//                       required
//                       value={userPasswordInput}
//                       onChange={(e) => setUserPasswordInput(e.target.value)}
//                       placeholder="Enter account password"
//                       className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                       Confirm Password <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                       type="password"
//                       required
//                       value={userPasswordInputConfirm}
//                       onChange={(e) =>
//                         setUserPasswordInputConfirm(e.target.value)
//                       }
//                       placeholder="Enter account password"
//                       className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
//                     />
//                   </div>
//                 </>
//               )}

//               <div className="grid grid-cols-2 gap-3 items-center">
//                 {/* DYNAMIC ROLE SELECTOR */}
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                     Role <span className="text-red-400">*</span>
//                   </label>
//                   <select
//                     value={userRoleInput}
//                     onChange={(e) => handleRoleChange(e.target.value)}
//                     disabled={loadingRoles}
//                     className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46] bg-white disabled:bg-slate-100"
//                   >
//                     {loadingRoles ? (
//                       <option value="">Loading roles...</option>
//                     ) : roles.length === 0 ? (
//                       <option value="">No roles found</option>
//                     ) : (
//                       roles.map((r) => (
//                         <option key={r.id} value={r.id}>
//                           {r.name}
//                         </option>
//                       ))
//                     )}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                     Status <span className="text-red-400">*</span>
//                   </label>
//                   <select
//                     value={userIsActive ? "true" : "false"}
//                     onChange={(e) => setUserIsActive(e.target.value === "true")}
//                     className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46] bg-white"
//                   >
//                     <option value="true">Active</option>
//                     <option value="false">Inactive</option>
//                   </select>
//                 </div>
//               </div>

//               {/* DYNAMIC REPORT CHECKLIST */}
//               {/* {!isSelectedRoleAdmin && (
//                 <div className="border border-slate-200 rounded p-2.5 bg-slate-50/50">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
//                       <FileText size={13} className="text-[#0F3A46]" />
//                       Dynamic Reports ({selectedReportIds.length}/
//                       {reports.length})
//                     </span>
//                     <button
//                       type="button"
//                       onClick={handleSelectAllReports}
//                       className="text-[10px] text-[#0F3A46] font-semibold hover:underline"
//                     >
//                       {selectedReportIds.length === reports.length
//                         ? "Deselect All"
//                         : "Select All"}
//                     </button>
//                   </div>

//                   <div className="space-y-1.5 max-h-48 overflow-y-auto bg-white p-2 border border-slate-200 rounded">
//                     {loadingReports ? (
//                       <div className="text-center py-4 text-slate-400">
//                         Loading PowerBI reports...
//                       </div>
//                     ) : reports.length === 0 ? (
//                       <div className="text-center py-4 text-slate-400 italic">
//                         No reports available
//                       </div>
//                     ) : (
//                       reports.map((rpt) => {
//                         const isChecked = selectedReportIds.includes(rpt.id);
//                         return (
//                           <label
//                             key={rpt.id}
//                             onClick={() => toggleReportSelection(rpt.id)}
//                             className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-[11px] border transition-colors ${
//                               isChecked
//                                 ? "bg-teal-50/60 border-teal-200 text-teal-900"
//                                 : "bg-white border-transparent hover:bg-slate-50 text-slate-600"
//                             }`}
//                           >
//                             <div className="flex flex-col">
//                               <span className="font-medium">{rpt.name}</span>
//                               <span className="text-[9px] text-slate-400">
//                                 {rpt.code}
//                               </span>
//                             </div>
//                             {isChecked ? (
//                               <CheckSquare
//                                 size={14}
//                                 className="text-[#0F3A46]"
//                               />
//                             ) : (
//                               <Square size={14} className="text-slate-300" />
//                             )}
//                           </label>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>
//               )} */}
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* RESET PASSWORD MODAL FOR EXISTING USERS */}
//       {passwordModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//           <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-96 overflow-hidden">
//             <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
//               <span className="font-bold text-slate-700 text-xs flex items-center gap-2">
//                 <Key size={14} className="text-[#0F3A46]" />
//                 Reset Password
//               </span>
//               <button
//                 onClick={handleClosePasswordModal}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleResetPasswordSubmit} className="p-4">
//               <p className="text-xs text-slate-500 mb-4">
//                 Enter a new password for{" "}
//                 <strong className="text-slate-700">
//                   {selectedUserForPassword?.username}
//                 </strong>
//                 .
//               </p>

//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                     New Password
//                   </label>
//                   <input
//                     type="password"
//                     required
//                     value={newPassword}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
//                     Confirm Password
//                   </label>
//                   <input
//                     type="password"
//                     required
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
//                   />
//                 </div>
//               </div>

//               {passwordError && (
//                 <div className="mt-3 text-[11px] text-red-600 font-medium">
//                   {passwordError}
//                 </div>
//               )}

//               <div className="mt-5 flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={handleClosePasswordModal}
//                   className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-[11px]"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSubmittingPassword}
//                   className="px-3 py-1.5 bg-[#0F3A46] hover:bg-[#164e5e] text-white font-semibold rounded text-[11px] disabled:opacity-50"
//                 >
//                   {isSubmittingPassword ? "Resetting..." : "Reset Password"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  UserPlus,
  Edit2,
  Trash2,
  Key,
  Save,
  Users,
  FileText,
  CheckSquare,
  Square,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { backendUrl } from "./config";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

const defaultWorkspaceName =
  import.meta.env.VITE_WORKSPACE_NAME || "Revolve Dashboards";

// --- Validation helpers ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

// Requires at least one letter, one number, and one special character,
// so plain values like "Ayush" or "12345678" are rejected, but
// something like "Ayush$567" is accepted.
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]:;"'<>,.?/\\|~`]).{8,}$/;

const isValidEmail = (email) => EMAIL_REGEX.test(String(email).trim());
const isValidUsername = (username) =>
  USERNAME_REGEX.test(String(username).trim());
const isStrongPassword = (password) => PASSWORD_REGEX.test(String(password));

export default function ManageUsers() {
  // --- Helper Functions ---
  const generateCode = (name, index) => {
    if (!name) return `REP-${String(index + 1).padStart(3, "0")}`;
    const initials = name
      .trim()
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase())
      .filter(Boolean)
      .join("")
      .slice(0, 3);

    const paddedNumber = String(index + 1).padStart(3, "0");
    return `${initials || "REP"}-${paddedNumber}`;
  };

  const { biReports = [] } = useOutletContext();

  // Normalizes different backend shapes for a "screens" permissions object
  // into a flat array of active screen codes/ids. Handles:
  //   - array of { screenCode | screenId | id, canView, edit }
  //   - dictionary of { [screenCode]: boolean }
  //   - dictionary of { [screenCode]: { canView, edit } }
  const extractActiveScreenCodes = (screensData) => {
    if (!screensData) return [];

    if (Array.isArray(screensData)) {
      return screensData
        .filter((item) => item?.view || item?.edit)
        .map((item) => item.screenCode ?? item.screenId ?? item.id)
        .filter((v) => v !== undefined && v !== null);
    }

    if (typeof screensData === "object") {
      return Object.entries(screensData)
        .filter(([, perm]) => {
          if (typeof perm === "boolean") return perm;
          if (perm && typeof perm === "object") {
            return Boolean(perm.view || perm.edit);
          }
          return false;
        })
        .map(([screenCode]) => screenCode);
    }

    return [];
  };

  // Matches a list of raw active screen codes against the loaded `reports`
  // list, comparing case-insensitively against both report.id and report.code.
  const matchReportIdsToCodes = (reportsList, activeCodes) => {
    if (!activeCodes || activeCodes.length === 0) return [];
    return reportsList
      .filter((rpt) =>
        activeCodes.some(
          (code) =>
            String(code).toLowerCase() === String(rpt.id).toLowerCase() ||
            String(code).toLowerCase() === String(rpt.code).toLowerCase(),
        ),
      )
      .map((rpt) => rpt.id);
  };

  // Form State
  const [userNameInput, setUserNameInput] = useState("");
  const [userFullNameInput, setUserFullNameInput] = useState("");
  const [userEmailInput, setUserEmailInput] = useState("");
  const [userRoleInput, setUserRoleInput] = useState("");
  const [userIsActive, setUserIsActive] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [userPasswordInput, setUserPasswordInput] = useState("");
  const [userPasswordInputConfirm, setUserPasswordInputConfirm] = useState("");

  // Dynamic Roles State
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Reports State & Selection
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState([]);

  // Raw active screen codes fetched for the user currently being edited.
  // Kept separate from selectedReportIds so we can re-resolve them against
  // `reports` any time `reports` finishes loading (fixes the race condition
  // where clicking Edit before reports had loaded left selections empty).
  const [editingRawActiveCodes, setEditingRawActiveCodes] = useState(null);

  // Data & UI State
  const [users, setUsers] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [expandedUserIds, setExpandedUserIds] = useState([]);

  const toggleExpandUser = (userId) => {
    setExpandedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // --- Dynamic API Fetching ---
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
      if (mappedRoles.length > 0 && !userRoleInput) {
        setUserRoleInput(String(mappedRoles[0].id));
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUserAllowedReportIds = async (userId, reportsList = []) => {
    if (!userId) return [];

    try {
      const mappingRes = await axios.get(
        `${backendUrl}/api/SecurityAccess/GetUserPermissionsV1/${userId}`,
      );

      const mappedData = mappingRes.data?.data || mappingRes.data;
      let activeCodesOrIds = [];

      // 1. Extract active screen codes/IDs where view or edit is true
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

      // 2. Fallback: If reportsList isn't loaded yet, return the raw keys directly
      if (!reportsList || reportsList.length === 0) {
        return activeCodesOrIds;
      }

      // 3. Map active permissions against the local `reportsList`
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

      // If ID mapping missed due to format differences, return raw codes so badges don't break
      return matchedReportIds.length > 0 ? matchedReportIds : activeCodesOrIds;
    } catch (err) {
      console.error(
        `Failed to fetch report permissions for user ${userId}:`,
        err,
      );
      return [];
    }
  };

  const reports = useMemo(() => {
    return biReports.map((item, index) => {
      const reportName = item.datasetName || item.name || "Unnamed Report";
      const reportId = String(item.reportId || item.id || reportName);

      return {
        id: reportId,
        name: reportName,
        code: generateCode(reportName, index),
      };
    });
  }, [biReports]);

  const loadRolePermissions = async (roleId) => {
    if (!roleId) return [];
    try {
      const res = await axios.get(
        `${backendUrl}/api/SecurityAccess/role-permissions/${roleId}`,
      );
      const screensData = res.data?.data?.screens || res.data?.screens;
      const activeCodes = extractActiveScreenCodes(screensData);
      return matchReportIdsToCodes(reports, activeCodes);
    } catch (err) {
      console.error("Failed to fetch role permissions:", err);
    }
    return [];
  };

  // Load existing users, dynamic roles, and PowerBI reports on mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();

    const savedGroups = JSON.parse(localStorage.getItem("app_groups") || "[]");
    if (savedGroups.length > 0) {
      setAvailableGroups(savedGroups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever `reports` finishes loading (or changes), re-resolve any pending
  // raw active codes from the currently-edited user into selectedReportIds.
  // This is what fixes selections showing up empty when Edit is clicked
  // before the reports list has finished loading.
  useEffect(() => {
    if (!editingRawActiveCodes || editingRawActiveCodes.length === 0) return;
    if (reports.length === 0) return;

    const matched = matchReportIdsToCodes(reports, editingRawActiveCodes);
    if (matched.length > 0) {
      setSelectedReportIds(matched);
    }
  }, [reports, editingRawActiveCodes]);

  // Sync role-based report presets whenever userRoleInput changes
  const handleRoleChange = async (newRoleId) => {
    setUserRoleInput(newRoleId);
    if (!editingUserId) {
      const defaultRoleReportIds = await loadRolePermissions(newRoleId);
      if (defaultRoleReportIds.length > 0) {
        setSelectedReportIds(defaultRoleReportIds);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // 1. Get current logged-in user ID from localStorage
      const loggedInUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}",
      );
      const currentUserId = loggedInUser.userId || loggedInUser.id;

      const response = await axios.get(`${backendUrl}/api/User`);
      const rawUserList = response.data?.data || response.data || [];
      const validUserList = Array.isArray(rawUserList) ? rawUserList : [];

      // 2. Filter out Admin users and Current Logged-In User BEFORE fetching permissions
      // const eligibleUsers = validUserList.filter((u) => {
      //   const isCurrentLoggedInUser =
      //     String(u.userId || u.id) === String(currentUserId);
      //   const isAdmin = u.role?.toUpperCase() === "ADMIN";

      //   return !isCurrentLoggedInUser && !isAdmin;
      // });

      // 3. Hydrate ONLY the remaining eligible users with allowedReports
      const hydratedUsers = await Promise.all(
        validUserList.map(async (u) => {
          const userId = u.userId || u.id;
          const allowedReports = await fetchUserAllowedReportIds(
            userId,
            reports,
          );

          return {
            ...u,
            allowedReports,
          };
        }),
      );

      setUsers(hydratedUsers);
    } catch (err) {
      console.warn(
        "Could not fetch users from backend, loading local fallback:",
        err,
      );
      const savedUsers = JSON.parse(localStorage.getItem("app_users") || "[]");

      const loggedInUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}",
      );
      const currentUserId = loggedInUser.userId || loggedInUser.id;

      // Filter fallback list as well
      const eligibleSavedUsers = savedUsers.filter((u) => {
        const isCurrentLoggedInUser =
          String(u.userId || u.id) === String(currentUserId);
        const isAdmin = u.role?.toUpperCase() === "ADMIN";

        return !isCurrentLoggedInUser && !isAdmin;
      });

      const hydratedSavedUsers = await Promise.all(
        eligibleSavedUsers.map(async (u) => {
          const userId = u.userId || u.id;
          const allowedReports = await fetchUserAllowedReportIds(
            userId,
            reports,
          );
          return {
            ...u,
            allowedReports,
          };
        }),
      );

      setUsers(hydratedSavedUsers);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserNameInput("");
    setUserFullNameInput("");
    setUserEmailInput("");
    setUserPasswordInput("");
    setUserPasswordInputConfirm("");
    setUserRoleInput(roles.length > 0 ? String(roles[0].id) : "");
    setUserIsActive(true);
    setSelectedGroupId("");
    setSelectedReportIds([]);
    setEditingRawActiveCodes(null);
    setEditingUserId(null);
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(groupId);
    if (groupId) {
      const groupObj = availableGroups.find(
        (g) => String(g.id) === String(groupId),
      );
      if (groupObj && Array.isArray(groupObj.reports)) {
        const merged = Array.from(
          new Set([...selectedReportIds, ...groupObj.reports]),
        );
        setSelectedReportIds(merged);
      }
    }
  };

  const toggleReportSelection = (reportId) => {
    if (userNameInput !== "") {
      setSelectedReportIds((prev) =>
        prev.includes(reportId)
          ? prev.filter((id) => id !== reportId)
          : [...prev, reportId],
      );
    }
  };

  const handleSelectAllReports = () => {
    if (selectedReportIds.length === reports.length) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(reports.map((r) => r.id));
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    const trimmedUsername = userNameInput.trim();
    const trimmedFullName = userFullNameInput.trim();
    const trimmedEmail = userEmailInput.trim();

    // --- Required fields ---
    if (!trimmedUsername || !trimmedEmail) {
      toast.warning("Please fill in required fields (Username & Email).");
      return;
    }

    // --- Username format validation ---
    if (!isValidUsername(trimmedUsername)) {
      toast.warning(
        "Username must be 3-30 characters and may only contain letters, numbers, dots, dashes, or underscores.",
      );
      return;
    }

    // --- Email format validation ---
    if (!isValidEmail(trimmedEmail)) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    // --- Role required ---
    if (!userRoleInput) {
      toast.warning("Please select a role.");
      return;
    }

    // --- Password validation (only relevant when creating a new user) ---
    if (!editingUserId) {
      const trimmedPassword = userPasswordInput.trim();

      if (!trimmedPassword) {
        toast.warning("Please enter a password for the new user.");
        return;
      }

      if (!isStrongPassword(trimmedPassword)) {
        toast.warning(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters and include a letter, a number, and a special character (e.g., @, #, $).`,
        );
        return;
      }

      if (trimmedPassword !== userPasswordInputConfirm.trim()) {
        toast.warning("Password and Confirm Password do not match.");
        return;
      }
    }

    setIsSaving(true);

    // Parse numerical role ID accurately
    const numericRoleId = userRoleInput ? Number(userRoleInput) : 0;

    try {
      let targetUserId = editingUserId;
      let savedUser;

      // --- STEP 1: CREATE OR UPDATE USER ACCOUNT ---
      if (editingUserId) {
        // Body payload tailored for PUT /api/User/{id}
        const updatePayload = {
          userId: Number(editingUserId),
          fullName: trimmedFullName,
          email: trimmedEmail,
          roleId: numericRoleId,
          isActive: Boolean(userIsActive),
        };

        const userRes = await axios.put(
          `${backendUrl}/api/User/${editingUserId}`,
          updatePayload,
        );
        savedUser = userRes.data?.data ||
          userRes.data || {
            ...updatePayload,
            username: trimmedUsername,
          };
      } else {
        // Payload for POST /api/User (New User Creation)
        const selectedGroupObj = availableGroups.find(
          (g) => String(g.id) === String(selectedGroupId),
        );
        const selectedRoleObj = roles.find(
          (r) => String(r.id) === String(userRoleInput),
        );

        const createPayload = {
          userId: 0,
          username: trimmedUsername,
          fullName: trimmedFullName,
          email: trimmedEmail,
          password: userPasswordInput.trim(),
          isFirstLogin: true,
          role: selectedRoleObj
            ? selectedRoleObj.name
            : String(userRoleInput || ""),
          roleId: numericRoleId,
          isActive: Boolean(userIsActive),
          groupId: selectedGroupId ? Number(selectedGroupId) : null,
          groupName: selectedGroupObj
            ? selectedGroupObj.groupName
            : "Direct Mapping",
          allowedReports: selectedReportIds,
        };

        const userRes = await axios.post(
          `${backendUrl}/api/User`,
          createPayload,
        );
        savedUser = userRes.data?.data || userRes.data || createPayload;
        targetUserId = savedUser.userId || savedUser.id;
      }

      // Attach allowedReports to local UI state update
      savedUser.allowedReports = selectedReportIds;
      savedUser.username = trimmedUsername;

      // --- STEP 3: UPDATE LOCAL UI STATE ---
      let updatedUsers = [];
      if (editingUserId) {
        updatedUsers = users.map((u) =>
          u.userId === editingUserId ? { ...u, ...savedUser } : u,
        );
      } else {
        updatedUsers = [...users, savedUser];
      }

      setUsers(updatedUsers);
      localStorage.setItem("app_users", JSON.stringify(updatedUsers));

      // Re-fetch users from API to guarantee freshness
      fetchUsers();

      resetForm();
      toast.success(
        `User ${editingUserId ? "updated" : "created"} successfully!`,
      );
    } catch (error) {
      console.error("Failed to save user or report mappings:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to process user and report mappings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (user) => {
    // Populate standard user input fields
    setEditingUserId(user.userId);
    setUserNameInput(user.username || "");
    setUserFullNameInput(user.fullName || "");
    setUserEmailInput(user.email || "");
    setUserRoleInput(String(user.roleId || user.role || ""));
    setUserIsActive(user.isActive ?? true);
    setSelectedGroupId(user.groupId ? String(user.groupId) : "");
    // Password fields are never relevant while editing, but keep them clean
    setUserPasswordInput("");
    setUserPasswordInputConfirm("");

    // Reset current selection while fetching to avoid showing stale data
    setSelectedReportIds([]);
    setEditingRawActiveCodes(null);

    // Use helper function or fallback to pre-populated allowedReports if already present
    let allowedIds = user.allowedReports;
    if (!allowedIds || allowedIds.length === 0) {
      allowedIds = await fetchUserAllowedReportIds(user.userId, reports);
    }

    allowedIds = allowedIds || [];
    setSelectedReportIds(allowedIds);
    // Store the raw codes too so the useEffect above can re-resolve them
    // correctly once/if `reports` finishes loading or changes later.
    setEditingRawActiveCodes(allowedIds);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${backendUrl}/api/User/${id}`);
      } catch (err) {
        console.warn("Delete API call failed, removing locally:", err);
      }

      const updated = users.filter((u) => u.userId !== id);
      setUsers(updated);
      localStorage.setItem("app_users", JSON.stringify(updated));
      if (editingUserId === id) resetForm();
    }
  };

  // --- Reset Password Handlers ---
  const handleOpenPasswordModal = (user) => {
    setSelectedUserForPassword(user);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
    setSelectedUserForPassword(null);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    const trimmedNewPassword = newPassword.trim();

    if (!trimmedNewPassword) {
      setPasswordError("Password cannot be empty.");
      return;
    }

    if (!isStrongPassword(trimmedNewPassword)) {
      setPasswordError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters and include a letter, a number, and a special character (e.g., @, #, $).`,
      );
      return;
    }

    if (trimmedNewPassword !== confirmPassword.trim()) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordError("");

    try {
      const response = await fetch(
        `${backendUrl}/api/User/${selectedUserForPassword.userId}/reset-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: trimmedNewPassword }),
        },
      );

      if (response.ok || response.status === 204) {
        toast.success(
          `Password reset successfully for ${selectedUserForPassword.username}`,
        );
        handleClosePasswordModal();
      } else {
        const errData = await response.text();
        setPasswordError(errData || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setPasswordError("Server communication error.");
    } finally {
      setIsSubmittingPassword(false);
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

  const selectedRoleObj = roles.find(
    (r) => String(r.id) === String(userRoleInput),
  );
  const isSelectedRoleAdmin = selectedRoleObj?.name?.toUpperCase() === "ADMIN";

  return (
    <div className="w-full bg-slate-50 text-slate-700 text-xs antialiased relative ">
      <div className="max-w-auto mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-4">
        <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#0F3A46]" />
            <span className="font-bold text-slate-800 text-[11px]">
              Manage Users
            </span>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start mt-2">
          {/* LEFT PANEL: Form */}
          <div className="md:col-span-4 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] tracking-wider">
                Manage user ({filteredUsers.length})
              </span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 h-7 w-44 outline-none bg-white focus:border-slate-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 tracking-wider">
                    <th className="px-3 py-2">User Details</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-12 text-slate-400"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Loader2
                            size={20}
                            className="animate-spin text-[#0F3A46]"
                          />
                          <span className="text-[11px] font-medium">
                            Loading users...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 text-slate-400 italic"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.userId}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleEdit(user)}
                      >
                        <td className="px-3 py-2">
                          <div className="font-semibold text-slate-800">
                            {user.username}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {user.email}
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
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 ">
                            <button
                              onClick={() => handleOpenPasswordModal(user)}
                              className=" text-slate-400 hover:text-amber-600 cursor-pointer hover:bg-amber-50 rounded"
                              title="Reset Password"
                            >
                              <Key size={13} />
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-slate-400 hover:text-blue-600 cursor-pointer hover:bg-blue-50 rounded"
                              title="Edit User & Access"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.userId)}
                              className="text-slate-400 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL: User Directory */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center gap-2">
              <div className="flex gap-1 items-center">
                <UserPlus size={14} className="text-[#0F3A46]" />
                <span className="font-bold text-slate-700 text-[11px] tracking-wider">
                  {editingUserId
                    ? "Edit User & Access"
                    : "Create User & Map Reports"}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2  border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-[11px]"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  onClick={handleSaveUser}
                  className="px-2.5 py-1 bg-[#0F3A46] hover:bg-[#164e5e] text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>{editingUserId ? "Update User" : "Create User"}</span>
                </button>
              </div>
            </div>

            <form className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="e.g. jdoe"
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userFullNameInput}
                    onChange={(e) => setUserFullNameInput(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={userEmailInput}
                  onChange={(e) => setUserEmailInput(e.target.value)}
                  placeholder="john.doe@company.com"
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
                />
              </div>

              {!editingUserId && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={userPasswordInput}
                      onChange={(e) => setUserPasswordInput(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
                    />
                    <p className="text-[10px] text-red-400 mt-1">
                      Min 8 chars. Include (e.g., @, #, $).
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={userPasswordInputConfirm}
                      onChange={(e) =>
                        setUserPasswordInputConfirm(e.target.value)
                      }
                      placeholder="Enter account password"
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 items-center">
                {/* DYNAMIC ROLE SELECTOR */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={userRoleInput}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={loadingRoles}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46] bg-white disabled:bg-slate-100"
                  >
                    {loadingRoles ? (
                      <option value="">Loading roles...</option>
                    ) : roles.length === 0 ? (
                      <option value="">No roles found</option>
                    ) : (
                      roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={userIsActive ? "true" : "false"}
                    onChange={(e) => setUserIsActive(e.target.value === "true")}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46] bg-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* RESET PASSWORD MODAL FOR EXISTING USERS */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-96 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-2">
                <Key size={14} className="text-[#0F3A46]" />
                Reset Password
              </span>
              <button
                onClick={handleClosePasswordModal}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-4">
              <p className="text-xs text-slate-500 mb-4">
                Enter a new password for{" "}
                <strong className="text-slate-700">
                  {selectedUserForPassword?.username}
                </strong>
                .
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
                  />
                  <p className="text-[10px] text-red-400 mt-1">
                    Min 8 chars. Include (e.g., @, #, $).
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#0F3A46]"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="mt-3 text-[11px] text-red-600 font-medium">
                  {passwordError}
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-3 py-1.5 bg-[#0F3A46] hover:bg-[#164e5e] text-white font-semibold rounded text-[11px] disabled:opacity-50"
                >
                  {isSubmittingPassword ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
