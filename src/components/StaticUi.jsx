import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  GitMerge,
  Eye,
  CheckCircle2,
  BarChart3,
  Shield,
  Clock,
  Scale,
  Settings,
  History,
  Search,
  Bell,
  HelpCircle,
  Plus,
  Filter,
  MoreVertical,
  Download,
  Edit,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  User,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { backendUrlGrc } from "./config";
import axios from "axios";

export default function DocGovApp() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 font-bold text-xl text-white">
          <Shield className="h-6 w-6 text-blue-500 fill-blue-500/20" />
          <span>DocGov</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem
            icon={<FileText size={18} />}
            label="Documents"
            active={activeTab === "documents"}
            onClick={() => setActiveTab("documents")}
          />
          <NavItem
            icon={<CheckSquare size={18} />}
            label="My Tasks"
            badge="12"
            active={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
          />
          {/* <NavItem icon={<GitMerge size={18} />} label="Workflows" /> */}
          {/* <NavItem icon={<Eye size={18} />} label="Reviews" /> */}
          {/* <NavItem icon={<CheckCircle2 size={18} />} label="Approvals" /> */}
          {/* <NavItem icon={<BarChart3 size={18} />} label="Reports" /> */}

          {/* <NavAccordion icon={<Shield size={18} />} label="Governance" /> */}
          <NavItem
            icon={<Clock size={18} />}
            label="Retention"
            active={activeTab === "retention"}
            onClick={() => setActiveTab("retention")}
          />
          {/* <NavItem icon={<Scale size={18} />} label="Legal Hold" /> */}
          {/* <NavAccordion icon={<Settings size={18} />} label="System Admin" /> */}
          {/* <NavItem icon={<History size={18} />} label="Audit Trail" /> */}
          {/* <NavItem icon={<Settings size={18} />} label="Settings" /> */}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search documents, folders..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-slate-700">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                6
              </span>
            </button>
            <button className="text-slate-500 hover:text-slate-700">
              <HelpCircle size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                  alt="John Smith"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">John Smith</p>
                <p className="text-slate-500">Compliance Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Loader */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          {activeTab === "dashboard" && (
            <DashboardView onSelectDoc={() => setActiveTab("docDetail")} />
          )}
          {activeTab === "documents" && (
            <DocumentsView onSelectDoc={() => setActiveTab("docDetail")} />
          )}
          {activeTab === "docDetail" && <DocumentDetailView />}
          {activeTab === "tasks" && <TasksView />}
          {activeTab === "retention" && <RetentionView />}
        </main>
      </div>
    </div>
  );
}

// ---------------- Navigation Components ----------------

function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

function NavAccordion({ icon, label }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-md cursor-pointer">
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronDown size={14} />
    </div>
  );
}

