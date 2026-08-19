import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  ExternalLink,
  Maximize2,
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

export function DynamicPdfViewer({
  documentId,
  versionId,
  docTitle,
  docNumber,
  totalPages,
  status,
}) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let currentObjectUrl = null;

    const fetchPdfBlob = async () => {
      if (!documentId || !versionId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${backendUrlGrc}/api/documents/${documentId}/versions/${versionId}/download`,
        );
        if (!response.ok) throw new Error("Failed to stream document file.");

        const blob = await response.blob();
        currentObjectUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" }),
        );
        setBlobUrl(currentObjectUrl);
      } catch (err) {
        console.error("PDF preview stream error:", err);
        setError("Unable to render document preview.");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfBlob();

    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [documentId, versionId]);

  if (loading) {
    return (
      <div className="bg-white p-6 border border-slate-200 rounded-lg h-96 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
        <Loader2 size={18} className="animate-spin text-blue-600" />
        Fetching file binary from server...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 border border-slate-200 rounded-lg h-96 flex flex-col items-center justify-center gap-2 text-xs text-red-500">
        {error}
      </div>
    );
  }

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

export function PdfViewer({
  pdfUrl,
  docTitle,
  docNumber,
  totalPages = 1,
  status,
}) {
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

  const normalizedStatus = status?.toUpperCase() || "DRAFT";
  const watermark = WATERMARK_CONFIG[normalizedStatus] || {
    label: normalizedStatus,
    color: "text-slate-400/20 border-slate-400/20",
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
      {/* 2. Document Canvas Display with Watermark Layer */}
      <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex items-center justify-center relative">
        {/* Dynamic Watermark Overlay */}
        {/* <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center select-none overflow-hidden">
          <div
            className={`transform -rotate-30 text-3xl sm:text-4xl font-black tracking-widest border-4 px-6 py-2 rounded-xl uppercase shadow-2xl backdrop-blur-[1px] whitespace-nowrap ${watermark.style}`}
          >
            {watermark.label}
          </div>
        </div> */}

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
