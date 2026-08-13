import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { UploadDocumentView } from "./UploadDocumentView";

// ==========================================
// SAMPLE DATASET
// ==========================================
const mockDocuments = [
  {
    id: "1",
    title: "Information Security Policy",
    number: "POL-IS-001",
    type: "Policy",
    status: "Published",
    statusColor: "bg-emerald-100 text-emerald-800",
    version: "2.0",
    owner: "John Smith",
    date: "08 May 2024",
    category: "Information Security",
    department: "IT",
    effectiveDate: "01 Apr 2024",
    reviewDate: "01 Apr 2025",
    classification: "Confidential",
    retention: "7 Years",
    workflow: "Policy Approval Workflow",
    createdOn: "15 Mar 2024",
    description:
      "Defines organizational security requirements for information systems, cloud assets, and endpoints.",
  },
  {
    id: "2",
    title: "Vendor Management Procedure",
    number: "PRC-VN-002",
    type: "Procedure",
    status: "In Review",
    statusColor: "bg-amber-100 text-amber-800",
    version: "1.1",
    owner: "Sarah Johnson",
    date: "07 May 2024",
    category: "Procurement",
    department: "Operations",
    effectiveDate: "10 Apr 2024",
    reviewDate: "10 Apr 2025",
    classification: "Internal",
    retention: "5 Years",
    workflow: "Procedure Review Workflow",
    createdOn: "20 Mar 2024",
    description:
      "Outlines vendor onboarding, due diligence, background screening, and periodic performance evaluations.",
  },
  {
    id: "3",
    title: "Data Privacy Policy",
    number: "POL-DP-003",
    type: "Policy",
    status: "Published",
    statusColor: "bg-emerald-100 text-emerald-800",
    version: "3.0",
    owner: "Michael Brown",
    date: "05 May 2024",
    category: "Compliance",
    department: "Legal",
    effectiveDate: "15 Jan 2024",
    reviewDate: "15 Jan 2025",
    classification: "Restricted",
    retention: "10 Years",
    workflow: "Legal Approval Workflow",
    createdOn: "01 Jan 2024",
    description:
      "Ensures processing of personal data complies with GDPR, CCPA, and enterprise privacy standards.",
  },
  {
    id: "4",
    title: "Employee Onboarding Checklist",
    number: "FRM-HR-004",
    type: "Form",
    status: "Draft",
    statusColor: "bg-slate-100 text-slate-700",
    version: "0.3",
    owner: "Emily Davis",
    date: "04 May 2024",
    category: "Human Resources",
    department: "HR",
    effectiveDate: "N/A",
    reviewDate: "N/A",
    classification: "Internal",
    retention: "3 Years",
    workflow: "HR Form Draft",
    createdOn: "28 Apr 2024",
    description:
      "Standard checklist for IT provisioning, background checks, and HR orientation.",
  },
  {
    id: "5",
    title: "Business Continuity Plan",
    number: "PLN-BC-005",
    type: "Plan",
    status: "Pending Approval",
    statusColor: "bg-purple-100 text-purple-800",
    version: "1.0",
    owner: "David Wilson",
    date: "02 May 2024",
    category: "Risk Management",
    department: "Executive",
    effectiveDate: "01 May 2024",
    reviewDate: "01 May 2025",
    classification: "Confidential",
    retention: "Permanent",
    workflow: "Executive Sign-off",
    createdOn: "10 Apr 2024",
    description:
      "Disaster recovery scenarios and operational failover procedures during critical incidents.",
  },
];

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
export function DocumentsView({ onSelectDoc, onNavigateToUpload }) {
  const [activeTab, setActiveTab] = useState("All Documents");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOwner, setSelectedOwner] = useState("All");

  const filteredDocs = useMemo(() => {
    return mockDocuments.filter((doc) => {
      if (activeTab === "Drafts" && doc.status !== "Draft") return false;
      if (activeTab === "Published" && doc.status !== "Published") return false;
      if (activeTab === "Archived" && doc.status !== "Archived") return false;
      if (activeTab === "Superseded" && doc.status !== "Superseded")
        return false;

      const matchesSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.number.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedType !== "All" && doc.type !== selectedType) return false;
      if (selectedStatus !== "All" && doc.status !== selectedStatus)
        return false;
      if (selectedOwner !== "All" && doc.owner !== selectedOwner) return false;

      return true;
    });
  }, [activeTab, search, selectedType, selectedStatus, selectedOwner]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Documents</h1>
        <div className="flex items-center gap-2">
          {/* Action to trigger route/view change */}
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
            <option value="John Smith">John Smith</option>
            <option value="Sarah Johnson">Sarah Johnson</option>
            <option value="Michael Brown">Michael Brown</option>
            <option value="Emily Davis">Emily Davis</option>
            <option value="David Wilson">David Wilson</option>
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

      {/* Table */}
      <div className="overflow-x-auto">
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
      </div>
    </div>
  );
}