// ---------------- View Components ----------------
export function DashboardView({
  onSelectDoc,
  userId = 2,
  organizationId = 1,
  departmentId = 1,
}) {
  const [metrics, setMetrics] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dashboardUrl = `${backendUrlGrc}/api/document-governance/dashboard?organizationId=${organizationId}&departmentId=${departmentId}`;
        const tasksUrl = `${backendUrlGrc}/api/document-governance/dashboard/GetPendingTastsAsync?UserId=${userId}`;

        const [dashboardRes, tasksRes] = await Promise.all([
          axios.get(dashboardUrl).catch(() => ({ data: null })),
          axios.get(tasksUrl).catch(() => ({ data: [] })),
        ]);

        if (dashboardRes.data) {
          setMetrics(dashboardRes.data);
        }

        if (tasksRes.data) {
          const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
          setPendingTasks(tasks);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard metrics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, organizationId, departmentId]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-slate-600 font-medium">
          Loading Dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  // Safe KPI extractors
  const totalDocs = metrics?.totalDocuments || 0;
  const draftDocs = metrics?.draftDocuments || 0;
  const inReviewDocs = metrics?.inReviewDocuments || 0;
  const pendingApprovalDocs = metrics?.pendingApprovalDocuments || 0;
  const publishedDocs = metrics?.publishedDocuments || 0;
  const legalHoldDocs = metrics?.legalHoldDocuments || 0;
  const archivedDocs = metrics?.archivedDocuments || 0;
  const expiringDocs = metrics?.expiring30Days || 0;

  // Percentage calculation helper
  const calcPct = (count) =>
    totalDocs > 0 ? Math.round((count / totalDocs) * 100) : 0;

  // Dynamic Workflow Aging (based on assignedAt date from API)
  const calculateAging = () => {
    const buckets = { "0-2": 0, "3-7": 0, "8-15": 0, "16-30": 0, ">30": 0 };
    const now = new Date();

    pendingTasks.forEach((task) => {
      const assignedDate = new Date(task.assignedAt);
      const diffDays = Math.floor((now - assignedDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) buckets["0-2"]++;
      else if (diffDays <= 7) buckets["3-7"]++;
      else if (diffDays <= 15) buckets["8-15"]++;
      else if (diffDays <= 30) buckets["16-30"]++;
      else buckets[">30"]++;
    });

    const maxCount = Math.max(...Object.values(buckets), 1);
    return { buckets, maxCount };
  };

  const { buckets, maxCount } = calculateAging();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Documents"
          count={totalDocs.toLocaleString()}
          color="bg-blue-500"
          icon={<FileText size={18} />}
        />
        <KpiCard
          title="Published Documents"
          count={publishedDocs.toLocaleString()}
          color="bg-emerald-500"
          icon={<FileText size={18} />}
        />
        <KpiCard
          title="Pending Approval"
          count={pendingApprovalDocs.toLocaleString()}
          color="bg-amber-500"
          icon={<Clock size={18} />}
        />
        <KpiCard
          title="In Review"
          count={inReviewDocs.toLocaleString()}
          color="bg-purple-500"
          icon={<Eye size={18} />}
        />
        <KpiCard
          title="Expiring Soon"
          count={expiringDocs.toLocaleString()}
          color="bg-red-500"
          icon={<AlertCircle size={18} />}
        />
      </div>

      {/* Main Charts & Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Documents by Status Chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">
            Documents by Status
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 rounded-full border-[14px] border-blue-500 border-t-emerald-500 border-r-amber-500 border-l-purple-500 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-slate-500">
                Status
              </span>
            </div>
            <div className="space-y-1.5 text-xs w-full">
              <StatusLegend
                color="bg-slate-400"
                label="Draft"
                count={`${draftDocs} (${calcPct(draftDocs)}%)`}
              />
              <StatusLegend
                color="bg-amber-400"
                label="In Review"
                count={`${inReviewDocs} (${calcPct(inReviewDocs)}%)`}
              />
              <StatusLegend
                color="bg-purple-500"
                label="Pending Approval"
                count={`${pendingApprovalDocs} (${calcPct(pendingApprovalDocs)}%)`}
              />
              <StatusLegend
                color="bg-emerald-500"
                label="Published"
                count={`${publishedDocs} (${calcPct(publishedDocs)}%)`}
              />
              <StatusLegend
                color="bg-indigo-500"
                label="Legal Hold"
                count={`${legalHoldDocs} (${calcPct(legalHoldDocs)}%)`}
              />
              <StatusLegend
                color="bg-red-400"
                label="Archived"
                count={`${archivedDocs} (${calcPct(archivedDocs)}%)`}
              />
            </div>
          </div>
        </div>

        {/* Workflow Aging (My Tasks) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">
            Workflow Aging ({pendingTasks.length} Pending Tasks)
          </h3>
          <div className="space-y-3 text-xs">
            <BarRow
              label="0 - 2 Days"
              width={`${(buckets["0-2"] / maxCount) * 100}%`}
              color="bg-emerald-500"
              value={buckets["0-2"]}
            />
            <BarRow
              label="3 - 7 Days"
              width={`${(buckets["3-7"] / maxCount) * 100}%`}
              color="bg-amber-400"
              value={buckets["3-7"]}
            />
            <BarRow
              label="8 - 15 Days"
              width={`${(buckets["8-15"] / maxCount) * 100}%`}
              color="bg-orange-400"
              value={buckets["8-15"]}
            />
            <BarRow
              label="16 - 30 Days"
              width={`${(buckets["16-30"] / maxCount) * 100}%`}
              color="bg-red-500"
              value={buckets["16-30"]}
            />
            <BarRow
              label="> 30 Days"
              width={`${(buckets[">30"] / maxCount) * 100}%`}
              color="bg-red-600"
              value={buckets[">30"]}
            />
          </div>
        </div>

        {/* Pending Approval / My Tasks List */}
        <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">
            Action Required (My Tasks)
          </h3>
          <div className="space-y-3 text-xs flex-1 overflow-y-auto max-h-[220px]">
            {pendingTasks.length === 0 ? (
              <p className="text-slate-400 text-center py-6">
                No pending tasks found.
              </p>
            ) : (
              pendingTasks.map((task) => (
                <TaskRow
                  key={task.taskId}
                  task={task}
                  onClick={() => onSelectDoc && onSelectDoc(task)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function KpiCard({ title, count, color, icon }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="text-xl font-bold text-slate-800 mt-1">{count}</p>
      </div>
      <div className={`p-2.5 rounded-lg text-white ${color}`}>{icon}</div>
    </div>
  );
}

function StatusLegend({ color, label, count }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-slate-600 truncate max-w-[100px]">{label}</span>
      </div>
      <span className="font-medium text-slate-800">{count}</span>
    </div>
  );
}

function BarRow({ label, width, color, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-slate-500 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: value > 0 ? width : "0%" }}
        />
      </div>
      <span className="w-4 text-right font-medium text-slate-700">{value}</span>
    </div>
  );
}

function TaskRow({ task, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-2.5 border border-slate-100 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 rounded cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start font-medium text-slate-800">
        <span className="truncate max-w-[180px]">{task.title}</span>
        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase font-bold">
          {task.priority}
        </span>
      </div>
      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
        <span>
          {task.documentNo} v{task.versionNo}
        </span>
        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function DocumentsView({ onSelectDoc }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Documents</h1>
        <div className="flex items-center gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-md font-medium flex items-center gap-1">
            <Plus size={16} /> New Document
          </button>
          <button className="border border-slate-200 text-slate-600 p-2 rounded-md hover:bg-slate-50">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-sm">
        <button className="border-b-2 border-blue-600 text-blue-600 font-semibold py-2">
          All Documents
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Drafts
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Published
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Archived
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Superseded
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            placeholder="Search documents..."
            className="border border-slate-200 rounded px-3 py-1.5 w-64 focus:outline-none"
          />
          <select className="border border-slate-200 rounded px-3 py-1.5 text-slate-600">
            <option>Document Type</option>
          </select>
          <select className="border border-slate-200 rounded px-3 py-1.5 text-slate-600">
            <option>Status</option>
          </select>
          <select className="border border-slate-200 rounded px-3 py-1.5 text-slate-600">
            <option>Owner</option>
          </select>
        </div>
        <button className="border border-slate-200 text-slate-600 px-3 py-1.5 rounded flex items-center gap-1">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Table */}
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
          <TableRow
            title="Information Security Policy"
            number="POL-IS-001"
            type="Policy"
            status="Published"
            statusColor="bg-emerald-100 text-emerald-800"
            version="2.0"
            owner="John Smith"
            date="08 May 2024"
            onSelect={onSelectDoc}
          />
          <TableRow
            title="Vendor Management Procedure"
            number="PRC-VN-002"
            type="Procedure"
            status="In Review"
            statusColor="bg-amber-100 text-amber-800"
            version="1.1"
            owner="Sarah Johnson"
            date="07 May 2024"
          />
          <TableRow
            title="Data Privacy Policy"
            number="POL-DP-003"
            type="Policy"
            status="Published"
            statusColor="bg-emerald-100 text-emerald-800"
            version="3.0"
            owner="Michael Brown"
            date="05 May 2024"
          />
          <TableRow
            title="Employee Onboarding Checklist"
            number="FRM-HR-004"
            type="Form"
            status="Draft"
            statusColor="bg-slate-100 text-slate-700"
            version="0.3"
            owner="Emily Davis"
            date="04 May 2024"
          />
          <TableRow
            title="Business Continuity Plan"
            number="PLN-BC-005"
            type="Plan"
            status="Pending Approval"
            statusColor="bg-purple-100 text-purple-800"
            version="1.0"
            owner="David Wilson"
            date="02 May 2024"
          />
        </tbody>
      </table>
    </div>
  );
}

function DocumentDetailView() {
  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-slate-200 rounded text-slate-600">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            Information Security Policy (POL-IS-001)
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded flex items-center gap-1 font-medium">
            <Download size={14} /> Download
          </button>
          <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded flex items-center gap-1 font-medium">
            <Edit size={14} /> Edit
          </button>
          <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 p-1.5 rounded">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold text-slate-500">
        <button className="text-blue-600 border-b-2 border-blue-600 pb-2">
          Overview
        </button>
        <button className="hover:text-slate-800 pb-2">Details</button>
        <button className="hover:text-slate-800 pb-2">Versions</button>
        <button className="hover:text-slate-800 pb-2">Workflow</button>
        <button className="hover:text-slate-800 pb-2">Permissions</button>
        <button className="hover:text-slate-800 pb-2">References</button>
        <button className="hover:text-slate-800 pb-2">Audit Trail</button>
      </div>

      {/* Preview & Info Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Document Viewer Frame */}
        <div className="col-span-5 bg-slate-800 rounded-lg overflow-hidden flex flex-col h-96">
          <div className="bg-slate-900 p-4 text-white flex-1 flex flex-col justify-center items-center text-center">
            <h2 className="text-lg font-bold tracking-wider mb-2">
              INFORMATION SECURITY POLICY
            </h2>
            <p className="text-[10px] text-slate-400 max-w-xs">
              This document outlines organization-wide security protocols for
              data assets, network access, and user operations.
            </p>
          </div>
          <div className="bg-slate-900 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
            <span>Page 1 / 12</span>
            <div className="flex items-center gap-2">
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="col-span-7 grid grid-cols-2 gap-6 text-xs bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-1">
              Document Information
            </h3>
            <InfoRow label="Document Number" value="POL-IS-001" />
            <InfoRow label="Type" value="Policy" />
            <InfoRow
              label="Status"
              value={
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  Published
                </span>
              }
            />
            <InfoRow label="Current Version" value="2.0" />
            <InfoRow label="Owner" value="John Smith" />
            <InfoRow label="Effective Date" value="01 Apr 2024" />
            <InfoRow label="Review Date" value="01 Apr 2025" />
            <InfoRow
              label="Classification"
              value={
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                  Confidential
                </span>
              }
            />
            <InfoRow label="Retention Period" value="7 Years" />
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-1">
              Related Information
            </h3>
            <InfoRow label="Workflows" value="Policy Approval Workflow" />
            <InfoRow label="Category" value="Information Security" />
            <InfoRow label="Department" value="IT" />
            <InfoRow label="Created By" value="John Smith" />
            <InfoRow label="Created On" value="15 Mar 2024" />
            <InfoRow label="Last Modified By" value="John Smith" />
            <InfoRow label="Last Modified On" value="08 May 2024" />
          </div>
        </div>
      </div>

      {/* Stepper Workflow Progress Widget */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">
          Workflow Progress – Information Security Policy (POL-IS-001)
        </h3>

        <div className="flex items-center justify-between relative px-6 py-4">
          <WorkflowStep
            label="Author"
            name="John Smith"
            date="15 Mar 2024"
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
          <WorkflowStep label="Legal Review" pending />
          <WorkflowStep label="Final Approval" pending />
          <WorkflowStep label="Publish" pending />
        </div>

        {/* Current Step Action Box */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex items-center justify-between text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-slate-700">Current Step Details</p>
            <div className="flex gap-6 text-slate-600">
              <span>
                <strong>Step Name:</strong> Approval
              </span>
              <span>
                <strong>Assigned To:</strong> David Wilson
              </span>
              <span>
                <strong>Due Date:</strong> 12 May 2024
              </span>
              <span>
                <strong>Status:</strong>{" "}
                <span className="text-blue-600 font-semibold">In Progress</span>
              </span>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded">
            Take Action
          </button>
        </div>
      </div>
    </div>
  );
}

function TasksView() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
      <h1 className="text-xl font-bold text-slate-800">My Tasks</h1>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold">
        <button className="border-b-2 border-blue-600 text-blue-600 py-2">
          All
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Review
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Approval
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Information
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Completed
        </button>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
            <th className="p-3">Task Title</th>
            <th className="p-3">Document</th>
            <th className="p-3">Workflow</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <TaskRow
            title="Review Document"
            doc="Vendor Management Procedure"
            workflow="Procedure Review Workflow"
            due="12 May 2024"
            priority="High"
            priorityColor="bg-red-100 text-red-700"
            action="Review"
          />
          <TaskRow
            title="Approve Document"
            doc="Business Continuity Plan"
            workflow="Policy Approval Workflow"
            due="14 May 2024"
            priority="Medium"
            priorityColor="bg-amber-100 text-amber-700"
            action="Approve"
          />
          <TaskRow
            title="Review Document"
            doc="Employee Handbook"
            workflow="Policy Review Workflow"
            due="16 May 2024"
            priority="Low"
            priorityColor="bg-emerald-100 text-emerald-700"
            action="Review"
          />
          <TaskRow
            title="Approve Document"
            doc="Travel Policy"
            workflow="Policy Approval Workflow"
            due="18 May 2024"
            priority="Medium"
            priorityColor="bg-amber-100 text-amber-700"
            action="Approve"
          />
          <TaskRow
            title="Review Document"
            doc="Data Classification Policy"
            workflow="Policy Review Workflow"
            due="20 May 2024"
            priority="High"
            priorityColor="bg-red-100 text-red-700"
            action="Review"
          />
        </tbody>
      </table>
    </div>
  );
}

function RetentionView() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
      <h1 className="text-xl font-bold text-slate-800">
        Retention & Disposition
      </h1>

      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold">
        <button className="border-b-2 border-blue-600 text-blue-600 py-2">
          Retention Schedule
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Due for Review
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Due for Disposition
        </button>
        <button className="text-slate-500 py-2 hover:text-slate-800">
          Disposed
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4 bg-slate-50 p-3 rounded-md text-xs border border-slate-200">
        <div>
          <span className="text-slate-500 block">Total Documents</span>
          <span className="font-bold text-base">4,892</span>
        </div>
        <div>
          <span className="text-slate-500 block">Under Retention</span>
          <span className="font-bold text-base text-blue-600">3,256</span>
        </div>
        <div>
          <span className="text-slate-500 block">Due for Review</span>
          <span className="font-bold text-base text-amber-600">52</span>
        </div>
        <div>
          <span className="text-slate-500 block">Due for Disposition</span>
          <span className="font-bold text-base text-red-600">27</span>
        </div>
        <div>
          <span className="text-slate-500 block">On Legal Hold</span>
          <span className="font-bold text-base text-purple-600">14</span>
        </div>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
            <th className="p-3">Document</th>
            <th className="p-3">Retention Category</th>
            <th className="p-3">Retention Period</th>
            <th className="p-3">Retain Until</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <RetentionRow
            doc="Information Security Policy"
            category="Corporate Policy"
            period="7 Years"
            until="01 Apr 2031"
            status="Under Retention"
            statusColor="bg-emerald-100 text-emerald-800"
          />
          <RetentionRow
            doc="Vendor Management Procedure"
            category="Operational"
            period="5 Years"
            until="07 May 2029"
            status="Under Retention"
            statusColor="bg-emerald-100 text-emerald-800"
          />
          <RetentionRow
            doc="Employee Contracts"
            category="HR Records"
            period="7 Years"
            until="10 Jan 2030"
            status="Due for Review"
            statusColor="bg-amber-100 text-amber-800"
          />
          <RetentionRow
            doc="Financial Statements"
            category="Finance Records"
            period="10 Years"
            until="31 Dec 2032"
            status="On Legal Hold"
            statusColor="bg-purple-100 text-purple-800"
          />
        </tbody>
      </table>
    </div>
  );
}

