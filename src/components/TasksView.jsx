// import React, { useState, useRef, useEffect } from "react";
// import {
//   FileText,
//   CheckCircle2,
//   XCircle,
//   PenTool,
//   Eye,
//   Clock,
//   AlertCircle,
//   Filter,
//   X,
//   RotateCcw,
//   ShieldCheck,
//   ArrowLeft,
//   Download,
//   Edit,
//   MoreVertical,
//   Upload,
// } from "lucide-react";
// import axios from "axios";
// import { backendUrlGrc } from "./config";
// import { PdfViewer } from "./PdfViewer";
// import samplePdf from "../assets/DeltekCostpoint82ExtensibilityDesignerCodingGuide.pdf";

// function InfoRow({ label, value }) {
//   return (
//     <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 text-xs">
//       <span className="text-slate-500">{label}</span>
//       <span className="font-medium text-slate-700">{value}</span>
//     </div>
//   );
// }

// export function TasksView() {
//   const [activeTab, setActiveTab] = useState("Review"); // 'Review' | 'Approval' | 'Rejected' | 'Completed'

//   // Lists
//   const [documentsList, setDocumentsList] = useState([]);
//   const [approvalTasks, setApprovalTasks] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [actionType, setActionType] = useState(null); // 'review', 'approve', 'esign'
//   const [comments, setComments] = useState("");
//   const [signatureData, setSignatureData] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   // Document preview state
//   const [previewDoc, setPreviewDoc] = useState(null);
//   const [previewActiveTab, setPreviewActiveTab] = useState("Overview");

//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);

//   // 1. Fetch Documents API for "Review" Tab
//   const fetchDocuments = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${backendUrlGrc}/api/documents`);
//       if (res.data) {
//         const formatted = res.data.map((doc) => ({
//           id: doc.documentId.toString(),
//           documentId: doc.documentId,
//           title: "Document Review",
//           type: "Review",
//           docName: doc.title || "Untitled Document",
//           docNo: doc.documentNo || `DOC-${doc.documentId}`,
//           workflow: `Org ID: ${doc.organizationId || 1}`,
//           due: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A",
//           priority: "Normal",
//           priorityColor: "bg-slate-100 text-slate-700 border-slate-200",
//           status: doc.status || "DRAFT",
//           content: `Review specifications for document number ${doc.documentNo}`,
//           category: `Category ID: ${doc.categoryId}`,
//           owner: `User #${doc.ownerUserId || 1}`,
//           version: "1.0",
//           classification: `Class #${doc.classificationId}`,
//           department: `Dept #${doc.departmentId}`,
//           createdOn: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A",
//           fileUrl: samplePdf,
//           totalPages: 1,
//           description: `Document status: ${doc.status}. Created on system.`
//         }));
//         setDocumentsList(formatted);
//       }
//     } catch (error) {
//       console.error("Error fetching documents:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. Fetch Tasks API for "Approval", "Rejected", and "Completed" Tabs
//   const fetchApprovalTasks = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${backendUrlGrc}/api/approval/tasks/pending/6`);
//       if (res.data) {
//         const formatted = res.data.map((item) => {
//           const req = item.requestLevel?.request || {};
//           const level = item.requestLevel || {};

//           let computedStatus = "Pending";
//           if (item.status === "REJECTED" || item.isRejected) computedStatus = "REJECTED";
//           else if (item.status === "COMPLETED" || item.isApproved || item.status === "APPROVED") computedStatus = "COMPLETED";
//           else if (item.status === "PENDING") computedStatus = "PENDING";

