import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  MoreVertical,
  Filter,
  ArrowLeft,
  Download,
  Edit,
  CheckCircle2,
  Clock,
  Circle,
  Upload,
  X,
  FileText,
  Shield,
  Info,
  ArrowRight,
  Building,
  DollarSign,
  Briefcase,
  Layers,
  Scale,
  Award,
  ShoppingCart,
  FolderGit2,
  HardDrive,
  Eye,
  Lock,
  History,
  FileCheck,
  Link2,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ZoomOut,
  ZoomIn,
  XCircle,
  Loader2,
  FileUp,
} from "lucide-react";
import { UploadDocumentView } from "./UploadDocumentView";
import { DocumentVersionUploadModal } from "./DocumentVersionUploadModal";
import { PdfViewer } from "./PdfViewer";

import samplePdf from "../assets/Tax_Inv_202600000119_105.pdf";
import { TasksView } from "./TasksView";
import { backendUrlGrc } from "./config";
import axios from "axios";

// Lookup Mappings for API numeric/string fields to UI displays
const DOCUMENT_TYPES_MAP = {
  1: "Policy",
  2: "Procedure",
  3: "Form",
  4: "Plan",
  5: "Contract",
};

const CATEGORY_MAP = {
  1: "Procurement",
  2: "Information Security",
  3: "Compliance",
  4: "Human Resources",
  5: "Risk Management",
};

const CLASSIFICATION_MAP = {
  1: "Confidential",
  2: "Internal",
  3: "Restricted",
  4: "Public",
};

const DEPARTMENT_MAP = {
  1: "IT",
  2: "Operations",
  3: "Legal",
  4: "HR",
  5: "Executive",
};

const STATUS_COLOR_MAP = {
  DRAFT: "bg-slate-100 text-slate-700",
  Draft: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  Published: "bg-emerald-100 text-emerald-800",
  "IN REVIEW": "bg-amber-100 text-amber-800",
  "In Review": "bg-amber-100 text-amber-800",
  "PENDING APPROVAL": "bg-purple-100 text-purple-800",
  "Pending Approval": "bg-purple-100 text-purple-800",

  // ===== ADDED: Color styles for REJECTED and APPROVED API statuses =====
  REJECTED: "bg-red-100 text-red-800 border border-red-200",
  Rejected: "bg-red-100 text-red-800 border border-red-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

function mapApiDocumentToUI(doc) {
  if (!doc) return {};

  // Extract latest version safely with array checks
  const versionsList = Array.isArray(doc.versions) ? doc.versions : [];
  const latestVersion =
    versionsList.length > 0 ? versionsList[versionsList.length - 1] : null;

  // Formatting dates cleanly
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const statusFormatted = doc.status
    ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1).toLowerCase()
    : "Draft";

  return {
    id: String(doc.documentId || doc.id || ""),
    documentId: doc.documentId || doc.id,
    title: doc.title || "Untitled Document",
    number: doc.documentNo || `DOC-${doc.documentId || "00"}`,
    type: DOCUMENT_TYPES_MAP[doc.documentTypeId] || doc.type || "Policy",
    status: statusFormatted,
    fileUrl: latestVersion?.fileUrl || doc.fileUrl || samplePdf,
    totalPages: latestVersion?.totalPages || doc.totalPages || 1,
    statusColor:
      STATUS_COLOR_MAP[doc.status] ||
      STATUS_COLOR_MAP[statusFormatted] ||
      "bg-slate-100 text-slate-700",
    version: latestVersion?.versionNumber || doc.version || "1.0",
    owner:
      doc.ownerName ||
      doc.owner ||
      `User #${doc.ownerUserId || doc.createdBy || "1"}`,
    date: formatDate(doc.createdAt || doc.date),
    category: CATEGORY_MAP[doc.categoryId] || doc.category || "General",
    department: DEPARTMENT_MAP[doc.departmentId] || doc.department || "IT",
    effectiveDate: formatDate(doc.effectiveDate),
    reviewDate: formatDate(doc.nextReviewDate),
    classification:
      CLASSIFICATION_MAP[doc.classificationId] ||
      doc.classification ||
      "Internal",
    retention: doc.retentionPolicyId
      ? `${doc.retentionPolicyId} Years`
      : doc.retention || "Standard",
    workflow: "Standard Review Workflow",
    createdOn: formatDate(doc.createdAt || doc.createdOn),
    description:
      doc.description ||
      `Document reference ${doc.documentNo || doc.id} under ${
        CATEGORY_MAP[doc.categoryId] || doc.category || "General"
      }.`,

    // ✅ MUST Include request fields explicitly:
    requestId: doc.requestId || doc.request?.requestId || null,
    request: doc.request || null,
  };
}

