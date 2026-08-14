import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { UploadDocumentView } from "./UploadDocumentView";
import { DocumentVersionUploadModal } from "./DocumentVersionUploadModal";
import { PdfViewer } from "./PdfViewer";

import samplePdf from "../assets/DeltekCostpoint82ExtensibilityDesignerCodingGuide.pdf";

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
};

/**
 * Maps incoming API objects to the structure expected by UI components.
 */
function mapApiDocumentToUI(doc) {
  // Extract latest version if available
  const latestVersion =
    doc.versions && doc.versions.length > 0
      ? doc.versions[doc.versions.length - 1]
      : null;

  // Formatting dates cleanly (YYYY-MM-DD to DD MMM YYYY or local string)
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
    id: String(doc.documentId),
    title: doc.title || "Untitled Document",
    number: doc.documentNo || `DOC-${doc.documentId}`,
    type: DOCUMENT_TYPES_MAP[doc.documentTypeId] || "Policy",
    status: statusFormatted,
    fileUrl: latestVersion?.fileUrl || samplePdf,
    totalPages: latestVersion?.totalPages || 1,
    statusColor:
      STATUS_COLOR_MAP[doc.status] ||
      STATUS_COLOR_MAP[statusFormatted] ||
      "bg-slate-100 text-slate-700",
    version: latestVersion?.versionNumber || "1.0",
    owner: doc.ownerName || `User #${doc.ownerUserId || doc.createdBy || "1"}`,
    date: formatDate(doc.createdAt),
    category: CATEGORY_MAP[doc.categoryId] || "General",
    department: DEPARTMENT_MAP[doc.departmentId] || "IT",
    effectiveDate: formatDate(doc.effectiveDate),
    reviewDate: formatDate(doc.nextReviewDate),
    classification: CLASSIFICATION_MAP[doc.classificationId] || "Internal",
    retention: doc.retentionPolicyId
      ? `${doc.retentionPolicyId} Years`
      : "Standard",
    workflow: "Standard Review Workflow",
    createdOn: formatDate(doc.createdAt),
    description:
      doc.description ||
      `Document reference ${doc.documentNo} under ${CATEGORY_MAP[doc.categoryId] || "General"}.`,
  };
}

// Metadata configuration for Upload Wizard
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

