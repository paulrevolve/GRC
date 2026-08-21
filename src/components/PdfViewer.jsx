// import React, { useEffect, useState } from "react";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ZoomIn,
//   ZoomOut,
//   FileText,
//   ExternalLink,
//   Maximize2,
//   Loader2,
// } from "lucide-react";
// import { backendUrlGrc } from "./config";

// const WATERMARK_CONFIG = {
//   APPROVED: {
//     label: "APPROVED",
//     color: "text-emerald-500/20 border-emerald-500/20",
//   },
//   PENDING: {
//     label: "PENDING APPROVAL",
//     color: "text-amber-500/20 border-amber-500/20",
//   },
//   REJECTED: { label: "REJECTED", color: "text-red-500/20 border-red-500/20" },
//   DRAFT: { label: "DRAFT", color: "text-slate-400/20 border-slate-400/20" },
// };

// export function DynamicPdfViewer({
//   documentId,
//   versionId,
//   docTitle,
//   docNumber,
//   totalPages,
//   status,
// }) {
//   const [blobUrl, setBlobUrl] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let currentObjectUrl = null;

//     const fetchPdfBlob = async () => {
//       if (!documentId || !versionId) return;
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await fetch(
//           `${backendUrlGrc}/api/documents/${documentId}/versions/${versionId}/download`,
//         );
//         if (!response.ok) throw new Error("Failed to stream document file.");

//         const blob = await response.blob();
//         currentObjectUrl = URL.createObjectURL(
//           new Blob([blob], { type: "application/pdf" }),
//         );
//         setBlobUrl(currentObjectUrl);
//       } catch (err) {
//         console.error("PDF preview stream error:", err);
//         setError("Unable to render document preview.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPdfBlob();

//     return () => {
//       if (currentObjectUrl) {
//         URL.revokeObjectURL(currentObjectUrl);
//       }
//     };
//   }, [documentId, versionId]);

//   if (loading) {
//     return (
//       <div className="bg-white p-6 border border-slate-200 rounded-lg h-96 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
//         <Loader2 size={18} className="animate-spin text-blue-600" />
//         Fetching file binary from server...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-white p-6 border border-slate-200 rounded-lg h-96 flex flex-col items-center justify-center gap-2 text-xs text-red-500">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <PdfViewer
//       pdfUrl={blobUrl}
//       docTitle={docTitle}
//       docNumber={docNumber}
//       totalPages={totalPages}
//       status={status}
//     />
//   );
// }

// export function PdfViewer({
//   pdfUrl,
//   docTitle,
//   docNumber,
//   totalPages = 1,
//   status,
// }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [zoom, setZoom] = useState(100);

//   // Append toolbar disabling and current page URL params
//   const formattedPdfUrl = pdfUrl
//     ? `${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`
//     : null;

//   // Open PDF in a new browser tab for full view
//   const handleOpenInNewTab = () => {
//     if (pdfUrl) {
//       window.open(pdfUrl, "_blank", "noopener,noreferrer");
//     }
//   };

//   const normalizedStatus = status?.toUpperCase() || "DRAFT";
//   const watermark = WATERMARK_CONFIG[normalizedStatus] || {
//     label: normalizedStatus,
//     color: "text-slate-400/20 border-slate-400/20",
//   };

//   return (
//     <div className="bg-slate-900 rounded-lg overflow-hidden flex flex-col h-[520px] shadow-lg border border-slate-800">
//       {/* 1. Control Toolbar */}
//       <div className="bg-slate-950/90 backdrop-blur border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs text-slate-300 z-10">
//         {/* Page Navigation */}
//         <div className="flex items-center gap-1">
//           <button
//             type="button"
//             disabled={currentPage <= 1}
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded transition-colors cursor-pointer text-slate-300"
//             title="Previous Page"
//           >
//             <ChevronLeft size={14} />
//           </button>
//           <span className="text-[11px] font-mono px-1">
//             Page <strong className="text-white">{currentPage}</strong> /{" "}
//             {totalPages}
//           </span>
//           <button
//             type="button"
//             disabled={currentPage >= totalPages}
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded transition-colors cursor-pointer text-slate-300"
//             title="Next Page"
//           >
//             <ChevronRight size={14} />
//           </button>
//         </div>

//         {/* Zoom & Navigation Actions */}
//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             onClick={() => setZoom((prev) => Math.max(prev - 10, 50))}
//             className="p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer text-slate-300"
//             title="Zoom Out"
//           >
//             <ZoomOut size={14} />
//           </button>
//           <span className="text-[10px] font-mono w-10 text-center">
//             {zoom}%
//           </span>
//           <button
//             type="button"
//             onClick={() => setZoom((prev) => Math.min(prev + 10, 150))}
//             className="p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer text-slate-300"
//             title="Zoom In"
//           >
//             <ZoomIn size={14} />
//           </button>

//           <div className="h-4 w-[1px] bg-slate-800 mx-1" />

//           {/* Full Page / Open in New Tab Action */}
//           <button
//             type="button"
//             onClick={handleOpenInNewTab}
//             className="flex items-center gap-1 text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors cursor-pointer"
//             title="Open Full Page View"
//           >
//             <ExternalLink size={13} />
//             <span>Full View</span>
//           </button>
//         </div>
//       </div>

//       {/* 2. Document Canvas Display (Overflow hidden prevents double scrollbars) */}
//       {/* 2. Document Canvas Display with Watermark Layer */}
//       <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex items-center justify-center relative">
//         {/* Dynamic Watermark Overlay */}
//         {/* <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center select-none overflow-hidden">
//           <div
//             className={`transform -rotate-30 text-3xl sm:text-4xl font-black tracking-widest border-4 px-6 py-2 rounded-xl uppercase shadow-2xl backdrop-blur-[1px] whitespace-nowrap ${watermark.style}`}
//           >
//             {watermark.label}
//           </div>
//         </div> */}

//         {pdfUrl ? (
//           <div
//             className="w-full h-full transition-transform duration-200 origin-top flex items-center justify-center"
//             style={{ transform: `scale(${zoom / 100})` }}
//           >
//             <iframe
//               src={formattedPdfUrl}
//               title={docTitle || "Document Preview"}
//               className="w-full h-full rounded border border-slate-800 bg-white"
//               style={{ border: "none" }}
//             />
//           </div>
//         ) : (
//           /* Fallback when no PDF URL is supplied */
//           <div className="text-center p-6 space-y-3">
//             <FileText className="w-12 h-12 text-blue-500 mx-auto opacity-80" />
//             <div>
//               <h4 className="text-xs font-bold text-white  tracking-wider">
//                 {docTitle}
//               </h4>
//               <p className="text-[11px] text-slate-400 mt-1">
//                 Document Number: {docNumber}
//               </p>
//             </div>
//             <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
//               No live PDF file attached.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* 3. Footer Status Bar */}
//       <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
//         <span>
//           Page {currentPage} of {totalPages}
//         </span>
//         <span>{zoom}% Zoom</span>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  FileSpreadsheet,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import { backendUrlGrc } from "./config";

const WATERMARK_CONFIG = {
  APPROVED: {
    label: "APPROVED",
    color: "text-emerald-500/20 border-emerald-500/20",
  },
  PENDING: {
    label: "PENDING APPROVAL",
    color: "text-amber-500/20 border-amber-500/20",
  },
  REJECTED: { label: "REJECTED", color: "text-red-500/20 border-red-500/20" },
  DRAFT: { label: "DRAFT", color: "text-slate-400/20 border-slate-400/20" },
};

// Helper function to resolve MIME types from extension or custom prop
const getMimeType = (fileType, fileName) => {
  const ext = (fileName || fileType || "").split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls":
      return "application/vnd.ms-excel";
    default:
      return "application/octet-stream";
  }
};

