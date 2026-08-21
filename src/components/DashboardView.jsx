import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Clock,
  Eye,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Upload,
  Search,
  Filter,
  Activity,
  FolderCheck,
} from "lucide-react";
import { backendUrlGrc } from "./config";

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
  const [timeRange, setTimeRange] = useState("30d");

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
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600 font-medium text-xs">
          Loading Document Governance Dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
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

  // Dynamic Workflow Aging
  const calculateAging = () => {
    const buckets = { "0-2": 0, "3-7": 0, "8-15": 0, "16-30": 0, ">30": 0 };
    const now = new Date();

    pendingTasks.forEach((task) => {
      const assignedDate = new Date(task.assignedAt || Date.now());
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
    <div className="space-y-6 text-xs bg-slate-50 min-h-screen p-1">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Document Governance Dashboard
          </h1>
          <p className="text-slate-500 font-medium">
            Overview of policies, active workflows, and compliance compliance
            status.
          </p>
        </div>
        {/* <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white font-medium focus:ring-1 focus:ring-blue-600 outline-none"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
            <Plus size={14} /> Create Document
          </button>
        </div> */}
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Documents"
          count={totalDocs.toLocaleString()}
          subtitle={`${calcPct(publishedDocs)}% Published`}
          color="bg-blue-600"
          icon={<FileText size={18} className="text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <KpiCard
          title="Published"
          count={publishedDocs.toLocaleString()}
          subtitle="Active & Compliance Ready"
          color="bg-emerald-600"
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <KpiCard
          title="Pending Approval"
          count={pendingApprovalDocs.toLocaleString()}
          subtitle="Requires Action"
          color="bg-amber-600"
          icon={<Clock size={18} className="text-amber-600" />}
          bgColor="bg-amber-50"
        />
        <KpiCard
          title="In Review"
          count={inReviewDocs.toLocaleString()}
          subtitle="Under Assessment"
          color="bg-purple-600"
          icon={<Eye size={18} className="text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <KpiCard
          title="Expiring Soon"
          count={expiringDocs.toLocaleString()}
          subtitle="Next 30 Days"
          color="bg-rose-600"
          icon={<AlertCircle size={18} className="text-rose-600" />}
          bgColor="bg-rose-50"
        />
      </div>

      {/* Central Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Documents by Status Breakdown */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Document Lifecycle Status
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                Live Data
              </span>
            </div>
            <div className="flex items-center gap-6 my-2">
              <div className="relative w-28 h-28 rounded-full border-[12px] border-blue-500 border-t-emerald-500 border-r-amber-500 border-l-purple-500 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </span>
              </div>
              <div className="space-y-2 text-xs w-full">
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
                  color="bg-rose-400"
                  label="Archived"
                  count={`${archivedDocs} (${calcPct(archivedDocs)}%)`}
                />
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
            <span>Total Tracked Documents:</span>
            <span className="font-bold text-slate-700">{totalDocs}</span>
          </div>
        </div>

        {/* Workflow Aging Bar Graph */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Workflow Aging ({pendingTasks.length})
              </h3>
              <span className="text-[10px] text-slate-400">Time in Stage</span>
            </div>
            <div className="space-y-3.5 my-2">
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
                color="bg-rose-500"
                value={buckets["16-30"]}
              />
              <BarRow
                label="> 30 Days"
                width={`${(buckets[">30"] / maxCount) * 100}%`}
                color="bg-rose-700"
                value={buckets[">30"]}
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Stagnant Requests (&gt;15d):</span>
            <span className="font-bold text-rose-600">
              {buckets["16-30"] + buckets[">30"]} Task(s)
            </span>
          </div>
        </div>

        {/* Action Required / Pending Tasks Container */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>Action Required</span>
                <span className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-600 border border-rose-200 rounded-full font-bold">
                  {pendingTasks.length}
                </span>
              </h3>
            </div>
            <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <FolderCheck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-slate-400 font-medium">
                    All clear! No pending tasks.
                  </p>
                </div>
              ) : (
                pendingTasks.map((task, index) => (
                  <TaskRow
                    key={task.taskId || index}
                    task={task}
                    onClick={() => onSelectDoc && onSelectDoc(task)}
                  />
                ))
              )}
            </div>
          </div>
          <button className="w-full mt-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px]">
            View All Pending Actions <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* Secondary Bottom Section: Category Breakdown & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Categories Progress */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm mb-4">
            Document Category Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Policies & Standards</span>
                <span>45%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Standard Operating Procedures (SOP)</span>
                <span>30%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: "30%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Compliance & Regulatory Artifacts</span>
                <span>25%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: "25%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Governance Audit Log Activity Feed */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Activity size={15} className="text-blue-600" />
            Recent Governance Activity
          </h3>
          <div className="space-y-3">
            <ActivityItem
              title="Information Security Policy v2.4 Published"
              time="2 hours ago"
              user="Sarah Jenkins"
              badge="Published"
              badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            />
            <ActivityItem
              title="Data Retention Procedure Submitted for Review"
              time="4 hours ago"
              user="Michael Vance"
              badge="In Review"
              badgeColor="bg-amber-50 text-amber-700 border-amber-200"
            />
            <ActivityItem
              title="Vendor Governance Contract Legal Hold Applied"
              time="1 day ago"
              user="Compliance Legal Team"
              badge="Legal Hold"
              badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper Subcomponents
// ---------------------------------------------------------------------------

function KpiCard({ title, count, subtitle, icon, bgColor }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          {title}
        </span>
        <div className="text-xl font-extrabold text-slate-900 my-0.5">
          {count}
        </div>
        <span className="text-[10px] text-slate-500 font-medium">
          {subtitle}
        </span>
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>{icon}</div>
    </div>
  );
}

function StatusLegend({ color, label, count }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-slate-600 font-medium">{label}</span>
      </div>
      <span className="font-bold text-slate-800">{count}</span>
    </div>
  );
}

function BarRow({ label, width, color, value }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-medium text-slate-600">
        <span>{label}</span>
        <span className="font-bold text-slate-800">{value}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: width === "0%" ? "2%" : width }}
        />
      </div>
    </div>
  );
}

function TaskRow({ task, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-2.5 border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 rounded-lg cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
    >
      <div className="space-y-0.5 max-w-[75%]">
        <div className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {task.documentTitle || task.title || "Untitled Document"}
        </div>
        <div className="text-[10px] text-slate-400">
          Step: {task.stepName || "Approval"} • Assigned:{" "}
          {task.assignedAt
            ? new Date(task.assignedAt).toLocaleDateString()
            : "Recently"}
        </div>
      </div>
      <span className="px-2 py-1 text-[10px] bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
        Review
      </span>
    </div>
  );
}

function ActivityItem({ title, time, user, badge, badgeColor }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <div className="space-y-0.5">
        <div className="font-bold text-slate-800">{title}</div>
        <div className="text-[10px] text-slate-400">
          {user} • {time}
        </div>
      </div>
      <span
        className={`px-2 py-0.5 text-[10px] font-bold border rounded-md ${badgeColor}`}
      >
        {badge}
      </span>
    </div>
  );
}