const DOCUMENT_TYPES_CONFIG = {
  CONTRACT: {
    id: "CONTRACT",
    label: "1. Contract / Agreement",
    icon: FileText,
    workflow: "Contract Approval Workflow",
    retentionPolicy: "CON-7Y - 7 Years Retention",
    reviewFrequency: "Annually",
    allowedFiles: ".pdf, .docx, .xlsx",
    description:
      "Contracts and agreements with customers, vendors, or partners.",
    fields: [
      {
        name: "contractNumber",
        label: "Contract Number",
        type: "text",
        required: true,
        placeholder: "e.g., CNT-2024-00087",
      },
      {
        name: "contractTitle",
        label: "Contract Title",
        type: "text",
        required: true,
        placeholder: "Title or Name of contract",
      },
      {
        name: "counterparty",
        label: "Counterparty",
        type: "text",
        required: true,
        placeholder: "Party (Customer/Vendor)",
      },
      {
        name: "contractType",
        label: "Contract Type",
        type: "dropdown",
        required: true,
        options: ["Service", "License", "NDA", "SLA", "Master Agreement"],
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
      },
      {
        name: "expirationDate",
        label: "Expiration Date",
        type: "date",
        required: true,
      },
      {
        name: "contractValue",
        label: "Contract Value",
        type: "currency",
        required: false,
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Contract", "ERP", "Vendor", "High-Value"],
      },
    ],
  },
  POLICY: {
    id: "POLICY",
    label: "2. Policy / Procedure",
    icon: Shield,
    workflow: "Policy Governance & Review",
    retentionPolicy: "POL-5Y - 5 Years Retention",
    reviewFrequency: "Annually",
    allowedFiles: ".pdf, .docx",
    description: "Company policies, operating procedures, and guidelines.",
    fields: [
      {
        name: "policyNumber",
        label: "Policy Number",
        type: "text",
        required: true,
        placeholder: "e.g., POL-IS-001",
      },
      {
        name: "policyTitle",
        label: "Policy Title",
        type: "text",
        required: true,
        placeholder: "Title of policy",
      },
      {
        name: "department",
        label: "Department",
        type: "dropdown",
        required: true,
        options: ["IT", "HR", "Compliance", "Finance"],
      },
      {
        name: "policyOwner",
        label: "Policy Owner",
        type: "text",
        required: true,
        placeholder: "Owner name",
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
      },
      {
        name: "version",
        label: "Version",
        type: "text",
        required: true,
        placeholder: "e.g., v1.0",
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Policy", "Compliance", "SOP"],
      },
    ],
  },
};

// ==========================================
// HELPER COMPONENTS
// ==========================================
function TableRow({ doc, onSelect }) {
  return (
    <tr
      onClick={() => onSelect(doc)}
      className="hover:bg-slate-50 cursor-pointer transition-colors"
    >
      <td className="p-3 font-semibold text-blue-600 hover:underline">
        {doc.title}
      </td>
      <td className="p-3 text-slate-600">{doc.number}</td>
      <td className="p-3 text-slate-600">{doc.type}</td>
      <td className="p-3">
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${doc.statusColor}`}
        >
          {doc.status}
        </span>
      </td>
      <td className="p-3 text-slate-600">{doc.version}</td>
      <td className="p-3 text-slate-600">{doc.owner}</td>
      <td className="p-3 text-slate-600">{doc.date}</td>
      <td className="p-3 text-right text-slate-400 hover:text-slate-600">
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert(`Options for ${doc.number}`);
          }}
        >
          <MoreVertical size={14} />
        </button>
      </td>
    </tr>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

// function WorkflowStep({ label, name, date, completed, active, pending }) {
//   return (
//     <div className="flex flex-col items-center text-center z-10 flex-1">
//       <div
//         className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-xs ${
//           completed
//             ? "bg-emerald-500 text-white"
//             : active
//               ? "bg-blue-600 text-white ring-4 ring-blue-100"
//               : "bg-slate-200 text-slate-500"
//         }`}
//       >
//         {completed ? (
//           <CheckCircle2 size={16} />
//         ) : active ? (
//           <Clock size={16} />
//         ) : (
//           <Circle size={16} />
//         )}
//       </div>
//       <span className="text-xs font-semibold text-slate-800">{label}</span>
//       {name && <span className="text-[11px] text-slate-500">{name}</span>}
//       {date && <span className="text-[10px] text-slate-400">{date}</span>}
//     </div>
//   );
// }

// ==========================================
// 1. MAIN DOCUMENTS VIEW
// ==========================================

// ===== UPDATED WorkflowStep to support APPROVED, REJECTED, and PENDING statuses dynamically =====

function WorkflowStep({ label, name, date, status, comments }) {
  const isCompleted = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isPending = status === "PENDING";

  return (
    <div className="flex flex-col items-center text-center z-10 flex-1 min-w-[120px]">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 font-bold text-xs shadow-sm transition-all ${
          isCompleted
            ? "bg-emerald-500 text-white"
            : isRejected
              ? "bg-red-500 text-white ring-4 ring-red-100"
              : "bg-slate-200 text-slate-500"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 size={18} />
        ) : isRejected ? (
          <XCircle size={18} />
        ) : (
          <Circle size={18} />
        )}
      </div>
      <span className="text-xs font-bold text-slate-800">{label}</span>
      {name && (
        <span className="text-[11px] text-slate-600 mt-0.5">{name}</span>
      )}
      {date && <span className="text-[10px] text-slate-400">{date}</span>}
      {comments && (
        <span
          className="text-[10px] italic text-slate-500 mt-1 max-w-[110px] truncate block"
          title={comments}
        >
          "{comments}"
        </span>
      )}
    </div>
  );
}