export function DynamicPdfViewer({
  documentId,
  versionId = 1,
  docTitle,
  docNumber,
  totalPages,
  status,
  fileType,
  fileName,
}) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [detectedType, setDetectedType] = useState("pdf");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let currentObjectUrl = null;

    const fetchDocumentBlob = async () => {
      if (!documentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${backendUrlGrc}/api/documents/${documentId}/versions/${versionId}/download`,
        );
        if (!response.ok) throw new Error("Failed to stream document file.");

        // Read Content-Type header or derive from filename/fileType
        const contentTypeHeader = response.headers.get("content-type");
        const inferredMime =
          contentTypeHeader && contentTypeHeader !== "application/octet-stream"
            ? contentTypeHeader
            : getMimeType(fileType, fileName);

        // Identify file category for viewer rendering
        let category = "pdf";
        if (
          inferredMime.includes("word") ||
          inferredMime.includes("document") ||
          fileName?.endsWith(".doc") ||
          fileName?.endsWith(".docx")
        ) {
          category = "docx";
        } else if (
          inferredMime.includes("sheet") ||
          inferredMime.includes("excel") ||
          fileName?.endsWith(".xls") ||
          fileName?.endsWith(".xlsx")
        ) {
          category = "xlsx";
        }

        setDetectedType(category);

        const blob = await response.blob();
        currentObjectUrl = URL.createObjectURL(
          new Blob([blob], { type: inferredMime }),
        );
        setBlobUrl(currentObjectUrl);
      } catch (err) {
        console.error("Document preview stream error:", err);
        setError("Unable to render document preview.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentBlob();

    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [documentId, versionId, fileType, fileName]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg h-[520px] flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 size={18} className="animate-spin text-blue-500" />
        Fetching file binary from server...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg h-[520px] flex flex-col items-center justify-center gap-2 text-xs text-red-400">
        {error}
      </div>
    );
  }

  // Render PDF Viewer component
  if (detectedType === "pdf") {
    return (
      <PdfViewer
        pdfUrl={blobUrl}
        docTitle={docTitle}
        docNumber={docNumber}
        totalPages={totalPages}
        status={status}
      />
    );
  }

  // Render Office Documents Fallback (DOCX / XLSX)
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg h-[520px] p-6 flex flex-col items-center justify-center text-center space-y-4">
      {detectedType === "xlsx" ? (
        <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full">
          <FileSpreadsheet size={48} />
        </div>
      ) : (
        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-full">
          <FileText size={48} />
        </div>
      )}
      <div>
        <h3 className="text-slate-200 font-medium text-sm">
          {docTitle || fileName || "Office Document"}
        </h3>
        <p className="text-slate-400 text-xs mt-1 max-w-xs">
          Direct browser preview is unavailable for {detectedType.toUpperCase()}{" "}
          files. Please download the file to view.
        </p>
      </div>
      <a
        href={blobUrl}
        download={fileName || `${docTitle || "document"}.${detectedType}`}
        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer"
      >
        <Download size={14} /> Download {detectedType.toUpperCase()} File
      </a>
    </div>
  );
}

export function PdfViewer({
  pdfUrl,
  docTitle,
  docNumber,
  totalPages = 1,
  status,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const formattedPdfUrl = pdfUrl
    ? `${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`
    : null;

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const normalizedStatus = status?.toUpperCase() || "DRAFT";
  const watermark = WATERMARK_CONFIG[normalizedStatus] || {
    label: normalizedStatus,
    color: "text-slate-400/20 border-slate-400/20",
  };

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden flex flex-col h-[520px] shadow-lg border border-slate-800">
      {/* 1. Control Toolbar */}
      <div className="bg-slate-950/90 backdrop-blur border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs text-slate-300 z-10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded transition-colors cursor-pointer text-slate-300"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[11px] font-mono px-1">
            Page <strong className="text-white">{currentPage}</strong> /{" "}
            {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded transition-colors cursor-pointer text-slate-300"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(prev - 10, 50))}
            className="p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] font-mono w-10 text-center">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(prev + 10, 150))}
            className="p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer text-slate-300"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="flex items-center gap-1 text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors cursor-pointer"
            title="Open Full Page View"
          >
            <ExternalLink size={13} />
            <span>Full View</span>
          </button>
        </div>
      </div>

      {/* 2. Document Canvas Display */}
      <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex items-center justify-center relative">
        {pdfUrl ? (
          <div
            className="w-full h-full transition-transform duration-200 origin-top flex items-center justify-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <iframe
              src={formattedPdfUrl}
              title={docTitle || "Document Preview"}
              className="w-full h-full rounded border border-slate-800 bg-white"
              style={{ border: "none" }}
            />
          </div>
        ) : (
          <div className="text-center p-6 space-y-3">
            <FileText className="w-12 h-12 text-blue-500 mx-auto opacity-80" />
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider">
                {docTitle}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Document Number: {docNumber}
              </p>
            </div>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
              No live PDF file attached.
            </p>
          </div>
        )}
      </div>

      {/* 3. Footer Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <span>{zoom}% Zoom</span>
      </div>
    </div>
  );
}