//           return {
//             id: item.requestApproverId.toString(),
//             taskId: item.requestApproverId,
//             originalData: item,
//             title: level.levelName || "Management Approval",
//             type: level.approvalMode === "SEQUENTIAL" ? "Approval" : "Review",
//             docName: req.title || "Untitled Document",
//             docNo: req.requestNumber || `DOC-${req.documentId || "0000"}`,
//             workflow: `Workflow ID: ${req.workflowId || 1}`,
//             due: item.assignedOn ? new Date(item.assignedOn).toLocaleDateString() : "N/A",
//             priority: "High",
//             priorityColor: "bg-red-100 text-red-700 border-red-200",
//             status: computedStatus,
//             content: req.remarks || "No remarks provided.",
//             documentId: req.documentId,
//             fileUrl: req.fileUrl || samplePdf,
//             category: "General Governance",
//             owner: `User #${req.requestedBy || "1"}`,
//             version: "1.0",
//             classification: "Internal",
//             retention: "Standard",
//             department: "Operations",
//             createdOn: item.assignedOn ? new Date(item.assignedOn).toLocaleDateString() : "N/A",
//             totalPages: 1,
//             description: req.remarks || "Approval workflow request."
//           };
//         });
//         setApprovalTasks(formatted);
//       }
//     } catch (error) {
//       console.error("Error fetching approval tasks:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "Review") {
//       fetchDocuments();
//     } else {
//       fetchApprovalTasks();
//     }
//   }, [activeTab]);

//   // Tab Filtering Logic
//   const getDisplayedData = () => {
//     if (activeTab === "Review") {
//       return documentsList;
//     } else if (activeTab === "Approval") {
//       return approvalTasks.filter((t) => t.status === "PENDING");
//     } else if (activeTab === "Rejected") {
//       return approvalTasks.filter((t) => t.status === "REJECTED");
//     } else if (activeTab === "Completed") {
//       return approvalTasks.filter((t) => t.status === "COMPLETED");
//     }
//     return [];
//   };

//   const currentList = getDisplayedData();

//   const handleOpenAction = (task, mode) => {
//     setSelectedTask(task);
//     setActionType(mode);
//     setComments("");
//     setSignatureData(null);
//   };

//   const handleOpenDocumentPreview = (task) => {
//     setPreviewDoc(task);
//     setPreviewActiveTab("Overview");
//   };

//   const startDrawing = (e) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     const rect = canvas.getBoundingClientRect();
//     ctx.beginPath();
//     ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
//     setIsDrawing(true);
//   };

//   const draw = (e) => {
//     if (!isDrawing) return;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const rect = canvas.getBoundingClientRect();
//     ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
//     ctx.strokeStyle = "#1e3a8a";
//     ctx.lineWidth = 2;
//     ctx.stroke();
//   };

//   const stopDrawing = () => {
//     if (!isDrawing) return;
//     setIsDrawing(false);
//     if (canvasRef.current) {
//       setSignatureData(canvasRef.current.toDataURL());
//     }
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     setSignatureData(null);
//   };

//   const handleCompleteTask = async (statusOutcome) => {
//     if (!selectedTask) return;

//     if (actionType === "esign" && !signatureData) {
//       alert("Please provide an e-Signature before submitting.");
//       return;
//     }

//     setActionLoading(true);
//     try {
//       const reqData = selectedTask.originalData?.requestLevel?.request || {};