export function DocumentsView({
  documents = [],
  approvalTasks = [],
  isLoading = false,
  error = null,
  onSelectDoc,
  onNavigateToUpload,
  fetchAllData,
  userId,
}) {
  const [activeTab, setActiveTab] = useState("Review");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOwner, setSelectedOwner] = useState("All");

  // Canvas & Signature States
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  // Modal & Task States
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionType, setActionType] = useState(null); // 'review' | 'approve' | 'esign'
  const [comments, setComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Preview & Version Upload States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedVersionDoc, setSelectedVersionDoc] = useState(null);

  const handleOpenDocumentPreview = (doc) => {
    setPreviewDoc({
      ...doc,
      docName: doc.title || doc.docName,
      docNo: doc.number || doc.docNo,
    });
  };

  const handleOpenVersionModal = (doc) => {
    setSelectedVersionDoc(doc);
    setIsVersionModalOpen(true);
  };

  const handleVersionUploadSuccess = (payload) => {
    setIsVersionModalOpen(false);
    setSelectedVersionDoc(null);
    if (previewDoc) {
      setPreviewDoc((prev) => ({
        ...prev,
        version: payload.newVersion || prev.version,
      }));
    }
  };

  const handleOpenAction = (doc, mode) => {
    const taskPayload = {
      ...doc,
      docName: doc.title || doc.docName,
      documentId: doc.documentId || doc.id,
      content: doc.description || `Review specifications for ${doc.title}`,
      taskId: doc.taskId || doc.id,
    };
    setSelectedTask(taskPayload);
    setActionType(mode);
    setComments("");
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleCompleteTask = async (statusOutcome) => {
    if (!selectedTask) return;

    if (actionType === "esign" && !signatureData) {
      alert("Please provide an e-Signature before submitting.");
      return;
    }

    setActionLoading(true);
    try {
      const reqData = selectedTask.originalData?.requestLevel?.request || {};

      if (activeTab === "Review") {
        const payload = {
          workflowId: reqData.workflowId || 1,
          documentId: selectedTask.documentId || 0,
          recordId: reqData.recordId || 0,
          recordType: reqData.recordType || "string",
          title: selectedTask.docName,
          requestedBy: userId,
          remarks: comments || "Reviewed",
        };
        await axios.post(`${backendUrlGrc}/api/approval/requests`, payload);
        alert("Document review request sent successfully!");
      } else {
        if (statusOutcome === "Rejected") {
          await axios.post(
            `${backendUrlGrc}/api/approval/tasks/${selectedTask.taskId}/reject`,
            { comments },
            { params: { userId: userId } },
          );
        } else {
          await axios.post(
            `${backendUrlGrc}/api/approval/tasks/${selectedTask.taskId}/approve`,
            { comments },
            { params: { userId: userId } },
          );
        }
        alert(`Task successfully processed as ${statusOutcome}!`);
      }
      setSelectedTask(null);
      setActionType(null);
      if (fetchAllData) fetchAllData();
    } catch (error) {
      console.error("Error processing action:", error);
      alert("Failed to process action. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // 1. Get base dataset depending on tab selection[cite: 3]
  const baseData = useMemo(() => {
    if (activeTab === "Review") {
      return documents;
    } else if (activeTab === "Approval") {
      return approvalTasks.filter((t) => t.status === "PENDING");
    } else if (activeTab === "Rejected") {
      return approvalTasks.filter((t) => t.status === "REJECTED");
    } else if (activeTab === "Completed") {
      return approvalTasks.filter((t) => t.status === "COMPLETED");
    }
    return [];
  }, [activeTab, documents, approvalTasks]);

  // 2. Apply search and dynamic filters over active dataset
  const filteredDocs = useMemo(() => {
    return baseData.filter((item) => {
      const title = item.title || item.docName || "";
      const docNum = item.number || item.docNo || "";

      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        docNum.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedType !== "All" && item.type !== selectedType) return false;
      if (
        selectedStatus !== "All" &&
        item.status?.toLowerCase() !== selectedStatus.toLowerCase()
      )
        return false;
      if (selectedOwner !== "All" && item.owner !== selectedOwner) return false;

      return true;
    });
  }, [baseData, search, selectedType, selectedStatus, selectedOwner]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Documents</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus size={16} /> New Document
          </button>
          <button className="border border-slate-200 text-slate-600 p-2 rounded-md hover:bg-slate-50">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-sm">
        {["Review", "Approval", "Rejected", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 w-64 focus:outline-none focus:border-blue-500 text-xs"
          />

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 text-slate-600 bg-white"
          >
            <option value="All">All Document Types</option>
            <option value="Policy">Policy</option>
            <option value="Procedure">Procedure</option>
            <option value="Form">Form</option>
            <option value="Plan">Plan</option>
            <option value="Contract">Contract</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 text-slate-600 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="In Review">In Review</option>
            <option value="Draft">Draft</option>
            <option value="PENDING">Pending</option>
          </select>

          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 text-slate-600 bg-white"
          >
            <option value="All">All Owners</option>
            {Array.from(
              new Set(baseData.map((d) => d.owner).filter(Boolean)),
            ).map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setSearch("");
            setSelectedType("All");
            setSelectedStatus("All");
            setSelectedOwner("All");
          }}
          className="border border-slate-200 text-slate-600 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
        >
          <Filter size={14} /> Reset
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Loading documents from server...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-xs">{error}</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3">Document Title</th>
                <th className="p-3">Document Number</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Version</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Created / Modified</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-800">
                      <button
                        onClick={() => onSelectDoc(doc)}
                        className="flex items-center gap-1.5 text-blue-600 hover:underline text-left cursor-pointer"
                      >
                        <FileText size={14} className="text-slate-400" />
                        {doc.title || doc.docName}
                      </button>
                    </td>
                    <td className="p-3 text-slate-600">
                      {doc.number || doc.docNo}
                    </td>
                    <td className="p-3 text-slate-600">{doc.type}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          doc.status?.toLowerCase() === "draft"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : doc.status?.toLowerCase() === "completed" ||
                                doc.status?.toLowerCase() === "published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : doc.status?.toLowerCase() === "rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {doc.version || "1.0"}
                    </td>
                    <td className="p-3 text-slate-600">{doc.owner}</td>
                    <td className="p-3 text-slate-600">
                      {doc.createdOn || doc.modifiedOn || "N/A"}
                    </td>

                    <td className="p-3 text-right">
                      {activeTab === "Review" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAction(doc, "review")}
                            className="px-2.5 py-1 text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <Eye size={12} /> Review
                          </button>
                        </div>
                      )}

                      {activeTab === "Approval" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAction(doc, "review")}
                            className="px-2 py-1 text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} /> Review
                          </button>
                          <button
                            onClick={() => handleOpenAction(doc, "approve")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                        </div>
                      )}

                      {(activeTab === "Rejected" ||
                        activeTab === "Completed") && (
                        <span className="text-slate-400 italic">
                          No actions available
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No matching documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Task Review / Approval Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-xl p-2 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {actionType === "approve"
                  ? "Approve Document Request"
                  : "Review Document"}
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 border rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Document:</span>
                <span className="font-semibold text-slate-800">
                  {selectedTask.docName}
                </span>
              </div>
              <p className="text-slate-700 border-t pt-2 mt-2">
                {selectedTask.content}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Comments
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter review notes or comments..."
                className="w-full border rounded p-2 text-xs text-slate-800 focus:outline-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              {actionType === "review" ? (
                <button
                  onClick={() => handleCompleteTask("Reviewed")}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold cursor-pointer"
                >
                  {actionLoading ? "Processing..." : "Complete Review"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleCompleteTask("Rejected")}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleCompleteTask("Approved")}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold cursor-pointer"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. DOCUMENT DETAIL VIEW WITH COMPLETE TABS
// ==========================================
export function DocumentDetailView({
  doc,
  onBack,
  onOpenVersionModal,
  userId,
}) {
  const [activeTab, setActiveTab] = useState("Overview");

  // ===== ADDED: State to hold live workflow data fetched from APIs =====
  const [workflowRequest, setWorkflowRequest] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(true);
  const [workflowError, setWorkflowError] = useState(null);

  const formatApiDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  // ===== ADDED: useEffect hook to fetch live approval request & pending tasks =====
  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      // Extract dynamic request ID safely from doc object
      const requestId =
        doc?.requestId ||
        doc?.request?.requestId ||
        doc?.originalData?.requestLevel?.request?.requestId ||
        doc?.originalData?.requestLevel?.requestId;

      if (!requestId) {
        console.warn("No request associated with this document.");
        setIsWorkflowLoading(false);
        return;
      }

      setIsWorkflowLoading(true);
      setWorkflowError(null);
      try {
        // Fetch both live endpoints simultaneously
        const [requestRes, tasksRes] = await Promise.all([
          fetch(`${backendUrlGrc}/api/approval/requests/${requestId}`),
          fetch(`${backendUrlGrc}/api/approval/tasks/pending/${userId}`),
        ]);

        if (!requestRes.ok || !tasksRes.ok) {
          throw new Error("Failed to load approval workflow state.");
        }

        const requestData = await requestRes.json();
        const tasksData = await tasksRes.json();

        setWorkflowRequest(requestData);
        setPendingTasks(tasksData);
      } catch (err) {
        console.error("Error fetching live workflow:", err);
        setWorkflowError("Unable to fetch live workflow details.");
      } finally {
        setIsWorkflowLoading(false);
      }
    };

    fetchWorkflowStatus();
  }, [
    doc?.id,
    doc?.documentId,
    doc?.requestId,
    doc?.request?.requestId,
    doc?.originalData?.requestApproverId,
    userId,
  ]);

  if (!doc) return null;

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800">{doc.title}</h1>
              <span className="text-xs text-slate-500">({doc.number})</span>
            </div>
            <p className="text-xs text-slate-500">
              Category: {doc.category} | Owner: {doc.owner}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVersionModal}
            className="border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 font-medium cursor-pointer shadow-sm transition-colors"
          >
            <Upload size={14} /> Upload New Version
          </button>
          <button
            onClick={() => alert(`Downloading ${doc.number}`)}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded flex items-center gap-1 font-medium cursor-pointer"
          >
            <Download size={14} /> Download
          </button>
          {/* <button
            onClick={() => alert(`Editing ${doc.number}`)}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded flex items-center gap-1 font-medium cursor-pointer"
          >
            <Edit size={14} /> Edit
          </button>
          <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 p-1.5 rounded">
            <MoreVertical size={14} />
          </button> */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold text-slate-500 bg-white px-4 pt-2 rounded-t-lg">
        {[
          "Overview",
          // "Details",
          "Versions",
          // "Workflow",
          // "Permissions",
          // "References",
          "Audit Trail",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 cursor-pointer transition-colors border-b-2 ${
              activeTab === tab
                ? "text-blue-600 border-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT IMPLEMENTATION */}
      <div>
        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">
                  Workflow Progress Status
                </h3>
                {workflowRequest && (
                  <span className="text-xs text-slate-500 font-medium">
                    Request #: {workflowRequest.requestNumber}
                  </span>
                )}
              </div>

              {/* Display Loading Spinner */}
              {isWorkflowLoading ? (
                <div className="p-6 text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  Fetching live approval workflow...
                </div>
              ) : workflowError ? (
                /* Display API Error */
                <div className="p-4 text-center text-red-500 text-xs">
                  {workflowError}
                </div>
              ) : workflowRequest?.levels ? (
                /* Render API Level History Dynamically */
                <div className="flex items-center justify-between relative px-2 md:px-6 py-4 overflow-x-auto gap-4">
                  {workflowRequest.levels.map((lvl) => {
                    // Find assigned user or approver who took action
                    const activeApprover =
                      lvl.approvers?.find((a) => a.actionOn || a.comments) ||
                      lvl.approvers?.[0];

                    return (
                      <WorkflowStep
                        key={lvl.requestLevelId}
                        label={lvl.levelName}
                        name={
                          activeApprover
                            ? `User #${activeApprover.userId}`
                            : "Unassigned"
                        }
                        date={
                          activeApprover?.actionOn
                            ? formatApiDate(activeApprover.actionOn)
                            : ""
                        }
                        status={lvl.status}
                        comments={activeApprover?.comments || ""}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No workflow levels found for this request.
                </div>
              )}
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-5">
                <PdfViewer
                  pdfUrl={doc.fileUrl}
                  docTitle={doc.title}
                  docNumber={doc.number}
                  totalPages={doc.totalPages}
                  status={doc.status}
                />
              </div>

              {/* Quick Info Grid */}
              <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm border-b pb-1">
                    Document Metadata
                  </h3>
                  <InfoRow label="Document Number" value={doc.number} />
                  <InfoRow label="Type" value={doc.type} />
                  <InfoRow
                    label="Status"
                    value={
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${doc.statusColor}`}
                      >
                        {doc.status}
                      </span>
                    }
                  />
                  <InfoRow label="Current Version" value={doc.version} />
                  <InfoRow label="Owner" value={doc.owner} />
                  <InfoRow label="Effective Date" value={doc.effectiveDate} />
                  <InfoRow label="Review Date" value={doc.reviewDate} />
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm border-b pb-1">
                    Governance Specs
                  </h3>
                  <InfoRow label="Classification" value={doc.classification} />
                  <InfoRow label="Retention Period" value={doc.retention} />
                  <InfoRow label="Workflows" value={doc.workflow} />
                  <InfoRow label="Department" value={doc.department} />
                  <InfoRow label="Created On" value={doc.createdOn} />
                  <InfoRow label="Last Modified On" value={doc.date} />
                </div>
              </div>
            </div>

            {/* Stepper Workflow Progress Widget */}
            {/* <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Workflow Progress Status
              </h3>
              <div className="flex items-center justify-between relative px-2 md:px-6 py-4 overflow-x-auto">
                <WorkflowStep
                  label="Author"
                  name={doc.owner}
                  date={doc.createdOn}
                  completed
                />
                <WorkflowStep
                  label="Department Review"
                  name="Sarah Johnson"
                  date="18 Mar 2024"
                  completed
                />
                <WorkflowStep
                  label="Compliance Review"
                  name="Michael Brown"
                  date="20 Mar 2024"
                  completed
                />
                <WorkflowStep label="Approval" name="David Wilson" active />
                <WorkflowStep label="Publish" pending />
              </div>
            </div> */}
            {/* ===== DYNAMIC API WORKFLOW STEPPER ===== */}
          </div>
        )}

        {/* DETAILS TAB */}
        {activeTab === "Details" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">
                Description & Abstract
              </h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded border border-slate-200">
                {doc.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 border-b pb-1">
                  Extended Properties
                </h4>
                <InfoRow label="Document ID" value={doc.id} />
                <InfoRow label="System ID" value={`SYS-DOC-${doc.id}`} />
                <InfoRow
                  label="File Format"
                  value="PDF (Portable Document Format)"
                />
                <InfoRow label="File Size" value="2.4 MB" />
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 border-b pb-1">
                  Governance & Lifecycle
                </h4>
                <InfoRow label="Retention Schedule" value={doc.retention} />
                <InfoRow label="Archival Trigger" value="Date Expired" />
                <InfoRow
                  label="Archival Location"
                  value="AWS Glacier Deep Archive"
                />
                <InfoRow label="Encryption Standard" value="AES-256 at Rest" />
              </div>
            </div>
          </div>
        )}

        {/* VERSIONS TAB */}
        {activeTab === "Versions" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm mb-4">
                Revision History
              </h3>
              <button
                onClick={onOpenVersionModal}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded flex items-center gap-1.5 font-semibold cursor-pointer transition-colors"
              >
                <Upload size={13} /> Add New Version
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="p-2.5">Version</th>
                    <th className="p-2.5">Date Created</th>
                    <th className="p-2.5">Created By</th>
                    <th className="p-2.5">Change Summary</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-blue-50/40">
                    <td className="p-2.5 font-bold text-blue-700">
                      {doc.version} (Current)
                    </td>
                    <td className="p-2.5 text-slate-600">{doc.date}</td>
                    <td className="p-2.5 text-slate-600">{doc.owner}</td>
                    <td className="p-2.5 text-slate-600">
                      Document record active.
                    </td>
                    <td className="p-2.5 text-right text-blue-600 font-semibold cursor-pointer">
                      Download
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WORKFLOW TAB */}
        {/* {activeTab === "Workflow" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-sm">
              Active Workflow Details
            </h3>
            <p className="text-slate-600">
              Current Assigned Scheme: <strong>{doc.workflow}</strong>
            </p>
          </div>
        )} */}
        {/* ===== UPDATED: WORKFLOW TAB with real API details and active pending tasks ===== */}
        {activeTab === "Workflow" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6 text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-3">
                Active Workflow Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  label="Request ID"
                  value={workflowRequest?.requestId || "N/A"}
                />
                <InfoRow
                  label="Request Number"
                  value={workflowRequest?.requestNumber || "N/A"}
                />
                <InfoRow
                  label="Overall Status"
                  value={workflowRequest?.status || "N/A"}
                />
                <InfoRow
                  label="Submitted On"
                  value={formatApiDate(workflowRequest?.submittedOn)}
                />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-3">
                Pending Approval Tasks ({pendingTasks.length})
              </h3>
              {pendingTasks.length > 0 ? (
                <div className="space-y-2">
                  {pendingTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          Level:{" "}
                          {task.requestLevel?.levelName ||
                            `Level ${task.requestLevelId}`}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Assigned User: User #{task.userId}
                        </p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">
                  No pending tasks for this workflow.
                </p>
              )}
            </div>
          </div>
        )}

        {/* PERMISSIONS TAB */}
        {activeTab === "Permissions" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              Access Control List (ACL)
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">
                    {doc.owner} (Owner)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Full Access, Edit, Delete, Admin
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                  Owner
                </span>
              </div>
            </div>
          </div>
        )}

        {/* REFERENCES TAB */}
        {activeTab === "References" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">
              Linked Documents & References
            </h3>
            <p className="text-slate-500">No linked references recorded.</p>
          </div>
        )}

        {/* AUDIT TRAIL TAB */}
        {activeTab === "Audit Trail" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              System Audit Activity
            </h3>
            <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
              <div className="relative">
                <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <p className="font-semibold text-slate-800">Document Created</p>
                <p className="text-slate-500 text-[11px]">
                  {doc.createdOn} - by {doc.owner}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN CONTAINER & STATEFUL ROUTER
// ==========================================
export default function DocumentManagementModule() {
  const [documents, setDocuments] = useState([]);
  const [approvalTasks, setApprovalTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentView, setCurrentView] = useState("LIST"); // "LIST" | "DETAIL" | "UPLOAD"
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

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

  const { userId, role } = getCurrentUserContext();

  // Fetch API Documents
  // const fetchDocuments = async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch(
  //       "https://documentgovernance.onrender.com/api/documents",
  //     );
  //     if (!response.ok) {
  //       throw new Error(`Server returned status code ${response.status}`);
  //     }
  //     const data = await response.json();

  //     // Transform raw API data into component format
  //     const formattedData = Array.isArray(data)
  //       ? data.map(mapApiDocumentToUI)
  //       : [];

  //     setDocuments(formattedData);
  //   } catch (err) {
  //     console.error("Failed to load documents from API:", err);
  //     setError("Failed to fetch documents. Please try again later.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchDocuments();
  // }, []);

  // Replaced fetchDocuments with fetchAllData
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [docRes, taskRes] = await Promise.all([
        axios
          .get(`${backendUrlGrc}/api/documents?UserId=${userId}`)
          .catch(() => ({ data: [] })),
        axios
          .get(`${backendUrlGrc}/api/approval/tasks/pending/${userId}`)
          .catch(() => ({ data: [] })),
      ]);

      if (docRes.data) {
        // ✅ Normalize single object responses into an array
        const rawDocArray = Array.isArray(docRes.data)
          ? docRes.data
          : [docRes.data];

        const formattedDocs = rawDocArray.map((doc) => {
          const requestId = doc.requestId || doc.request?.requestId || null;
          return {
            id: doc.documentId.toString(),
            documentId: doc.documentId,
            title: doc.title || "Untitled Document",
            type: "Review",
            docName: doc.title || "Untitled Document",
            docNo: doc.documentNo || `DOC-${doc.documentId}`,
            workflow: `Org ID: ${doc.organizationId || 1}`,
            due: doc.createdAt
              ? new Date(doc.createdAt).toLocaleDateString()
              : "N/A",
            priority: "Normal",
            priorityColor: "bg-slate-100 text-slate-700 border-slate-200",
            status: doc.status || "DRAFT",
            content: `Review specifications for document number ${doc.documentNo}`,
            category: `Category ID: ${doc.categoryId}`,
            owner: `User #${doc.ownerUserId || 1}`,
            version: "1.0",
            classification: `Class #${doc.classificationId}`,
            department: `Dept #${doc.departmentId}`,
            createdOn: doc.createdAt
              ? new Date(doc.createdAt).toLocaleDateString()
              : "N/A",
            fileUrl: samplePdf,
            totalPages: 1,
            description: `Document status: ${doc.status}. Created on system.`,
            requestId: requestId,
            request: doc.request || null,
          };
        });
        setDocuments(formattedDocs);
      }

      if (taskRes.data) {
        const rawTaskArray = Array.isArray(taskRes.data)
          ? taskRes.data
          : [taskRes.data];

        const formattedTasks = rawTaskArray.map((item) => {
          const req = item.requestLevel?.request || {};
          const level = item.requestLevel || {};

          let computedStatus = "Pending";
          if (item.status === "REJECTED" || item.isRejected)
            computedStatus = "REJECTED";
          else if (
            item.status === "COMPLETED" ||
            item.isApproved ||
            item.status === "APPROVED"
          )
            computedStatus = "COMPLETED";
          else if (item.status === "PENDING") computedStatus = "PENDING";

          const extractedRequestId = req.requestId || level.requestId || null;

          return {
            id: item.requestApproverId
              ? item.requestApproverId.toString()
              : Math.random().toString(),
            taskId: item.requestApproverId,
            originalData: item,
            title: item.title || "Management Approval",
            type: level.approvalMode === "SEQUENTIAL" ? "Approval" : "Review",
            docName: req.title || "Untitled Document",
            docNo: req.requestNumber || `DOC-${req.documentId || "0000"}`,
            workflow: `Workflow ID: ${req.workflowId || 1}`,
            due: item.assignedOn
              ? new Date(item.assignedOn).toLocaleDateString()
              : "N/A",
            priority: "High",
            priorityColor: "bg-red-100 text-red-700 border-red-200",
            status: computedStatus,
            content: req.remarks || "No remarks provided.",
            documentId: req.documentId,
            fileUrl: req.fileUrl || samplePdf,
            category: "General Governance",
            owner: `User #${req.requestedBy || "1"}`,
            version: "1.0",
            classification: "Internal",
            retention: "Standard",
            department: "Operations",
            createdOn: item.assignedOn
              ? new Date(item.assignedOn).toLocaleDateString()
              : "N/A",
            totalPages: 1,
            description: req.remarks || "Approval workflow request.",

            requestId: extractedRequestId,
            request: req,
          };
        });
        setApprovalTasks(formattedTasks);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Failed to fetch documents and tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // const handleSelectDoc = (doc) => {
  //   setSelectedDoc(doc);
  //   setCurrentView("DETAIL");
  // };

  const handleSelectDoc = (item) => {
    // Map or directly assign selected document ensuring requestId persists
    const docToSelect = mapApiDocumentToUI(item);

    // Fallback: If mapApiDocumentToUI didn't capture requestId, pull from original item
    if (!docToSelect.requestId) {
      docToSelect.requestId =
        item.requestId ||
        item.request?.requestId ||
        item.requestLevel?.request?.requestId ||
        null;
    }

    setSelectedDoc(docToSelect);
    setCurrentView("DETAIL");
  };

  const handleNavigateToUpload = () => {
    setCurrentView("UPLOAD");
  };

  const handleBackToList = () => {
    setSelectedDoc(null);
    setCurrentView("LIST");
    // fetchDocuments(); // Refresh list when returning from operations
  };

  const handleVersionUploadSuccess = (payload) => {
    setSelectedDoc((prev) => ({
      ...prev,
      version: payload.newVersion,
      date: payload.updatedAt,
    }));
    setIsVersionModalOpen(false);
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* 1. CREATING BRAND-NEW DOCUMENT */}
      {currentView === "UPLOAD" && (
        <UploadDocumentView
          onCancel={handleBackToList}
          showBackButton={true}
          onSubmitSuccess={handleBackToList}
        />
      )}

      {/* 2. VIEWING & MANAGING AN EXISTING DOCUMENT */}
      {currentView === "DETAIL" && selectedDoc && (
        <DocumentDetailView
          doc={selectedDoc}
          onBack={handleBackToList}
          userId={userId}
          onOpenVersionModal={() => setIsVersionModalOpen(true)}
        />
      )}

      {/* 3. MAIN DOCUMENTS TABLE / LIST */}
      {currentView === "LIST" && (
        <DocumentsView
          documents={documents}
          approvalTasks={approvalTasks}
          isLoading={isLoading}
          error={error}
          onSelectDoc={handleSelectDoc}
          onNavigateToUpload={handleNavigateToUpload}
          fetchAllData={fetchAllData}
          userId={userId}
        />
      )}

      {/* 4. VERSION UPLOAD MODAL OVERLAY */}
      {isVersionModalOpen && selectedDoc && (
        <DocumentVersionUploadModal
          existingDocument={{
            // Normalize dynamic ID
            id: selectedDoc.documentId || selectedDoc.id,
            // Normalize dynamic Title
            title:
              selectedDoc.title || selectedDoc.docName || "Untitled Document",
            // Normalize dynamic Version format
            currentVersion: selectedDoc.version?.startsWith("v")
              ? selectedDoc.version
              : `v${selectedDoc.version || "1.0"}`,
            // Normalize dynamic Type
            documentType: selectedDoc.type || selectedDoc.category || "General",
          }}
          onClose={() => setIsVersionModalOpen(false)}
          onUploadSuccess={handleVersionUploadSuccess}
        />
      )}
    </div>
  );
}