// ---------------- Helper Components ----------------

// function KpiCard({ title, count, color, icon }) {
//   return (
//     <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
//       <div>
//         <p className="text-xs text-slate-500 font-medium">{title}</p>
//         <p className="text-xl font-bold text-slate-800 mt-1">{count}</p>
//         <span className="text-[10px] text-blue-600 font-medium hover:underline cursor-pointer">
//           View all
//         </span>
//       </div>
//       <div className={`p-2.5 rounded-lg text-white ${color}`}>{icon}</div>
//     </div>
//   );
// }

// function StatusLegend({ color, label, count }) {
//   return (
//     <div className="flex items-center gap-2">
//       <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
//       <span className="text-slate-600">{label}:</span>
//       <span className="font-semibold text-slate-800">{count}</span>
//     </div>
//   );
// }

// function BarRow({ label, width, color, value }) {
//   return (
//     <div className="space-y-1">
//       <div className="flex justify-between text-slate-600">
//         <span>{label}</span>
//         <span className="font-semibold">{value}</span>
//       </div>
//       <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
//         <div className={`h-full ${color}`} style={{ width }} />
//       </div>
//     </div>
//   );
// }

function ExpiringRow({ title, date, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 hover:bg-slate-50 p-1 rounded cursor-pointer"
    >
      <span className="font-medium text-slate-700 truncate max-w-[180px]">
        {title}
      </span>
      <span className="text-red-500 font-semibold">{date}</span>
    </div>
  );
}

