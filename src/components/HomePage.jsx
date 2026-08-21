import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  FolderLock,
  ClipboardList,
  Users,
  Search,
  Bell,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export function GrcHome({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 text-xs bg-slate-50 min-h-screen font-sans">
      {/* Top Banner / Welcome Bar */}
      <div className="bg-slate-600 text-white p-6 rounded-2xl relative overflow-hidden">
        {/* <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" /> */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            {/* <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30 rounded-full text-[10px] inline-block mb-1">
              GRC ENTERPRISE SUITE
            </span> */}
            <h1 className="text-xl font-extrabold tracking-tight">
              Governance, Risk & Compliance Management
            </h1>
            <p className="text-slate-300 max-w-xl">
              Monitor organizational compliance, track active risk posture,
              manage audit readiness, and orchestrate policy workflows.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center min-w-[100px]">
              <div className="text-lg font-black text-emerald-400">92%</div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Compliance Score
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center min-w-[100px]">
              <div className="text-lg font-black text-amber-400">14</div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Open Risks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModuleCard
          title="Document Governance"
          desc="Policies, SOPs, Approvals & Lifecycle"
          icon={<FolderLock size={20} className="text-blue-600" />}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          onClick={() => onNavigate && onNavigate("DOCUMENTS")}
        />
        <ModuleCard
          title="Risk Register"
          desc="Risk Assessments & Heatmaps"
          icon={<ShieldAlert size={20} className="text-amber-600" />}
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
          onClick={() => onNavigate && onNavigate("RISKS")}
        />
        <ModuleCard
          title="Compliance & Audit"
          desc="Frameworks, Controls & Internal Audits"
          icon={<FileCheck2 size={20} className="text-emerald-600" />}
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
          onClick={() => onNavigate && onNavigate("COMPLIANCE")}
        />
        <ModuleCard
          title="Workflow Engine"
          desc="Approval Chains & Level Configs"
          icon={<ClipboardList size={20} className="text-purple-600" />}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          onClick={() => onNavigate && onNavigate("WORKFLOWS")}
        />
      </div>

      {/* Main Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compliance Framework Scorecard */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Framework Compliance & Controls
              </h3>
              <p className="text-slate-400 text-[11px]">
                Real-time alignment against active regulatory benchmarks
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded text-[10px]">
              Q3 Status
            </span>
          </div>

          <div className="space-y-3.5">
            <FrameworkItem
              title="ISO 27001:2022 (ISMS)"
              score={94}
              totalControls={114}
              passedControls={107}
              status="Compliant"
              color="bg-emerald-500"
            />
            <FrameworkItem
              title="SOC 2 Type II"
              score={88}
              totalControls={64}
              passedControls={56}
              status="In Review"
              color="bg-blue-500"
            />
            <FrameworkItem
              title="GDPR & Data Privacy"
              score={96}
              totalControls={42}
              passedControls={40}
              status="Compliant"
              color="bg-emerald-500"
            />
            <FrameworkItem
              title="NIST Cybersecurity Framework"
              score={78}
              totalControls={108}
              passedControls={84}
              status="Remediation Required"
              color="bg-amber-500"
            />
          </div>
        </div>

        {/* Executive Risk Posture */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Enterprise Risk Heatmap Summary
              </h3>
              <ShieldAlert size={16} className="text-amber-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <RiskStatBox
                label="High / Critical"
                count="3"
                color="text-rose-600"
                bgColor="bg-rose-50"
              />
              <RiskStatBox
                label="Medium Risk"
                count="8"
                color="text-amber-600"
                bgColor="bg-amber-50"
              />
              <RiskStatBox
                label="Low Risk"
                count="15"
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <RiskStatBox
                label="Mitigated"
                count="24"
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-700">
                Top Priority Threat:
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="font-bold text-rose-900">
                  Third-Party API Data Exposure
                </div>
                <div className="text-[10px] text-rose-700 mt-0.5">
                  Assigned to: Information Security • Due in 4 days
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate("RISKS")}
            className="w-full mt-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[11px]"
          >
            Open Full Risk Register <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Audit Readiness & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Internal & External Audit Schedule */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Upcoming Audit Schedule
            </h3>
            <span className="text-[10px] text-blue-600 font-bold">
              View Calendar
            </span>
          </div>
          <div className="space-y-3">
            <AuditItem
              title="SOC 2 Annual Surveillance Audit"
              type="External Audit"
              date="Oct 12 - Oct 18, 2026"
              owner="Compliance Lead"
              status="Preparation"
            />
            <AuditItem
              title="Q3 Internal Financial Control Review"
              type="Internal Audit"
              date="Sep 28 - Sep 30, 2026"
              owner="Finance GRC Team"
              status="Scheduled"
            />
            <AuditItem
              title="IT General Controls (ITGC) Evaluation"
              type="Internal Audit"
              date="Oct 05 - Oct 08, 2026"
              owner="IT Security Manager"
              status="Scheduled"
            />
          </div>
        </div>

        {/* Real-time Audit & System Activity Feed */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity size={15} className="text-blue-600" />
              Live GRC Audit Stream
            </h3>
            <span className="text-[10px] text-slate-400">Auto-updating</span>
          </div>
          <div className="space-y-3">
            <LogStreamItem
              user="Michael Vance"
              action="Approved workflow level for"
              target="Vendor Management Policy"
              time="10m ago"
            />
            <LogStreamItem
              user="System Guard"
              action="Flagged control failure in"
              target="Access Control Matrix"
              time="1h ago"
              isAlert
            />
            <LogStreamItem
              user="Sarah Jenkins"
              action="Uploaded new evidence artifact for"
              target="ISO 27001 A.12.1"
              time="3h ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function ModuleCard({ title, desc, icon, bgColor, borderColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border ${borderColor} ${bgColor} hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="p-2.5 bg-white rounded-lg shadow-2xs">{icon}</div>
        <ChevronRight
          size={16}
          className="text-slate-400 group-hover:translate-x-1 transition-transform"
        />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FrameworkItem({
  title,
  score,
  totalControls,
  passedControls,
  status,
  color,
}) {
  return (
    <div className="space-y-1.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{title}</span>
          <span className="text-[10px] text-slate-400 font-medium">
            ({passedControls}/{totalControls} Controls)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900">{score}%</span>
          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">
            {status}
          </span>
        </div>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function RiskStatBox({ label, count, color, bgColor }) {
  return (
    <div className={`p-3 rounded-lg ${bgColor} border border-transparent`}>
      <div className={`text-base font-black ${color}`}>{count}</div>
      <div className="text-[10px] font-semibold text-slate-600">{label}</div>
    </div>
  );
}

function AuditItem({ title, type, date, owner, status }) {
  return (
    <div className="p-3 border border-slate-100 bg-slate-50 rounded-lg flex items-center justify-between">
      <div>
        <div className="font-bold text-slate-800">{title}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {type} • Owner: {owner}
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-slate-700 text-[11px]">{date}</div>
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[9px] rounded border border-blue-100 inline-block mt-0.5">
          {status}
        </span>
      </div>
    </div>
  );
}

function LogStreamItem({ user, action, target, time, isAlert }) {
  return (
    <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <div
        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
          isAlert ? "bg-rose-500" : "bg-blue-500"
        }`}
      />
      <div className="flex-1">
        <span className="font-bold text-slate-800">{user} </span>
        <span className="text-slate-600">{action} </span>
        <span className="font-semibold text-slate-900">{target}</span>
      </div>
      <span className="text-[10px] text-slate-400 shrink-0">{time}</span>
    </div>
  );
}