function WorkflowStep({ label, name, date, completed, active, pending }) {
  return (
    <div className="flex flex-col items-center text-center z-10 flex-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-xs ${
          completed
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-blue-600 text-white ring-4 ring-blue-100"
              : "bg-slate-200 text-slate-500"
        }`}
      >
        {completed ? (
          <CheckCircle2 size={16} />
        ) : active ? (
          <Clock size={16} />
        ) : (
          <Circle size={16} />
        )}
      </div>
      <span className="text-xs font-semibold text-slate-800">{label}</span>
      {name && <span className="text-[11px] text-slate-500">{name}</span>}
      {date && <span className="text-[10px] text-slate-400">{date}</span>}
    </div>
  );
}

// ==========================================
// 1. MAIN DOCUMENTS VIEW
// ==========================================
export function DocumentsView({
  documents = [],
  isLoading = false,
  error = null,
  onSelectDoc,
  onNavigateToUpload,
}) {
  const [activeTab, setActiveTab] = useState("All Documents");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOwner, setSelectedOwner] = useState("All");

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (activeTab === "Drafts" && doc.status.toLowerCase() !== "draft")
        return false;
      if (activeTab === "Published" && doc.status.toLowerCase() !== "published")
        return false;
      if (activeTab === "Archived" && doc.status.toLowerCase() !== "archived")
        return false;
      if (
        activeTab === "Superseded" &&
        doc.status.toLowerCase() !== "superseded"
      )
        return false;

      const matchesSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.number.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedType !== "All" && doc.type !== selectedType) return false;
      if (
        selectedStatus !== "All" &&
        doc.status.toLowerCase() !== selectedStatus.toLowerCase()
      )
        return false;
      if (selectedOwner !== "All" && doc.owner !== selectedOwner) return false;

      return true;
    });
  }, [
    documents,
    activeTab,
    search,
    selectedType,
    selectedStatus,
    selectedOwner,
  ]);

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
        {["All Documents", "Drafts", "Published", "Archived", "Superseded"].map(
          (tab) => (
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
          ),
        )}
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
            <option value="Pending Approval">Pending Approval</option>
          </select>

          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 text-slate-600 bg-white"
          >
            <option value="All">All Owners</option>
            {Array.from(new Set(documents.map((d) => d.owner))).map((owner) => (
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

      {/* Table & Loading/Error States */}
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
                <th className="p-3">Modified On</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <TableRow key={doc.id} doc={doc} onSelect={onSelectDoc} />
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
    </div>
  );
}

// ==========================================
// 2. DOCUMENT DETAIL VIEW WITH COMPLETE TABS
// ==========================================
export function DocumentDetailView({ doc, onBack, onOpenVersionModal }) {
  const [activeTab, setActiveTab] = useState("Overview");

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
          <button
            onClick={() => alert(`Editing ${doc.number}`)}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded flex items-center gap-1 font-medium cursor-pointer"
          >
            <Edit size={14} /> Edit
          </button>
          <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 p-1.5 rounded">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold text-slate-500 bg-white px-4 pt-2 rounded-t-lg">
        {[
          "Overview",
          "Details",
          "Versions",
          "Workflow",
          "Permissions",
          "References",
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
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-5">
                <PdfViewer
                  pdfUrl={doc.fileUrl}
                  docTitle={doc.title}
                  docNumber={doc.number}
                  totalPages={doc.totalPages}
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
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
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
            </div>
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
        {activeTab === "Workflow" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-sm">
              Active Workflow Details
            </h3>
            <p className="text-slate-600">
              Current Assigned Scheme: <strong>{doc.workflow}</strong>
            </p>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentView, setCurrentView] = useState("LIST"); // "LIST" | "DETAIL" | "UPLOAD"
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // Fetch API Documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://documentgovernance.onrender.com/api/documents",
      );
      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }
      const data = await response.json();

      // Transform raw API data into component format
      const formattedData = Array.isArray(data)
        ? data.map(mapApiDocumentToUI)
        : [];

      setDocuments(formattedData);
    } catch (err) {
      console.error("Failed to load documents from API:", err);
      setError("Failed to fetch documents. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    setCurrentView("DETAIL");
  };

  const handleNavigateToUpload = () => {
    setCurrentView("UPLOAD");
  };

  const handleBackToList = () => {
    setSelectedDoc(null);
    setCurrentView("LIST");
    fetchDocuments(); // Refresh list when returning from operations
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
          onSubmitSuccess={handleBackToList}
        />
      )}

      {/* 2. VIEWING & MANAGING AN EXISTING DOCUMENT */}
      {currentView === "DETAIL" && selectedDoc && (
        <DocumentDetailView
          doc={selectedDoc}
          onBack={handleBackToList}
          onOpenVersionModal={() => setIsVersionModalOpen(true)}
        />
      )}

      {/* 3. MAIN DOCUMENTS TABLE / LIST */}
      {currentView === "LIST" && (
        <DocumentsView
          documents={documents}
          isLoading={isLoading}
          error={error}
          onSelectDoc={handleSelectDoc}
          onNavigateToUpload={handleNavigateToUpload}
        />
      )}

      {/* 4. VERSION UPLOAD MODAL OVERLAY */}
      {isVersionModalOpen && selectedDoc && (
        <DocumentVersionUploadModal
          existingDocument={{
            id: selectedDoc.id,
            title: selectedDoc.title,
            currentVersion: selectedDoc.version || "1.0",
            documentType: selectedDoc.type,
          }}
          onClose={() => setIsVersionModalOpen(false)}
          onUploadSuccess={handleVersionUploadSuccess}
        />
      )}
    </div>
  );
}