function TableRow({
  title,
  number,
  type,
  status,
  statusColor,
  version,
  owner,
  date,
  onSelect,
}) {
  return (
    <tr className="hover:bg-slate-50 cursor-pointer" onClick={onSelect}>
      <td className="p-3 font-medium text-slate-800">{title}</td>
      <td className="p-3 text-slate-500">{number}</td>
      <td className="p-3 text-slate-500">{type}</td>
      <td className="p-3">
        <span
          className={`px-2 py-0.5 rounded font-semibold text-[11px] ${statusColor}`}
        >
          {status}
        </span>
      </td>
      <td className="p-3 text-slate-500">{version}</td>
      <td className="p-3 text-slate-500">{owner}</td>
      <td className="p-3 text-slate-500">{date}</td>
      <td className="p-3 text-right text-slate-400">
        <button className="hover:text-slate-600 p-1">
          <Eye size={14} />
        </button>
        <button className="hover:text-slate-600 p-1">
          <MoreVertical size={14} />
        </button>
      </td>
    </tr>
  );
}

function WorkflowStep({ label, name, date, completed, active, pending }) {
  return (
    <div className="flex flex-col items-center text-center z-10">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
          completed
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-blue-600 text-white ring-4 ring-blue-100"
              : "bg-slate-200 text-slate-500"
        }`}
      >
        {completed ? <Check size={14} /> : active ? <Clock size={14} /> : ""}
      </div>
      <span className="mt-2 font-bold text-slate-800 text-[11px]">{label}</span>
      {name && <span className="text-[10px] text-slate-500">{name}</span>}
      {date && <span className="text-[10px] text-slate-400">{date}</span>}
    </div>
  );
}

// function TaskRow({
//   title,
//   doc,
//   workflow,
//   due,
//   priority,
//   priorityColor,
//   action,
// }) {
//   return (
//     <tr className="hover:bg-slate-50">
//       <td className="p-3 font-medium text-slate-800">{title}</td>
//       <td className="p-3 text-slate-600">{doc}</td>
//       <td className="p-3 text-slate-500">{workflow}</td>
//       <td className="p-3 text-slate-500">{due}</td>
//       <td className="p-3">
//         <span
//           className={`px-2 py-0.5 rounded text-[10px] font-semibold ${priorityColor}`}
//         >
//           {priority}
//         </span>
//       </td>
//       <td className="p-3">
//         <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-semibold">
//           Pending
//         </span>
//       </td>
//       <td className="p-3 text-right">
//         <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded text-[11px] font-medium">
//           {action}
//         </button>
//       </td>
//     </tr>
//   );
// }

function RetentionRow({ doc, category, period, until, status, statusColor }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="p-3 font-medium text-slate-800">{doc}</td>
      <td className="p-3 text-slate-500">{category}</td>
      <td className="p-3 text-slate-500">{period}</td>
      <td className="p-3 text-slate-500">{until}</td>
      <td className="p-3">
        <span
          className={`px-2 py-0.5 rounded font-semibold text-[10px] ${statusColor}`}
        >
          {status}
        </span>
      </td>
      <td className="p-3 text-right text-slate-400">
        <button className="hover:text-slate-600 p-1">
          <Eye size={14} />
        </button>
      </td>
    </tr>
  );
}
