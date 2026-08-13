// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { Plus, Edit2, Trash2, Save, FolderGit2 } from "lucide-react";
// import { backendUrl } from "./config";
// import { useOutletContext } from "react-router-dom";
// import { toast } from "react-toastify";

// export default function ManageGroupScreen() {
//   // --- Core States ---
//   const [groups, setGroups] = useState([]);
//   // const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);

//   // Selection & Active Item States
//   const [selectedGroupId, setSelectedGroupId] = useState(null);

//   // Form State
//   const [formData, setFormData] = useState({
//     id: null,
//     name: "",
//     description: "",
//     reportIds: [],
//   });

//   // Search Filters
//   const [groupSearch, setGroupSearch] = useState("");
//   const [reportSearch, setReportSearch] = useState("");

//   const { biReports = [] } = useOutletContext();

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

//   // --- Initial Data Fetching ---
//   const fetchGroups = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${backendUrl}/api/ReportGroups`);
//       const apiData = Array.isArray(response.data)
//         ? response.data
//         : response.data?.data || [];

//       // Map API schema to component schema and normalize reportIds to strings
//       const mappedGroups = apiData.map((grp) => ({
//         id: grp.id || grp.groupId,
//         name: grp.name || "",
//         description: grp.description || "",
//         reportIds: (grp.reports || []).map(String),
//       }));

//       setGroups(mappedGroups);
//       localStorage.setItem("app_groups", JSON.stringify(mappedGroups));
//     } catch (err) {
//       console.error("Failed to fetch report groups from API:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const defaultWorkspaceName =
//     import.meta.env.VITE_WORKSPACE_NAME || "Revolve Dashboards";

//   // const fetchBiReports = async (workspace = defaultWorkspaceName) => {

//   //   try {
//   //     const response = await axios.get(
//   //       `${backendUrl}/api/PowerBI/BiReport_List`,
//   //       { params: { workspaceName: workspace } }
//   //     );

//   //     const apiData = Array.isArray(response.data) ? response.data : [];

//   //     const dynamicallyLoadedReports = apiData.map((item, index) => {
//   //       const reportName = item.datasetName || item.name || "Unnamed Report";
//   //       const reportId = String(item.reportId || item.id || `rep-${index + 1}`);

//   //       return {
//   //         id: reportId,
//   //         name: reportName,
//   //         code: generateCode(reportName, index),
//   //       };
//   //     });

//   //     setReports(dynamicallyLoadedReports);
//   //   } catch (error) {
//   //     console.error("Error fetching PowerBI reports:", error);
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

//   useEffect(() => {
//     fetchGroups();
//     // fetchBiReports();
//   }, []);

//   // --- Handlers ---
//   const handleResetForm = () => {
//     setSelectedGroupId(null);
//     setFormData({ id: null, name: "", description: "", reportIds: [] });
//   };

//   const handleStartEdit = (group, e) => {
//     if (e) e.stopPropagation();
//     setSelectedGroupId(group.id);
//     setFormData({
//       id: group.id,
//       name: group.name || "",
//       description: group.description || "",
//       reportIds: (group.reportIds || []).map(String),
//     });
//   };

//   const handleSelectGroup = (group) => {
//     if (formData.name || formData.reportIds.length > 0) {
//       if (!window.confirm("Discard unsaved group changes?")) return;
//     }
//     setSelectedGroupId(group.id);
//     setFormData({
//       id: group.id,
//       name: group.name || "",
//       description: group.description || "",
//       reportIds: (group.reportIds || []).map(String),
//     });
//   };

//   const assignedGroupMap = useMemo(() => {
//     const map = {};
//     groups.forEach((grp) => {
//       // Skip current editing group so its reports remain selectable
//       if (formData.id && String(grp.id) === String(formData.id)) return;

//       if (Array.isArray(grp.reportIds)) {
//         grp.reportIds.forEach((repId) => {
//           map[String(repId)] = grp.name;
//         });
//       }
//     });
//     return map;
//   }, [groups, formData.id]);

//   const handleToggleReport = (reportId) => {
//     const strReportId = String(reportId);
//     if (assignedGroupMap[strReportId]) return;