//       if (activeTab === "Review") {
//         const payload = {
//           workflowId: reqData.workflowId || 0,
//           documentId: selectedTask.documentId || 0,
//           recordId: reqData.recordId || 0,
//           recordType: reqData.recordType || "string",
//           title: selectedTask.docName,
//           requestedBy: 5,
//           remarks: comments || "Reviewed"
//         };
//         await axios.post(`${backendUrlGrc}/api/approval/requests`, payload);
//         alert("Document review request sent successfully!");
//       } else {
//         if (statusOutcome === "Rejected") {
//           await axios.post(
//             `${backendUrlGrc}/api/approval/tasks/${selectedTask.taskId}/reject`,
//             { comments },
//             { params: { userId: 5 } }
//           );
//         } else {
//           await axios.post(
//             `${backendUrlGrc}/api/approval/tasks/${selectedTask.taskId}/approve`,
//             { comments },
//             { params: { userId: 5 } }
//           );
//         }
//         alert(`Task successfully processed as ${statusOutcome}!`);
//       }
//       setSelectedTask(null);
//       setActionType(null);
//       if (activeTab === "Review") fetchDocuments();
//       else fetchApprovalTasks();
//     } catch (error) {
//       console.error("Error processing action:", error);
//       alert("Failed to process action. Please try again.");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4 font-sans text-xs">
//       {/* Header */}
//       <div className="flex items-center justify-between border-b pb-3">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">My Tasks</h1>
//           <p className="text-slate-500">
//             Review, approve, and track governance documents & workflows
//           </p>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold">
//         {["Review", "Approval", "Rejected", "Completed"].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`py-2 border-b-2 transition-colors cursor-pointer ${
//               activeTab === tab
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-slate-500 hover:text-slate-800"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
//               <th className="p-3">Task Title</th>
//               <th className="p-3">Document</th>
//               <th className="p-3">Workflow / Ref</th>
//               <th className="p-3">Date</th>
//               <th className="p-3">Status</th>
//               <th className="p-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-slate-400">
//                   Loading data from server...
//                 </td>
//               </tr>
//             ) : currentList.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-slate-400">
//                   No records found under {activeTab}.
//                 </td>
//               </tr>
//             ) : (
//               currentList.map((item) => (
//                 <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
//                   <td className="p-3 font-semibold text-slate-800">
//                     <div className="flex items-center gap-1.5">
//                       <FileText size={14} className="text-slate-400" />
//                       {item.title}
//                     </div>
//                   </td>
//                   <td className="p-3">
//                     <button
//                       onClick={() => handleOpenDocumentPreview(item)}
//                       className="text-left group cursor-pointer"
//                     >
//                       <div className="font-semibold text-blue-600 group-hover:underline">
//                         {item.docName}
//                       </div>
//                       <span className="text-[10px] text-slate-400 group-hover:text-blue-500">
//                         {item.docNo}
//                       </span>
//                     </button>
//                   </td>
//                   <td className="p-3 text-slate-600">{item.workflow}</td>
//                   <td className="p-3 text-slate-600">
//                     <div className="flex items-center gap-1">
//                       <Clock size={12} className="text-slate-400" />
//                       {item.due}
//                     </div>
//                   </td>
//                   <td className="p-3">
//                     <span
//                       className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
//                         item.status === "DRAFT" || item.status === "PENDING"
//                           ? "bg-blue-50 text-blue-700 border-blue-200"
//                           : item.status === "REJECTED"
//                           ? "bg-red-50 text-red-700 border-red-200"
//                           : "bg-slate-100 text-slate-600 border-slate-200"
//                       }`}
//                     >
//                       {item.status}
//                     </span>
//                   </td>
//                   <td className="p-3 text-right">
//                     {/* CONDITIONAL ACTION BUTTONS BASED ON ACTIVE TAB */}
//                     {activeTab === "Review" && (
//                       <div className="flex items-center justify-end gap-1.5">
//                         <button
//                           onClick={() => handleOpenAction(item, "review")}
//                           className="px-2.5 py-1 text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer font-medium"
//                         >
//                           <Eye size={12} /> Review
//                         </button>
//                       </div>
//                     )}

//                     {activeTab === "Approval" && (
//                       <div className="flex items-center justify-end gap-1.5">
//                         <button
//                           onClick={() => handleOpenAction(item, "review")}
//                           className="px-2 py-1 text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer"
//                         >
//                           <Eye size={12} /> Review
//                         </button>
//                         <button
//                           onClick={() => handleOpenAction(item, "approve")}
//                           className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1 cursor-pointer font-medium"
//                         >
//                           <CheckCircle2 size={12} /> Approve
//                         </button>
//                       </div>
//                     )}

