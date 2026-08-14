import React, { useState, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  PenTool,
  Eye,
  Clock,
  AlertCircle,
  Filter,
  X,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

// Mock tasks data
const INITIAL_TASKS = [
  {
    id: "TASK-101",
    title: "Review Document",
    type: "Review",
    docName: "Vendor Management Procedure",
    docNo: "DOC-2026-0001",
    workflow: "Procedure Review Workflow",
    due: "12 May 2026",
    priority: "High",
    priorityColor: "bg-red-100 text-red-700 border-red-200",
    status: "Pending",
    content:
      "This standard operating procedure defines vendor selection, risk assessment, and contract compliance checks.",
  },
  {
    id: "TASK-102",
    title: "Approve Document",
    type: "Approval",
    docName: "Business Continuity Plan",
    docNo: "DOC-2026-0002",
    workflow: "Policy Approval Workflow",
    due: "14 May 2026",
    priority: "Medium",
    priorityColor: "bg-amber-100 text-amber-700 border-amber-200",
    status: "Pending",
    content:
      "The Business Continuity Plan ensures critical infrastructure restoration within 4 hours during emergency events.",
  },
  {
    id: "TASK-103",
    title: "Review Document",
    type: "Review",
    docName: "Employee Handbook",
    docNo: "DOC-2026-0003",
    workflow: "Policy Review Workflow",
    due: "16 May 2026",
    priority: "Low",
    priorityColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    status: "Pending",
    content:
      "Updates regarding remote work stipends, PTO rollovers, and annual health insurance guidelines.",
  },
  {
    id: "TASK-104",
    title: "Approve Document",
    type: "Approval",
    docName: "Travel Policy",
    docNo: "DOC-2026-0004",
    workflow: "Policy Approval Workflow",
    due: "18 May 2026",
    priority: "Medium",
    priorityColor: "bg-amber-100 text-amber-700 border-amber-200",
    status: "Pending",
    content:
      "Updated travel expenses, per diem rates, and pre-approval thresholds for international business travel.",
  },
];

export function TasksView() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionType, setActionType] = useState(null); // 'review', 'approve', 'esign'
  const [comments, setComments] = useState("");
  const [signatureData, setSignatureData] = useState(null);

  // Canvas ref for signature drawing
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Filter Logic
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "All") return true;
    if (activeTab === "Completed") return task.status === "Completed";
    return task.type.toLowerCase() === activeTab.toLowerCase();
  });

  // Handle Opening Task Action
  const handleOpenAction = (task, mode) => {
    setSelectedTask(task);
    setActionType(mode);
    setComments("");
    setSignatureData(null);
  };

  // Canvas Drawing Handlers
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

  // Submit Action Logic
  const handleCompleteTask = (statusOutcome) => {
    if (!selectedTask) return;

    if (actionType === "esign" && !signatureData) {
      alert("Please provide an e-Signature before submitting.");
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              status: "Completed",
              outcome: statusOutcome,
              comments: comments,
              signedAt: new Date().toLocaleString(),
            }
          : t,
      ),
    );

    alert(`Task successfully processed as ${statusOutcome}!`);
    setSelectedTask(null);
    setActionType(null);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Tasks</h1>
          <p className="text-slate-500">
            Review, approve, and sign pending governance documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold border border-blue-200">
            {tasks.filter((t) => t.status === "Pending").length} Pending
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold">
        {["All", "Review", "Approval", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
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
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">
                  No tasks found in this view.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="p-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <FileText size={14} className="text-slate-400" />
                      {task.title}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-700">
                      {task.docName}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {task.docNo}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{task.workflow}</td>
                  <td className="p-3 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {task.due}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${task.priorityColor}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        task.status === "Completed"
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {task.status === "Completed" ? (
                      <span className="text-slate-400 italic">Done</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAction(task, "review")}
                          className="px-2 py-1 text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 rounded flex items-center gap-1"
                        >
                          <Eye size={12} /> Review
                        </button>
                        {task.type === "Approval" && (
                          <button
                            onClick={() => handleOpenAction(task, "approve")}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenAction(task, "esign")}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1"
                        >
                          <PenTool size={12} /> eSign
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Interactive Task / eSign Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-xl p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {actionType === "esign"
                    ? "e-Sign Document"
                    : actionType === "approve"
                      ? "Approve Document Request"
                      : "Review Document Request"}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTask.docName} ({selectedTask.docNo})
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Details Content */}
            <div className="bg-slate-50 border rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Workflow:</span>
                <span className="font-semibold text-slate-800">
                  {selectedTask.workflow}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Due Date:</span>
                <span className="font-semibold text-slate-800">
                  {selectedTask.due}
                </span>
              </div>
              <p className="text-slate-700 border-t pt-2 mt-2">
                {selectedTask.content}
              </p>
            </div>

            {/* Comments Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reviewer / Approver Comments
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter approval notes, change requests, or comments..."
                className="w-full border rounded p-2 text-xs text-slate-800 focus:outline-blue-600"
              />
            </div>

            {/* e-Signature Drawer Canvas */}
            {actionType === "esign" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Draw Signature Below
                  </label>
                  <button
                    onClick={clearCanvas}
                    type="button"
                    className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Clear Canvas
                  </button>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 relative">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full cursor-crosshair touch-none"
                  />
                  {!signatureData && (
                    <span className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs pointer-events-none">
                      Sign using mouse or touch screen
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>

              {actionType === "review" && (
                <button
                  onClick={() => handleCompleteTask("Reviewed")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold flex items-center gap-1"
                >
                  <CheckCircle2 size={14} /> Mark as Reviewed
                </button>
              )}

              {actionType === "approve" && (
                <>
                  <button
                    onClick={() => handleCompleteTask("Rejected")}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold flex items-center gap-1"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => handleCompleteTask("Approved")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Approve Document
                  </button>
                </>
              )}

              {actionType === "esign" && (
                <button
                  onClick={() => handleCompleteTask("Signed & Approved")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold flex items-center gap-1"
                >
                  <ShieldCheck size={14} /> Confirm & e-Sign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