// ==========================================
// 2. DOCUMENT DETAIL VIEW WITH COMPLETE TABS
// ==========================================
export function DocumentDetailView({ doc, onBack }) {
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
              {/* Document Preview Frame */}
              <div className="col-span-12 lg:col-span-5 bg-slate-800 rounded-lg overflow-hidden flex flex-col h-96 shadow-inner">
                <div className="bg-slate-900 p-6 text-white flex-1 flex flex-col justify-center items-center text-center">
                  <FileText className="w-12 h-12 text-blue-400 mb-3" />
                  <h2 className="text-base font-bold tracking-wider mb-2 uppercase">
                    {doc.title}
                  </h2>
                  <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                    Official document record for {doc.number}. Classification:{" "}
                    {doc.classification}.
                  </p>
                </div>
                <div className="bg-slate-900 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Page 1 / 12</span>
                  <span>100% Zoom</span>
                </div>
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
                <InfoRow label="System ID" value={`SYS-DOC-${doc.id}0092`} />
                <InfoRow
                  label="File Format"
                  value="PDF (Portable Document Format)"
                />
                <InfoRow label="File Size" value="2.4 MB" />
                <InfoRow
                  label="Checksum (MD5)"
                  value="e2c086e9329126a111a95a32"
                />
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
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Revision History
            </h3>
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
                      Annual review update and policy refresh.
                    </td>
                    <td className="p-2.5 text-right text-blue-600 font-semibold cursor-pointer">
                      Download
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-700">1.0</td>
                    <td className="p-2.5 text-slate-600">{doc.createdOn}</td>
                    <td className="p-2.5 text-slate-600">{doc.owner}</td>
                    <td className="p-2.5 text-slate-600">
                      Initial document release and baseline setup.
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
            <div className="border border-slate-200 rounded p-4 space-y-3 bg-slate-50">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold text-slate-700">
                  Step 1: Author Submission
                </span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check size={14} /> Completed ({doc.createdOn})
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold text-slate-700">
                  Step 2: Legal & Security Review
                </span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check size={14} /> Approved (20 Mar 2024)
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold text-slate-700">
                  Step 3: Executive Sign-off
                </span>
                <span className="text-blue-600 font-bold">
                  In Progress (Assigned: David Wilson)
                </span>
              </div>
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
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">
                    Department: {doc.department}
                  </p>
                  <p className="text-[11px] text-slate-500">Read & Comment</p>
                </div>
                <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                  Read Only
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
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                <Link2 size={14} /> NIST Cybersecurity Framework (NIST SP
                800-53)
              </li>
              <li className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                <Link2 size={14} /> ISO/IEC 27001:2022 Compliance Guideline
              </li>
            </ul>
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
                <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-blue-600" />
                <p className="font-semibold text-slate-800">Document Edited</p>
                <p className="text-slate-500 text-[11px]">
                  {doc.date} - by {doc.owner}
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <p className="font-semibold text-slate-800">
                  Document Uploaded & Created
                </p>
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
// 3. UPLOAD DOCUMENT VIEW (NAV TARGET)
// ==========================================
// export function UploadDocumentView({ onCancel, onSubmitSuccess }) {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedTypeKey, setSelectedTypeKey] = useState("CONTRACT");
//   const [formData, setFormData] = useState({
//     currency: "USD",
//     tags: ["Contract", "ERP"],
//   });
//   const [uploadedFile, setUploadedFile] = useState({
//     name: "Master_Service_Agreement.pdf",
//     size: "1.24 MB",
//   });

//   const activeConfig = useMemo(() => {
//     return (
//       DOCUMENT_TYPES_CONFIG[selectedTypeKey] || DOCUMENT_TYPES_CONFIG.CONTRACT
//     );
//   }, [selectedTypeKey]);

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const isMetadataValid = useMemo(() => {
//     return activeConfig.fields
//       .filter((f) => f.required)
//       .every(
//         (f) => formData[f.name] && formData[f.name].toString().trim() !== "",
//       );
//   }, [activeConfig, formData]);

//   return (
//     <div className="flex bg-slate-100 text-slate-800 font-sans min-h-screen">
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Header with Nav Action */}
//         <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-bold text-slate-900">
//               Upload New Document
//             </h1>
//             <p className="text-xs text-slate-500 mt-0.5">
//               Create a new document entry in the Governance System
//             </p>
//           </div>
//           <button
//             onClick={onCancel}
//             className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer flex items-center gap-1"
//           >
//             <ArrowLeft size={14} /> Back to Documents
//           </button>
//         </div>

//         {/* Form Grid */}
//         <div className="p-6 mx-auto w-full space-y-6">
//           <div className="grid grid-cols-12 gap-6">
//             <div className="col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
//                   Select Document Type
//                 </label>
//                 <select
//                   value={selectedTypeKey}
//                   onChange={(e) => setSelectedTypeKey(e.target.value)}
//                   className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
//                 >
//                   {Object.keys(DOCUMENT_TYPES_CONFIG).map((key) => (
//                     <option key={key} value={key}>
//                       {DOCUMENT_TYPES_CONFIG[key].label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Dynamic Metadata Form */}
//               <div className="grid grid-cols-2 gap-4">
//                 {activeConfig.fields.map((field) => (
//                   <div
//                     key={field.name}
//                     className={
//                       field.type === "textarea" ? "col-span-2" : "col-span-1"
//                     }
//                   >
//                     <label className="block text-xs font-semibold text-slate-700 mb-1">
//                       {field.label}{" "}
//                       {field.required && (
//                         <span className="text-red-500">*</span>
//                       )}
//                     </label>
//                     {field.type === "text" && (
//                       <input
//                         type="text"
//                         placeholder={field.placeholder}
//                         value={formData[field.name] || ""}
//                         onChange={(e) =>
//                           handleInputChange(field.name, e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
//                       />
//                     )}
//                     {field.type === "date" && (
//                       <input
//                         type="date"
//                         value={formData[field.name] || ""}
//                         onChange={(e) =>
//                           handleInputChange(field.name, e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700"
//                       />
//                     )}
//                     {field.type === "dropdown" && (
//                       <select
//                         value={formData[field.name] || ""}
//                         onChange={(e) =>
//                           handleInputChange(field.name, e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-700"
//                       >
//                         <option value="">Select Option</option>
//                         {field.options?.map((opt) => (
//                           <option key={opt} value={opt}>
//                             {opt}
//                           </option>
//                         ))}
//                       </select>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={onCancel}
//                   className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-md"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     alert("Document Saved & Uploaded!");
//                     onSubmitSuccess();
//                   }}
//                   className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1.5"
//                 >
//                   Submit & Save Document
//                 </button>
//               </div>
//             </div>

//             {/* Sidebar Details */}
//             <div className="col-span-4 space-y-6">
//               <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
//                 <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
//                   File Attachment
//                 </h4>
//                 <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-lg p-6 text-center space-y-2">
//                   <Upload size={20} className="mx-auto text-blue-600" />
//                   <p className="text-xs font-semibold text-slate-800">
//                     Drag & drop file or click to browse
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// ==========================================
// 4. MAIN CONTAINER & STATEFUL ROUTER
// ==========================================
export default function DocumentManagementModule() {
  const [currentView, setCurrentView] = useState("LIST"); // Views: "LIST" | "DETAIL" | "UPLOAD"
  const [selectedDoc, setSelectedDoc] = useState(null);

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
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      {currentView === "UPLOAD" && (
        <UploadDocumentView
          onCancel={handleBackToList}
          onSubmitSuccess={handleBackToList}
        />
      )}

      {currentView === "DETAIL" && selectedDoc && (
        <DocumentDetailView doc={selectedDoc} onBack={handleBackToList} />
      )}

      {currentView === "LIST" && (
        <DocumentsView
          onSelectDoc={handleSelectDoc}
          onNavigateToUpload={handleNavigateToUpload}
        />
      )}
    </div>
  );
}