//                     {(activeTab === "Rejected" || activeTab === "Completed") && (
//                       <span className="text-slate-400 italic">No actions available</span>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Document Preview Modal */}
//       {previewDoc && (
//         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
//           <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
//             <div className="flex items-center justify-between bg-white p-4 border-b border-slate-200">
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => setPreviewDoc(null)}
//                   className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
//                 >
//                   <ArrowLeft size={18} />
//                 </button>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h2 className="text-base font-bold text-slate-800">{previewDoc.docName}</h2>
//                     <span className="text-xs text-slate-500">({previewDoc.docNo})</span>
//                   </div>
//                   <p className="text-[11px] text-slate-500">
//                     Category: {previewDoc.category} | Owner: {previewDoc.owner}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setPreviewDoc(null)}
//                   className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
//               <div className="grid grid-cols-12 gap-6">
//                 <div className="col-span-12 lg:col-span-5">
//                   <PdfViewer
//                     pdfUrl={previewDoc.fileUrl}
//                     docTitle={previewDoc.docName}
//                     docNumber={previewDoc.docNo}
//                     totalPages={previewDoc.totalPages}
//                   />
//                 </div>
//                 <div className="col-span-12 lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 text-xs">
//                   <h3 className="font-bold text-slate-800 text-sm border-b pb-1">Document Information</h3>
//                   <InfoRow label="Document Number" value={previewDoc.docNo} />
//                   <InfoRow label="Status" value={previewDoc.status} />
//                   <InfoRow label="Version" value={previewDoc.version} />
//                   <InfoRow label="Classification" value={previewDoc.classification} />
//                   <InfoRow label="Department" value={previewDoc.department} />
//                   <InfoRow label="Created On" value={previewDoc.createdOn} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Action / Approval Modal */}
//       {selectedTask && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-xl p-6 space-y-4">
//             <div className="flex items-center justify-between border-b pb-3">
//               <h3 className="text-base font-bold text-slate-800">
//                 {actionType === "approve" ? "Approve Document Request" : "Review Document"}
//               </h3>
//               <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="bg-slate-50 border rounded-lg p-4 space-y-2">
//               <div className="flex justify-between text-slate-600">
//                 <span>Document:</span>
//                 <span className="font-semibold text-slate-800">{selectedTask.docName}</span>
//               </div>
//               <p className="text-slate-700 border-t pt-2 mt-2">{selectedTask.content}</p>
//             </div>

//             <div>
//               <label className="block text-xs font-bold text-slate-700 mb-1">Comments</label>
//               <textarea
//                 rows={2}
//                 value={comments}
//                 onChange={(e) => setComments(e.target.value)}
//                 placeholder="Enter review notes or comments..."
//                 className="w-full border rounded p-2 text-xs text-slate-800 focus:outline-blue-600"
//               />
//             </div>

//             <div className="flex items-center justify-end gap-2 pt-3 border-t">
//               <button
//                 onClick={() => setSelectedTask(null)}
//                 className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
//               >
//                 Cancel
//               </button>
//               {actionType === "review" ? (
//                 <button
//                   onClick={() => handleCompleteTask("Reviewed")}
//                   disabled={actionLoading}
//                   className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold cursor-pointer"
//                 >
//                   {actionLoading ? "Processing..." : "Complete Review"}
//                 </button>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => handleCompleteTask("Rejected")}
//                     disabled={actionLoading}
//                     className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold cursor-pointer"
//                   >
//                     Reject
//                   </button>
//                   <button
//                     onClick={() => handleCompleteTask("Approved")}
//                     disabled={actionLoading}
//                     className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold cursor-pointer"
//                   >
//                     Approve
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from "react";
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
  ArrowLeft,
  Download,
  Edit,
  MoreVertical,
  Upload,
} from "lucide-react";
import axios from "axios";
import { backendUrlGrc } from "./config";
import { PdfViewer } from "./PdfViewer";
import samplePdf from "../assets/Tax_Inv_202600000119_105.pdf";
import { DocumentDetailView } from "./DocumentsView";
import { UploadDocumentView } from "./UploadDocumentView";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

