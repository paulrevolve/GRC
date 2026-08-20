import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Copy,
  Trash2,
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  GitBranch,
  Bell,
  Flag,
  Save,
  Loader2,
  Check,
  ChevronUp,
  ChevronDown,
  Layers,
} from "lucide-react";
import { backendUrlGrc } from "./config";

// ---------------------------------------------------------------------------
// API Client mapped to WorkflowController routes
// ---------------------------------------------------------------------------
const createWorkflowApi = () => ({
  async getAll() {
    const res = await fetch(`${backendUrlGrc}/api/workflows`);
    if (!res.ok) throw new Error("Failed to fetch workflows");
    return res.json();
  },
  async getById(id) {
    const res = await fetch(`${backendUrlGrc}/api/workflows/${id}`);
    if (!res.ok) throw new Error("Failed to fetch workflow");
    return res.json();
  },
  async create(dto) {
    const res = await fetch(`${backendUrlGrc}/api/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to create workflow");
    return res.json();
  },
  async update(id, dto) {
    const res = await fetch(`${backendUrlGrc}/api/workflows/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to update workflow");
    return res.json().catch(() => ({}));
  },
  async remove(id) {
    const res = await fetch(`${backendUrlGrc}/api/workflows/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete workflow");
    return true;
  },
  async getLevels(workflowId) {
    const res = await fetch(
      `${backendUrlGrc}/api/workflows/${workflowId}/levels`,
    );
    if (!res.ok) throw new Error("Failed to fetch workflow levels");
    return res.json();
  },
  async addLevel(workflowId, dto) {
    const res = await fetch(
      `${backendUrlGrc}/api/workflows/${workflowId}/levels`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      },
    );
    if (!res.ok) throw new Error("Failed to add level");
    return res.json();
  },
  async updateLevel(levelId, dto) {
    const res = await fetch(
      `${backendUrlGrc}/api/workflows/levels/${levelId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      },
    );
    if (!res.ok) throw new Error("Failed to update level");
    return res.json();
  },
  async removeLevel(levelId) {
    const res = await fetch(
      `${backendUrlGrc}/api/workflows/levels/${levelId}`,
      { method: "DELETE" },
    );
    if (!res.ok) throw new Error("Failed to remove level");
    return true;
  },
  async addApprover(levelId, dto) {
    const res = await fetch(
      `${backendUrlGrc}/api/workflows/levels/${levelId}/approvers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      },
    );
    if (!res.ok) throw new Error("Failed to add approver");
    return res.json();
  },
  async removeApprover(approverId) {
    const res = await fetch(
      `${backendUrlGrc}/api/workflows/approvers/${approverId}`,
      { method: "DELETE" },
    );
    if (!res.ok) throw new Error("Failed to remove approver");
    return true;
  },
  // Fetches steps dynamically from API endpoint
  async getWorkflowSteps() {
    const res = await fetch(`http://localhost:5294/api/WorkflowStep`);
    if (!res.ok) throw new Error("Failed to fetch workflow steps");
    return res.json();
  },
});

// Utility icon mapper for API step types
const getStepIcon = (type) => {
  switch (type) {
    case "APPROVAL":
      return Users;
    case "REVIEW":
      return User;
    case "SIGNATURE":
      return Edit2;
    case "PUBLISH":
      return Flag;
    default:
      return Layers;
  }
};

// // Step palette config
// const STEP_TYPES = [
//   {
//     mode: "SINGLE",
//     label: "Approver",
//     icon: User,
//     hint: "One approver signs off",
//   },
//   {
//     mode: "ALL",
//     label: "Parallel Approval",
//     icon: Users,
//     hint: "Everyone at this level must approve",
//   },
//   {
//     mode: "CONDITION",
//     label: "Condition",
//     icon: GitBranch,
//     hint: "Branch based on a rule",
//   },
//   {
//     mode: "NOTIFICATION",
//     label: "Notification",
//     icon: Bell,
//     hint: "Notify without requiring approval",
//   },
//   {
//     mode: "END",
//     label: "End / Publish",
//     icon: Flag,
//     hint: "Terminates and publishes",
//   },
// ];

// const stepMeta = (mode) =>
//   STEP_TYPES.find((s) => s.mode === mode) || STEP_TYPES[0];

const emptyBasicInfo = {
  workflowName: "",
  module: "GENERAL",
  description: "",
  isActive: true,
};

// const newLevel = (order, mode = "SINGLE") => ({
//   tempId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
//   levelId: null,
//   levelOrder: order,
//   levelName: stepMeta(mode).label,
//   approvalMode: mode,
//   approvalRule: "",
//   isRequired: true,
//   slaHours: 24,
//   approvers: [],
// });

export function WorkflowManager() {
  const workflowApi = React.useMemo(() => createWorkflowApi(), []);

  const [workflows, setWorkflows] = useState([]);
  const [apiSteps, setApiSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [currentView, setCurrentView] = useState("LIST");
  const [wizardStep, setWizardStep] = useState(1);
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);
  const [basicInfo, setBasicInfo] = useState(emptyBasicInfo);
  const [levels, setLevels] = useState([]);
  const [removedLevelIds, setRemovedLevelIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [detailLevels, setDetailLevels] = useState([]);
  const [detailTab, setDetailTab] = useState("DESIGN");
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [workflowData, stepData] = await Promise.all([
        workflowApi.getAll(),
        workflowApi.getWorkflowSteps(),
      ]);
      setWorkflows(workflowData || []);
      setApiSteps(stepData || []);
    } catch (err) {
      setError("Couldn't load workflows. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [workflowApi]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const loadDetail = async (workflow) => {
    setSelectedWorkflow(workflow);
    setDetailTab("DESIGN");
    setCurrentView("DETAIL");
    setDetailLoading(true);
    try {
      const [fresh, freshLevels] = await Promise.all([
        workflowApi.getById(workflow.workflowId),
        workflowApi.getLevels(workflow.workflowId),
      ]);
      setSelectedWorkflow(fresh || workflow);
      setDetailLevels(
        (freshLevels || []).sort((a, b) => a.levelOrder - b.levelOrder),
      );
    } catch (err) {
      setDetailLevels([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateWizard = () => {
    setEditingWorkflowId(null);
    setBasicInfo(emptyBasicInfo);
    const initialStep = apiSteps.length > 0 ? apiSteps[0] : null;
    setLevels([createLevelFromApiStep(1, initialStep)]);
    setRemovedLevelIds([]);
    setWizardStep(1);
    setSaveError("");
    setCurrentView("WIZARD");
  };

  const openEditWizard = async (workflow) => {
    setEditingWorkflowId(workflow.workflowId);
    setSaveError("");
    setCurrentView("WIZARD");
    setWizardStep(1);
    try {
      const [full, fullLevels] = await Promise.all([
        workflowApi.getById(workflow.workflowId),
        workflowApi.getLevels(workflow.workflowId),
      ]);
      setBasicInfo({
        workflowName: full?.workflowName ?? workflow.workflowName ?? "",
        module: full?.module ?? workflow.module ?? "GENERAL",
        description: full?.description ?? workflow.description ?? "",
        isActive: full?.isActive ?? workflow.isActive ?? true,
      });
      const mapped = (fullLevels || [])
        .sort((a, b) => a.levelOrder - b.levelOrder)
        .map((l) => ({ ...l, tempId: `existing-${l.levelId}` }));
      const initialStep = apiSteps.length > 0 ? apiSteps[0] : null;
      setLevels(
        mapped.length ? mapped : [createLevelFromApiStep(1, initialStep)],
      );
      setRemovedLevelIds([]);
    } catch (err) {
      setSaveError("Couldn't load workflow details.");
    }
  };

  const saveWorkflow = async () => {
    if (!basicInfo.workflowName.trim()) {
      setSaveError("Workflow name is required.");
      setWizardStep(1);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      let workflowId = editingWorkflowId;
      const dto = {
        workflowName: basicInfo.workflowName,
        description: basicInfo.description,
        module: basicInfo.module,
        createdBy: "Admin User",
      };

      if (workflowId) {
        await workflowApi.update(workflowId, dto);
      } else {
        const created = await workflowApi.create(dto);
        workflowId = created.workflowId;
      }

      for (const id of removedLevelIds) {
        await workflowApi.removeLevel(id);
      }

      for (const level of levels) {
        const levelDto = {
          levelOrder: level.levelOrder,
          levelName: level.levelName,
          approvalMode: level.approvalMode,
          approvalRule: level.approvalRule,
          isRequired: level.isRequired,
          slaHours: Number(level.slaHours) || 0,
        };
        if (level.levelId) {
          await workflowApi.updateLevel(level.levelId, levelDto);
        } else {
          await workflowApi.addLevel(workflowId, levelDto);
        }
      }

      await fetchWorkflows();
      setCurrentView("LIST");
    } catch (err) {
      setSaveError("Failed to save workflow.");
    } finally {
      setSaving(false);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch = (w.workflowName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === "All" || w.module === filterModule;
    const status = w.isActive === false ? "Inactive" : "Active";
    const matchesStatus = filterStatus === "All" || status === filterStatus;
    return matchesSearch && matchesModule && matchesStatus;
  });

  const moduleOptions = [
    "All",
    ...Array.from(new Set(workflows.map((w) => w.module).filter(Boolean))),
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-xs space-y-6">
      <Header
        currentView={currentView}
        onCreate={openCreateWizard}
        onBack={() => setCurrentView("LIST")}
      />

      {error && currentView === "LIST" && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-md p-3 font-medium">
          {error}
        </div>
      )}

      {currentView === "LIST" && (
        <ListView
          loading={loading}
          filteredWorkflows={filteredWorkflows}
          moduleOptions={moduleOptions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterModule={filterModule}
          setFilterModule={setFilterModule}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          onView={loadDetail}
          onEdit={openEditWizard}
          onDelete={async (id) => {
            if (window.confirm("Delete this workflow?")) {
              await workflowApi.remove(id);
              fetchWorkflows();
            }
          }}
        />
      )}

      {currentView === "WIZARD" && (
        <Wizard
          wizardStep={wizardStep}
          setWizardStep={setWizardStep}
          basicInfo={basicInfo}
          setBasicInfo={setBasicInfo}
          levels={levels}
          apiSteps={apiSteps}
          addStep={(mode) =>
            setLevels((prev) => [...prev, newLevel(prev.length + 1, mode)])
          }
          updateLevelField={(tempId, field, value) =>
            setLevels((prev) =>
              prev.map((l) =>
                l.tempId === tempId ? { ...l, [field]: value } : l,
              ),
            )
          }
          removeStep={(level) => {
            if (level.levelId)
              setRemovedLevelIds((prev) => [...prev, level.levelId]);
            setLevels((prev) =>
              prev
                .filter((l) => l.tempId !== level.tempId)
                .map((l, idx) => ({ ...l, levelOrder: idx + 1 })),
            );
          }}
          moveStep={(index, dir) => {
            setLevels((prev) => {
              const next = [...prev];
              const target = index + dir;
              if (target < 0 || target >= next.length) return prev;
              [next[index], next[target]] = [next[target], next[index]];
              return next.map((l, idx) => ({ ...l, levelOrder: idx + 1 }));
            });
          }}
          saving={saving}
          saveError={saveError}
          onCancel={() => setCurrentView("LIST")}
          onSave={saveWorkflow}
          isEditing={!!editingWorkflowId}
        />
      )}

      {currentView === "DETAIL" && selectedWorkflow && (
        <DetailView
          workflow={selectedWorkflow}
          levels={detailLevels}
          loading={detailLoading}
          onEdit={() => openEditWizard(selectedWorkflow)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header({ currentView, onCreate, onBack }) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div>
        <div className="text-slate-400 text-[11px] mb-0.5">
          Home &gt; Workflows &gt; Manage Workflows
        </div>
        <h1 className="text-lg font-bold text-slate-900">Manage Workflows</h1>
      </div>
      {currentView === "LIST" ? (
        <button
          onClick={onCreate}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={15} /> Create Workflow
        </button>
      ) : (
        <button
          onClick={onBack}
          className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to List
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// List View Component
// ---------------------------------------------------------------------------
function ListView({
  loading,
  filteredWorkflows,
  moduleOptions,
  searchTerm,
  setSearchTerm,
  filterModule,
  setFilterModule,
  filterStatus,
  setFilterStatus,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 h-fit">
        <div className="flex items-center gap-1.5 border-b pb-2 font-bold text-slate-800">
          <Filter size={14} /> FILTERS
        </div>
        <div className="space-y-1">
          <label className="font-medium text-slate-600">Search</label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-2.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search workflow..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-medium text-slate-600">Module</label>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full p-1.5 border border-slate-200 rounded-md text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {moduleOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-medium text-slate-600">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-1.5 border border-slate-200 rounded-md text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-9 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
          <span>WORKFLOWS</span>
          <span className="text-slate-400 font-normal">
            Showing {filteredWorkflows.length} entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3">#</th>
                <th className="p-3">Workflow Name</th>
                <th className="p-3">Module</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Loading workflows...
                  </td>
                </tr>
              ) : filteredWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No workflows found.
                  </td>
                </tr>
              ) : (
                filteredWorkflows.map((item, index) => (
                  <tr
                    key={item.workflowId || index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3 text-slate-500">{index + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {item.workflowName}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-bold text-[10px]">
                        {item.module || "GENERAL"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${item.isActive === false ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}
                      >
                        {item.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(item)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
                          title="View"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(item.workflowId)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-slate-200"
                          title="Delete"
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wizard Component
// ---------------------------------------------------------------------------
function Wizard({
  wizardStep,
  setWizardStep,
  basicInfo,
  setBasicInfo,
  levels,
  apiSteps,
  addStep,
  updateLevelField,
  removeStep,
  moveStep,
  saving,
  saveError,
  onCancel,
  onSave,
  isEditing,
}) {
  const steps = ["Basic Info", "Design Workflow", "Review"];

  return (
    <div className="w-full p-4 mx-auto bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-base font-bold text-slate-800">
          {isEditing ? "Edit Workflow" : "Create Workflow"}
        </h2>
        <div className="flex items-center gap-2 mt-4">
          {steps.map((label, idx) => {
            const n = idx + 1;
            const active = wizardStep === n;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                  >
                    {n}
                  </div>
                  <span
                    className={`font-semibold ${active ? "text-slate-900" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                </div>
                {n < steps.length && <div className="w-12 h-px bg-slate-200" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {wizardStep === 1 && (
          <div className="max-w-md space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Workflow Name *
              </label>
              <input
                type="text"
                value={basicInfo.workflowName}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, workflowName: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Module
              </label>
              <select
                value={basicInfo.module}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, module: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="CONTRACT">Contract</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={basicInfo.description}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, description: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 space-y-2">
              <div className="font-bold text-slate-700 border-b pb-2">
                AVAILABLE API STEPS
              </div>
              {apiSteps.map((step) => {
                const IconComponent = getStepIcon(step.stepType);
                return (
                  <button
                    key={step.workflowStepId}
                    onClick={() => addStep(step)}
                    className="w-full flex items-center justify-between p-2.5 border border-slate-200 rounded-md hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent
                        size={15}
                        className="text-blue-600 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-700">
                          {step.stepName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Code: {step.stepCode} | SLA: {step.slaDays}d
                        </div>
                      </div>
                    </div>
                    <Plus size={14} className="text-slate-400" />
                  </button>
                );
              })}
            </div>
            <div className="col-span-12 md:col-span-8 space-y-3">
              <div className="font-bold text-slate-700 border-b pb-2">
                CONFIGURED WORKFLOW STEPS
              </div>
              {levels.map((level, idx) => (
                <div
                  key={level.tempId}
                  className="border border-slate-200 rounded-md p-3 bg-white flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={level.levelName}
                        onChange={(e) =>
                          updateLevelField(
                            level.tempId,
                            "levelName",
                            e.target.value,
                          )
                        }
                        className="font-semibold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-blue-600 outline-none px-1 w-full"
                      />
                      <div className="flex gap-2 text-[10px] text-slate-500 px-1">
                        <span>Mode: {level.approvalMode}</span>
                        {level.approvalRule && (
                          <span>• Rule: {level.approvalRule}</span>
                        )}
                        <span>• SLA: {level.slaHours}h</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveStep(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveStep(idx, 1)}
                      disabled={idx === levels.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => removeStep(level)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <h3 className="font-bold text-sm text-slate-800">
                {basicInfo.workflowName}
              </h3>
              <p className="text-slate-500 mt-1">
                {basicInfo.description || "No description provided."}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">
                Configured Steps ({levels.length}):
              </h4>
              <ul className="divide-y border border-slate-200 rounded-md bg-white">
                {levels.map((lvl, i) => (
                  <li
                    key={lvl.tempId}
                    className="p-2.5 flex items-center gap-2"
                  >
                    <span className="font-bold text-slate-400">{i + 1}.</span>
                    <span className="font-medium text-slate-800">
                      {lvl.levelName}
                    </span>
                    <span className="ml-auto text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border">
                      {lvl.approvalMode}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-md p-3 font-medium">
            {saveError}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50">
        <button
          onClick={
            wizardStep === 1 ? onCancel : () => setWizardStep((s) => s - 1)
          }
          className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-md font-semibold"
        >
          {wizardStep === 1 ? "Cancel" : "Back"}
        </button>
        {wizardStep < 3 ? (
          <button
            disabled={wizardStep === 1 && !basicInfo.workflowName.trim()}
            onClick={() => setWizardStep((s) => s + 1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-1.5"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving..." : "Save Workflow"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail View Component
// ---------------------------------------------------------------------------
function DetailView({ workflow, levels, loading, onEdit }) {
  return (
    <div className="w-full p-4 mx-auto bg-white rounded-lg border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {workflow.workflowName}
          </h2>
          <p className="text-slate-500 mt-1">
            Module: {workflow.module || "GENERAL"} | Levels: {levels.length}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Edit Workflow
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400">
          Loading step sequence...
        </div>
      ) : (
        <div className="space-y-4 pl-4 border-l-2 border-blue-600">
          {levels.map((lvl) => (
            <div key={lvl.levelId || lvl.tempId} className="relative pl-4">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></div>
              <h4 className="font-bold text-slate-800">{lvl.levelName}</h4>
              <p className="text-slate-500">Mode: {lvl.approvalMode}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkflowManager;