//     setFormData((prev) => {
//       const currentReportIds = Array.isArray(prev.reportIds)
//         ? prev.reportIds
//         : [];

//       const exists = currentReportIds.includes(strReportId);

//       return {
//         ...prev,
//         reportIds: exists
//           ? currentReportIds.filter((id) => id !== strReportId)
//           : [...currentReportIds, strReportId],
//       };
//     });
//   };

//   // --- API Handlers (POST & PUT) ---
//   const handleSaveGroup = async (e) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       toast.warning("Group name is required.");
//       return;
//     }

//     const apiPayload = {
//       name: formData.name.trim(),
//       reports: formData.reportIds.map(String),
//     };

//     try {
//       setIsSaving(true);
//       if (formData.id) {
//         await axios.put(
//           `${backendUrl}/api/ReportGroups/${formData.id}`,
//           apiPayload,
//         );
//         toast.success("Report Group updated successfully!");
//       } else {
//         await axios.post(`${backendUrl}/api/ReportGroups`, apiPayload);
//         toast.success("Report Group created successfully!");
//       }

//       await fetchGroups();
//       handleResetForm();
//     } catch (err) {
//       console.error("Failed to save report group:", err);
//       toast.error(
//         err.response?.data?.message ||
//           "An error occurred while saving the group.",
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // --- API Handler (DELETE) ---
//   const handleDeleteGroup = async (groupId, e) => {
//     if (e) e.stopPropagation();
//     if (!window.confirm("Are you sure you want to delete this group?")) return;

//     try {
//       await axios.delete(`${backendUrl}/api/ReportGroups/${groupId}`);
//       toast.success("Group deleted successfully!");
//       await fetchGroups();

//       if (selectedGroupId === groupId || formData.id === groupId) {
//         handleResetForm();
//       }
//     } catch (err) {
//       console.error("Failed to delete report group:", err);
//       toast.error(
//         err.response?.data?.message || "Failed to delete the report group.",
//       );
//     }
//   };

//   // --- Filter Logics ---
//   const currentGroups = Array.isArray(groups) ? groups : [];

//   const filteredGroups = currentGroups.filter(
//     (g) =>
//       g.name?.toLowerCase().includes(groupSearch.toLowerCase()) ||
//       g.description?.toLowerCase().includes(groupSearch.toLowerCase()),
//   );

//   const filteredReports = reports.filter(
//     (r) =>
//       r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
//       r.code.toLowerCase().includes(reportSearch.toLowerCase()),
//   );

//   const availableFilteredReports = filteredReports.filter(
//     (r) => !assignedGroupMap[String(r.id)],
//   );

//   const selectedFilteredCount = availableFilteredReports.filter((rep) =>
//     formData.reportIds.includes(String(rep.id)),
//   ).length;

//   const isAllSelected =
//     availableFilteredReports.length > 0 &&
//     selectedFilteredCount === availableFilteredReports.length;

//   const isIndeterminate =
//     selectedFilteredCount > 0 &&
//     selectedFilteredCount < availableFilteredReports.length;

//   // --- Select All / Toggle Logic ---
//   const handleToggleSelectAll = () => {
//     const availableFilteredIds = availableFilteredReports.map((r) =>
//       String(r.id),
//     );
//     const currentReportIds = Array.isArray(formData.reportIds)
//       ? formData.reportIds
//       : [];