export function TasksView(
  documents = [],
  isLoading = false,
  error = null,
  onSelectDoc,
  onNavigateToUpload,
) {
  const [activeTab, setActiveTab] = useState("Review"); // 'Review' | 'Approval' | 'Rejected' | 'Completed'

  const [currentView, setCurrentView] = useState("");
  // Lists
  const [documentsList, setDocumentsList] = useState([]);
  const [approvalTasks, setApprovalTasks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionType, setActionType] = useState(null); // 'review', 'approve', 'esign'
  const [comments, setComments] = useState("");
  const [signatureData, setSignatureData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewActiveTab, setPreviewActiveTab] = useState("Overview");
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initial fetch all data once on component mount
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch both APIs concurrently on initial load so switching tabs doesn't re-trigger network requests[cite: 3]
      const [docRes, taskRes] = await Promise.all([
        axios.get(`${backendUrlGrc}/api/documents`).catch(() => ({ data: [] })),
        axios
          .get(`${backendUrlGrc}/api/approval/tasks/pending/6`)
          .catch(() => ({ data: [] })),
      ]);

      if (docRes.data) {
        const formattedDocs = docRes.data.map((doc) => ({
          id: doc.documentId.toString(),
          documentId: doc.documentId,
          title: "Document Review",
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
        }));
        setDocumentsList(formattedDocs);
      }

      if (taskRes.data) {
        const formattedTasks = taskRes.data.map((item) => {
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

          return {
            id: item.requestApproverId.toString(),
            taskId: item.requestApproverId,
            originalData: item,
            title: level.levelName || "Management Approval",
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
          };
        });
        setApprovalTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Tab Filtering Logic (Client-side filtering without refetching)[cite: 3]
  const getDisplayedData = () => {
    if (activeTab === "Review") {
      return documentsList;
    } else if (activeTab === "Approval") {
      return approvalTasks.filter((t) => t.status === "PENDING");
    } else if (activeTab === "Rejected") {
      return approvalTasks.filter((t) => t.status === "REJECTED");
    } else if (activeTab === "Completed") {
      return approvalTasks.filter((t) => t.status === "COMPLETED");
    }
    return [];
  };

  const currentList = getDisplayedData();

  const handleOpenAction = (task, mode) => {
    setSelectedTask(task);
    setActionType(mode);
    setComments("");
    setSignatureData(null);
  };

  const handleOpenDocumentPreview = (task) => {
    setPreviewDoc(task);
    setPreviewActiveTab("Overview");
  };

  // Close preview modal handler
  const handleClosePreview = () => {
    setPreviewDoc(null);
  };

  const handleBackToList = () => {
    setCurrentView("");
    fetchAllData();
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
          requestedBy: 5,
          remarks: comments || "Reviewed",
        };
        await axios.post(`${backendUrlGrc}/api/approval/requests`, payload);
        alert("Document review request sent successfully!");
      } else {
        if (statusOutcome === "Rejected") {
          await axios.post(
            `${backendUrlGrc}/api/approval/tasks/${selectedTask.taskId}/reject`,
            { comments },
            { params: { userId: 5 } },
          );
        } else {
          await axios.post(
            `${backendUrlGrc}/api/approval/tasks/${selectedTask.taskId}/approve`,
            { comments },
            { params: { userId: 5 } },
          );
        }
        alert(`Task successfully processed as ${statusOutcome}!`);
      }
      setSelectedTask(null);
      setActionType(null);
      fetchAllData(); // Refresh data after action execution
    } catch (error) {
      console.error("Error processing action:", error);
      alert("Failed to process action. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Tasks</h1>
          <p className="text-slate-500">
            Review, approve, and track governance documents & workflows
          </p>
        </div>
        <button
          onClick={() => setCurrentView("UPLOAD")}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
        >
          <Upload size={14} />
          Upload New Document
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold">
        {["Review", "Approval", "Rejected", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
              <th className="p-3">Task Title</th>
              <th className="p-3">Document</th>
              <th className="p-3">Workflow / Ref</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400">
                  Loading data from server...
                </td>
              </tr>
            ) : currentList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400">
                  No records found under {activeTab}.
                </td>
              </tr>
            ) : (
              currentList.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="p-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <FileText size={14} className="text-slate-400" />
                      {item.title}
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleOpenDocumentPreview(item)}
                      className="text-left group cursor-pointer"
                    >
                      <div className="font-semibold text-blue-600 group-hover:underline">
                        {item.docName}
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-blue-500">
                        {item.docNo}
                      </span>
                    </button>
                  </td>
                  <td className="p-3 text-slate-600">{item.workflow}</td>
                  <td className="p-3 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {item.due}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.status === "DRAFT" || item.status === "PENDING"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {activeTab === "Review" && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAction(item, "review")}
                          className="px-2.5 py-1 text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Eye size={12} /> Review
                        </button>
                      </div>
                    )}

                    {activeTab === "Approval" && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAction(item, "review")}
                          className="px-2 py-1 text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} /> Review
                        </button>
                        <button
                          onClick={() => handleOpenAction(item, "approve")}
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
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Document Modal Container */}
      {currentView === "UPLOAD" && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <UploadDocumentView
              onCancel={handleBackToList}
              showBackButton={true}
              onSubmitSuccess={handleBackToList}
            />
          </div>
        </div>
      )}
      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <DocumentDetailView
              doc={previewDoc} // Pass previewDoc directly as the document payload
              onBack={handleClosePreview} // Close modal on back action
              onOpenVersionModal={() => setIsVersionModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Action / Approval Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-xl p-6 space-y-4">
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
