// // PdfViewer.jsx
// import React, { useState } from "react";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ZoomIn,
//   ZoomOut,
//   FileText,
//   Download,
//   ExternalLink,
// } from "lucide-react";

// export function PdfViewer({ pdfUrl, docTitle, docNumber, totalPages = 1 }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [zoom, setZoom] = useState(100);

//   // Appends native PDF viewer page anchors (e.g., file.pdf#page=2)
//   const pagePdfUrl = pdfUrl ? `${pdfUrl}#page=${currentPage}` : null;
//   const handleOpenInNewTab = () => {
//     if (pdfUrl) {
//       window.open(pdfUrl, "_blank", "noopener,noreferrer");
//     }
//   };

//   return (
//     <div className="bg-slate-900 rounded-lg overflow-hidden flex flex-col h-[480px] shadow-lg border border-slate-800">
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

//         {/* Zoom & Controls */}
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

//       {/* 2. Document Canvas Display */}
//       <div className="flex-1 bg-slate-950 p-4 overflow-auto flex items-center justify-center relative">
//         {pdfUrl ? (
//           <div
//             className="w-full h-full transition-transform duration-200 origin-top flex items-center justify-center"
//             style={{ transform: `scale(${zoom / 100})` }}
//           >
//             {/* <iframe
//               src={pagePdfUrl}
//               title={docTitle || "PDF Document"}
//               className="w-full h-full rounded border border-slate-800 bg-white"
//             /> */}
//             <iframe
//               src={pdfUrl}
//               title={docTitle || "Document Preview"}
//               className="w-full h-full rounded border border-slate-800 bg-white"
//               allowFullScreen
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
//               No live PDF file attached. Upload a valid PDF file to render live
//               pages.
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

// PdfViewer.jsx
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  ExternalLink,
  Maximize2,
} from "lucide-react";

export function PdfViewer({ pdfUrl, docTitle, docNumber, totalPages = 1 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Append toolbar disabling and current page URL params
  const formattedPdfUrl = pdfUrl
    ? `${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`
    : null;

  // Open PDF in a new browser tab for full view
  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden flex flex-col h-[520px] shadow-lg border border-slate-800">
      {/* 1. Control Toolbar */}
      <div className="bg-slate-950/90 backdrop-blur border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs text-slate-300 z-10">
        {/* Page Navigation */}
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

        {/* Zoom & Navigation Actions */}
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

          {/* Full Page / Open in New Tab Action */}
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

      {/* 2. Document Canvas Display (Overflow hidden prevents double scrollbars) */}
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
          /* Fallback when no PDF URL is supplied */
          <div className="text-center p-6 space-y-3">
            <FileText className="w-12 h-12 text-blue-500 mx-auto opacity-80" />
            <div>
              <h4 className="text-xs font-bold text-white  tracking-wider">
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