//     if (isAllSelected) {
//       setFormData((prev) => ({
//         ...prev,
//         reportIds: prev.reportIds.filter(
//           (id) => !availableFilteredIds.includes(id),
//         ),
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         reportIds: Array.from(
//           new Set([...currentReportIds, ...availableFilteredIds]),
//         ),
//       }));
//     }
//   };

//   return (
//     <div className="w-full bg-slate-50 text-slate-700 text-xs antialiased">
//       <div className="max-w-auto mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-4">
//         <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2">
//           <span className="font-bold text-slate-800 text-[11px]">
//             Manage Groups
//           </span>
//         </div>

//         {/* 2-Column Split Workspace */}
//         <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start mt-2">
//           {/* LEFT PANEL: Group Directory */}
//           <div className="md:col-span-3 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
//             <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
//               <span className="font-bold text-slate-700 text-[11px] tracking-wider">
//                 Group Directory
//               </span>
//               <span className="text-[10px] text-slate-400 font-medium">
//                 Total: {filteredGroups.length}
//               </span>
//             </div>

//             {/* Filter Input */}
//             <div className="p-2 border-b border-slate-100 bg-slate-50/50">
//               <input
//                 type="text"
//                 placeholder="Search groups..."
//                 value={groupSearch}
//                 onChange={(e) => setGroupSearch(e.target.value)}
//                 className="w-full text-xs border border-slate-200 rounded px-2 h-7 outline-none bg-white focus:border-slate-400"
//               />
//             </div>

//             {/* List Body */}
//             <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
//               {loading ? (
//                 <div className="text-center py-10 text-slate-400 italic text-[11px]">
//                   Loading groups...
//                 </div>
//               ) : filteredGroups.length === 0 ? (
//                 <div className="text-center py-10 text-slate-400 italic text-[11px]">
//                   No groups found. Enter details on the right to create one.
//                 </div>
//               ) : (
//                 filteredGroups.map((grp) => {
//                   const isSelected = grp.id === selectedGroupId;
//                   return (
//                     <div
//                       key={grp.id}
//                       onClick={() => handleSelectGroup(grp)}
//                       className={`p-2.5 rounded border transition-all cursor-pointer flex justify-between items-start ${
//                         isSelected
//                           ? "bg-slate-100 border-[#0F3A46] shadow-sm"
//                           : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
//                       }`}
//                     >
//                       <div className="space-y-0.5">
//                         <div className="font-bold text-slate-800 text-[11px]">
//                           {grp.name}
//                         </div>
//                         {grp.description && (
//                           <div className="text-slate-500 text-[10px] line-clamp-1">
//                             {grp.description}
//                           </div>
//                         )}
//                         <div className="text-[9px] font-semibold text-slate-400">
//                           {grp.reportIds?.length || 0} Reports Assigned
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-1">
//                         <button
//                           onClick={(e) => handleStartEdit(grp, e)}
//                           className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded"
//                           title="Edit Group"
//                         >
//                           <Edit2 size={12} />
//                         </button>
//                         <button
//                           onClick={(e) => handleDeleteGroup(grp.id, e)}
//                           className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
//                           title="Delete Group"
//                         >
//                           <Trash2 size={12} />
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>

//           {/* RIGHT PANEL: Form & Report Checklist (ALWAYS OPEN) */}
//           <div className="md:col-span-9 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
//             <form onSubmit={handleSaveGroup} className="flex flex-col h-full">
//               {/* Form Action Header */}
//               <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
//                 <span className="font-bold text-slate-700 text-[11px] tracking-wider">
//                   <FolderGit2 size={13} className="text-[#0F3A46]" />
//                   {formData.id ? "Edit Group Details" : "Create Group Details"}
//                 </span>

//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={handleResetForm}
//                     className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-[11px]"
//                   >
//                     Clear
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={isSaving}
//                     className="px-2.5 py-1 bg-[#0F3A46] hover:bg-[#164e5e] text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50"
//                   >
//                     <Save size={12} />
//                     <span>
//                       {isSaving
//                         ? "Saving..."
//                         : formData.id
//                           ? "Update Group"
//                           : "Create Group"}
//                     </span>
//                   </button>
//                 </div>
//               </div>

//               {/* Group Form Input */}
//               <div className="p-3 bg-slate-50/50 border-b border-slate-200 grid grid-cols-1 gap-3">
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-0.5">
//                     Group Name *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g. Executive Summary"
//                     value={formData.name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, name: e.target.value })
//                     }
//                     disabled={isSaving}
//                     className="w-full text-xs border border-slate-200 rounded px-2 h-8 outline-none focus:border-slate-400 bg-white"
//                   />
//                 </div>
//               </div>

//               {/* Assigned Reports Header */}
//               <div className="px-3 py-1.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between">
//                 <span className="font-bold text-slate-600 text-[10px] tracking-wider">
//                   Select & Assign Reports ({formData.reportIds.length} Selected)
//                 </span>
//                 <input
//                   type="text"
//                   placeholder="Filter reports..."
//                   value={reportSearch}
//                   onChange={(e) => setReportSearch(e.target.value)}
//                   className="text-xs border border-slate-200 rounded px-2 h-6 w-48 outline-none bg-white focus:border-slate-400"
//                 />
//               </div>

//               {/* Reports Checklist Table */}
//               <div className="flex-1 overflow-y-auto">
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 tracking-wider">
//                       <th className="px-3 py-1.5 w-10 text-center">
//                         <input
//                           type="checkbox"
//                           checked={isAllSelected}
//                           ref={(el) => {
//                             if (el) el.indeterminate = isIndeterminate;
//                           }}
//                           onChange={handleToggleSelectAll}
//                           className="rounded text-[#0F3A46] focus:ring-0 cursor-pointer align-middle"
//                           title={isAllSelected ? "Deselect All" : "Select All"}
//                         />
//                       </th>
//                       <th className="px-3 py-1.5">Report Code</th>
//                       <th className="px-3 py-1.5">Report Name</th>
//                       <th className="px-3 py-1.5">Group Assignment</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100 text-[11px]">
//                     {filteredReports.map((rep) => {
//                       const strRepId = String(rep.id);
//                       const isAssignedToCurrent =
//                         formData.reportIds.includes(strRepId);
//                       const existingGroupName = assignedGroupMap[strRepId];

//                       return (
//                         <tr
//                           key={rep.id}
//                           onClick={() => handleToggleReport(rep.id)}
//                           className={`transition-colors ${
//                             existingGroupName
//                               ? "bg-slate-50/70 opacity-60 cursor-not-allowed"
//                               : isAssignedToCurrent
//                                 ? "bg-indigo-50/40 hover:bg-indigo-50/70 cursor-pointer"
//                                 : "hover:bg-slate-50 cursor-pointer"
//                           }`}
//                         >
//                           <td className="px-3 py-1.5 text-center">
//                             <input
//                               type="checkbox"
//                               checked={isAssignedToCurrent}
//                               disabled={!!existingGroupName}
//                               onChange={() => {}}
//                               className="rounded text-[#0F3A46] focus:ring-0 cursor-pointer"
//                             />
//                           </td>
//                           <td className="px-3 py-1.5 font-mono font-bold text-slate-700">
//                             {rep.code}
//                           </td>
//                           <td className="px-3 py-1.5 font-medium text-slate-800">
//                             {rep.name}
//                           </td>
//                           <td className="px-3 py-1.5">
//                             {existingGroupName ? (
//                               <span className="inline-block text-slate-600 font-medium">
//                                 Assigned to: {existingGroupName}
//                               </span>
//                             ) : (
//                               <span className="text-slate-700">Available</span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Footer Summary Bar */}
//               <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 font-medium flex justify-between">
//                 <span>Selected Reports: {formData.reportIds.length}</span>
//                 <span>Total Available: {reports.length}</span>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, Save, FolderGit2, Loader2 } from "lucide-react";
import { backendUrl } from "./config";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

// --- Validation constants ---
const GROUP_NAME_MIN_LENGTH = 2;
const GROUP_NAME_MAX_LENGTH = 100;
const GROUP_DESCRIPTION_MAX_LENGTH = 500;

export default function ManageGroupScreen() {
  // --- Core States ---
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Selection & Active Item States
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    reportIds: [],
  });

  // Snapshot of the form as it was when a group was loaded for editing.
  // Used to detect real changes (see hasUnsavedChanges) instead of just
  // checking "is anything filled in", which previously triggered a
  // "Discard unsaved changes?" prompt every time you switched between two
  // already-saved groups even when nothing had actually changed.
  const [originalFormData, setOriginalFormData] = useState(null);

  // Search Filters
  const [groupSearch, setGroupSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");

  const { biReports = [] } = useOutletContext();

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

  // --- Initial Data Fetching ---
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/ReportGroups`);
      const apiData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      // Map API schema to component schema and normalize reportIds to strings
      const mappedGroups = apiData.map((grp) => ({
        id: grp.id || grp.groupId,
        name: grp.name || "",
        description: grp.description || "",
        reportIds: (grp.reports || []).map(String),
      }));

      setGroups(mappedGroups);
      localStorage.setItem("app_groups", JSON.stringify(mappedGroups));
    } catch (err) {
      console.error("Failed to fetch report groups from API:", err);
      // Fall back to the last known-good copy so the screen isn't left
      // completely empty if the API is temporarily unreachable.
      let savedGroups = [];
      try {
        savedGroups = JSON.parse(localStorage.getItem("app_groups") || "[]");
      } catch (parseErr) {
        savedGroups = [];
      }
      setGroups(Array.isArray(savedGroups) ? savedGroups : []);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ---
  const handleResetForm = () => {
    setSelectedGroupId(null);
    setFormData({ id: null, name: "", description: "", reportIds: [] });
    setOriginalFormData(null);
  };

  // True if the form currently holds changes that haven't been saved.
  const hasUnsavedChanges = () => {
    if (!formData.id) {
      // Creating a brand new (unsaved) group: dirty if the user typed
      // anything in or picked any reports.
      return (
        Boolean(formData.name.trim()) ||
        Boolean(formData.description.trim()) ||
        formData.reportIds.length > 0
      );
    }

    if (!originalFormData) return false;

    const currentIds = [...formData.reportIds].sort().join(",");
    const originalIds = [...originalFormData.reportIds].sort().join(",");

    return (
      formData.name.trim() !== originalFormData.name.trim() ||
      formData.description.trim() !== originalFormData.description.trim() ||
      currentIds !== originalIds
    );
  };

  const confirmDiscardIfNeeded = () => {
    if (!hasUnsavedChanges()) return true;
    return window.confirm("Discard unsaved group changes?");
  };

  const loadGroupIntoForm = (group) => {
    const normalized = {
      id: group.id,
      name: group.name || "",
      description: group.description || "",
      reportIds: (group.reportIds || []).map(String),
    };
    setSelectedGroupId(group.id);
    setFormData(normalized);
    setOriginalFormData(normalized);
  };

  // Both the row click and the pencil/edit icon now share the same
  // unsaved-changes check, so switching groups can no longer silently
  // discard an in-progress edit depending on which control was clicked.
  const handleStartEdit = (group, e) => {
    if (e) e.stopPropagation();
    if (!confirmDiscardIfNeeded()) return;
    loadGroupIntoForm(group);
  };

  const handleSelectGroup = (group) => {
    if (!confirmDiscardIfNeeded()) return;
    loadGroupIntoForm(group);
  };

  const assignedGroupMap = useMemo(() => {
    const map = {};
    groups.forEach((grp) => {
      // Skip current editing group so its reports remain selectable
      if (formData.id && String(grp.id) === String(formData.id)) return;

      if (Array.isArray(grp.reportIds)) {
        grp.reportIds.forEach((repId) => {
          map[String(repId)] = grp.name;
        });
      }
    });
    return map;
  }, [groups, formData.id]);

  const handleToggleReport = (reportId) => {
    const strReportId = String(reportId);
    if (assignedGroupMap[strReportId]) return;

    setFormData((prev) => {
      const currentReportIds = Array.isArray(prev.reportIds)
        ? prev.reportIds
        : [];

      const exists = currentReportIds.includes(strReportId);

      return {
        ...prev,
        reportIds: exists
          ? currentReportIds.filter((id) => id !== strReportId)
          : [...currentReportIds, strReportId],
      };
    });
  };

  // --- API Handlers (POST & PUT) ---
  const handleSaveGroup = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      toast.warning("Group name is required.");
      return;
    }

    if (trimmedName.length < GROUP_NAME_MIN_LENGTH) {
      toast.warning(
        `Group name must be at least ${GROUP_NAME_MIN_LENGTH} characters long.`,
      );
      return;
    }

    if (trimmedName.length > GROUP_NAME_MAX_LENGTH) {
      toast.warning(
        `Group name must be under ${GROUP_NAME_MAX_LENGTH} characters.`,
      );
      return;
    }

    if (trimmedDescription.length > GROUP_DESCRIPTION_MAX_LENGTH) {
      toast.warning(
        `Description must be under ${GROUP_DESCRIPTION_MAX_LENGTH} characters.`,
      );
      return;
    }

    // Prevent duplicate group names (case-insensitive), excluding the
    // group currently being edited.
    const isDuplicateName = currentGroups.some(
      (g) =>
        String(g.id) !== String(formData.id) &&
        g.name?.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (isDuplicateName) {
      toast.warning(
        "A group with this name already exists. Please choose a different name.",
      );
      return;
    }

    const apiPayload = {
      name: trimmedName,
      description: trimmedDescription,
      reports: formData.reportIds.map(String),
    };

    try {
      setIsSaving(true);
      if (formData.id) {
        await axios.put(
          `${backendUrl}/api/ReportGroups/${formData.id}`,
          apiPayload,
        );
        toast.success("Report Group updated successfully!");
      } else {
        await axios.post(`${backendUrl}/api/ReportGroups`, apiPayload);
        toast.success("Report Group created successfully!");
      }

      await fetchGroups();
      handleResetForm();
    } catch (err) {
      console.error("Failed to save report group:", err);
      toast.error(
        err.response?.data?.message ||
          "An error occurred while saving the group.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- API Handler (DELETE) ---
  const handleDeleteGroup = async (groupId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await axios.delete(`${backendUrl}/api/ReportGroups/${groupId}`);
      toast.success("Group deleted successfully!");
      await fetchGroups();

      if (selectedGroupId === groupId || formData.id === groupId) {
        handleResetForm();
      }
    } catch (err) {
      console.error("Failed to delete report group:", err);
      toast.error(
        err.response?.data?.message || "Failed to delete the report group.",
      );
    }
  };

  // --- Filter Logics ---
  const currentGroups = Array.isArray(groups) ? groups : [];

  const filteredGroups = currentGroups.filter(
    (g) =>
      g.name?.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.description?.toLowerCase().includes(groupSearch.toLowerCase()),
  );

  const filteredReports = reports.filter(
    (r) =>
      r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.code.toLowerCase().includes(reportSearch.toLowerCase()),
  );

  const availableFilteredReports = filteredReports.filter(
    (r) => !assignedGroupMap[String(r.id)],
  );

  const selectedFilteredCount = availableFilteredReports.filter((rep) =>
    formData.reportIds.includes(String(rep.id)),
  ).length;

  const isAllSelected =
    availableFilteredReports.length > 0 &&
    selectedFilteredCount === availableFilteredReports.length;

  const isIndeterminate =
    selectedFilteredCount > 0 &&
    selectedFilteredCount < availableFilteredReports.length;

  // --- Select All / Toggle Logic ---
  const handleToggleSelectAll = () => {
    const availableFilteredIds = availableFilteredReports.map((r) =>
      String(r.id),
    );
    const currentReportIds = Array.isArray(formData.reportIds)
      ? formData.reportIds
      : [];

    if (isAllSelected) {
      setFormData((prev) => ({
        ...prev,
        reportIds: prev.reportIds.filter(
          (id) => !availableFilteredIds.includes(id),
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        reportIds: Array.from(
          new Set([...currentReportIds, ...availableFilteredIds]),
        ),
      }));
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-700 text-xs antialiased">
      <div className="max-w-auto mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-4">
        <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2">
          <span className="font-bold text-slate-800 text-[11px]">
            Groups Reports Mappings
          </span>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start mt-2">
          {/* LEFT PANEL: Group Directory */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] tracking-wider">
                Group Directory
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Total: {filteredGroups.length}
              </span>
            </div>

            {/* Filter Input */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <input
                type="text"
                placeholder="Search groups..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded px-2 h-7 outline-none bg-white focus:border-slate-400"
              />
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                  <Loader2 size={20} className="animate-spin text-[#0F3A46]" />
                  <span className="text-[11px] font-medium">
                    Loading groups...
                  </span>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-10 text-slate-400 italic text-[11px]">
                  No groups found. Enter details on the right to create one.
                </div>
              ) : (
                filteredGroups.map((grp) => {
                  const isSelected = grp.id === selectedGroupId;
                  return (
                    <div
                      key={grp.id}
                      onClick={() => handleSelectGroup(grp)}
                      className={`p-2.5 rounded border transition-all cursor-pointer flex justify-between items-start ${
                        isSelected
                          ? "bg-slate-100 border-[#0F3A46] shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 text-[11px]">
                          {grp.name}
                        </div>
                        {grp.description && (
                          <div className="text-slate-500 text-[10px] line-clamp-1">
                            {grp.description}
                          </div>
                        )}
                        <div className="text-[9px] font-semibold text-slate-400">
                          {grp.reportIds?.length || 0} Reports Assigned
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleStartEdit(grp, e)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded"
                          title="Edit Group"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteGroup(grp.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Group"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Form & Report Checklist (ALWAYS OPEN) */}
          <div className="md:col-span-9 bg-white border border-slate-200 rounded flex flex-col h-[560px]">
            <form onSubmit={handleSaveGroup} className="flex flex-col h-full">
              {/* Form Action Header */}
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                {/* <span className="font-bold text-slate-700 text-[11px] tracking-wider">
                  <FolderGit2 size={13} className="text-[#0F3A46]" />
                  {formData.id ? "Edit Group Details" : "Create Group Details"}
                </span> */}
                <div className="flex gap-1 item-center">
                  <span className="font-bold text-slate-700  text-[11px] tracking-wider flex items-center gap-1.5">
                    <FolderGit2 size={13} className="text-[#0F3A46]" />
                    {formData.id
                      ? "Edit Group Details"
                      : "Create Group Details"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-2 py-1 bg-slate-100 cursor-pointer hover:bg-slate-200 text-slate-600 font-semibold rounded text-[11px]"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-2.5 py-1 bg-[#0F3A46] cursor-pointer hover:bg-[#164e5e] text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    <Save size={12} />
                    <span>
                      {isSaving
                        ? "Saving..."
                        : formData.id
                          ? "Update Group"
                          : "Create Group"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Group Form Input */}
              <div className="p-3 bg-slate-50/50 border-b border-slate-200 grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-0.5">
                    Group Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive Summary"
                    value={formData.name}
                    maxLength={GROUP_NAME_MAX_LENGTH}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isSaving}
                    className="w-full text-xs border border-slate-200 rounded px-2 h-8 outline-none focus:border-slate-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-0.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Optional short description for this group"
                    value={formData.description}
                    maxLength={GROUP_DESCRIPTION_MAX_LENGTH}
                    rows={2}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={isSaving}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-slate-400 bg-white resize-none"
                  />
                </div>
              </div>

              {/* Assigned Reports Header */}
              <div className="px-3 py-1.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-600 text-[10px] tracking-wider">
                  Select & Assign Reports ({formData.reportIds.length} Selected)
                </span>
                <input
                  type="text"
                  placeholder="Filter reports..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 h-6 w-48 outline-none bg-white focus:border-slate-400"
                />
              </div>

              {/* Reports Checklist Table */}
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
                      <th className="px-3 py-1.5">Report Code</th>
                      <th className="px-3 py-1.5">Report Name</th>
                      <th className="px-3 py-1.5">Group Assignment</th>
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
                          formData.reportIds.includes(strRepId);
                        const existingGroupName = assignedGroupMap[strRepId];

                        return (
                          <tr
                            key={rep.id}
                            onClick={() => handleToggleReport(rep.id)}
                            className={`transition-colors ${
                              existingGroupName
                                ? "bg-slate-50/70 opacity-60 cursor-not-allowed"
                                : isAssignedToCurrent
                                  ? "bg-indigo-50/40 hover:bg-indigo-50/70 cursor-pointer"
                                  : "hover:bg-slate-50 cursor-pointer"
                            }`}
                          >
                            <td className="px-3 py-1.5 text-center">
                              <input
                                type="checkbox"
                                checked={isAssignedToCurrent}
                                disabled={!!existingGroupName}
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
                            <td className="px-3 py-1.5">
                              {existingGroupName ? (
                                <span className="inline-block text-slate-600 font-medium">
                                  Assigned to: {existingGroupName}
                                </span>
                              ) : (
                                <span className="text-slate-700">
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
              </div>

              {/* Footer Summary Bar */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 font-medium flex justify-between">
                <span>Selected Reports: {formData.reportIds.length}</span>
                <span>Total Available: {reports.length}</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
