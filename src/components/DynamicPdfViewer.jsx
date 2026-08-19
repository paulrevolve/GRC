import React, { useEffect, useState } from "react";
import {
  Loader2,
  FileSpreadsheet,
  FileText,
  Download,
  File,
} from "lucide-react";
import { backendUrlGrc } from "./config";
import { PdfViewer } from "./PdfViewer";

export function DynamicPdfViewer({
  documentId,
  versionId,
  docTitle,
  docNumber,
  totalPages = 1,
  status,
  fileName = "",
}) {
  const [fileData, setFileData] = useState({
    url: null,
    type: null,
    blob: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let currentObjectUrl = null;

    const fetchFile = async () => {
      if (!documentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const activeVersionId = versionId || 1;
        const downloadUrl = `${backendUrlGrc}/api/documents/${documentId}/versions/${activeVersionId}/download`;

        const response = await fetch(downloadUrl, {
          headers: {
            // Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load document file.");
        }

        const mimeType = response.headers.get("Content-Type") || "";
        const blob = await response.blob();
        currentObjectUrl = URL.createObjectURL(blob);

        // Determine file type category
        let fileCategory = "other";
        if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
          fileCategory = "pdf";
        } else if (
          mimeType.includes("spreadsheetml") ||
          mimeType.includes("excel") ||
          fileName.endsWith(".xlsx") ||
          fileName.endsWith(".xls")
        ) {
          fileCategory = "excel";
        } else if (
          mimeType.includes("wordprocessingml") ||
          mimeType.includes("msword") ||
          fileName.endsWith(".docx") ||
          fileName.endsWith(".doc")
        ) {
          fileCategory = "word";
        } else if (mimeType.startsWith("image/")) {
          fileCategory = "image";
        }

        setFileData({ url: currentObjectUrl, type: fileCategory, blob });
      } catch (err) {
        console.error("Error streaming document:", err);
        setError("Unable to render document preview.");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();

    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [documentId, versionId, fileName]);

  const handleDownload = () => {
    if (!fileData.url) return;
    const a = document.createElement("a");
    a.href = fileData.url;
    a.download = fileName || `${docNumber || "document"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg h-[520px] flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 size={20} className="animate-spin text-blue-500" />
        Loading document preview...
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

  // 1. PDF Preview
  if (fileData.type === "pdf") {
    return (
      <PdfViewer
        pdfUrl={fileData.url}
        docTitle={docTitle}
        docNumber={docNumber}
        totalPages={totalPages}
        status={status}
      />
    );
  }

  // 2. Image Preview
  if (fileData.type === "image") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg h-[520px] p-4 flex flex-col items-center justify-center">
        <img
          src={fileData.url}
          alt={docTitle || "Document Preview"}
          className="max-h-full max-w-full object-contain rounded"
        />
      </div>
    );
  }

  // 3. Excel Spreadsheet Fallback
  if (fileData.type === "excel") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg h-[520px] p-6 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full mb-4">
          <FileSpreadsheet size={48} />
        </div>
        <h3 className="text-slate-200 font-medium text-sm mb-1">
          {docTitle || fileName || "Excel Spreadsheet"}
        </h3>
        <p className="text-slate-400 text-xs mb-6 max-w-xs">
          Direct browser rendering is restricted for Excel files. Download to
          view full worksheet.
        </p>
        <button
          onClick={handleDownload}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download size={14} /> Download Excel File
        </button>
      </div>
    );
  }

  // 4. Word Document Fallback
  if (fileData.type === "word") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg h-[520px] p-6 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-full mb-4">
          <FileText size={48} />
        </div>
        <h3 className="text-slate-200 font-medium text-sm mb-1">
          {docTitle || fileName || "Word Document"}
        </h3>
        <p className="text-slate-400 text-xs mb-6 max-w-xs">
          Direct browser preview is unavailable for Microsoft Word files.
        </p>
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download size={14} /> Download Word Document
        </button>
      </div>
    );
  }

  // 5. Generic File Fallback
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg h-[520px] p-6 flex flex-col items-center justify-center text-center">
      <div className="p-4 bg-slate-800 text-slate-400 rounded-full mb-4">
        <File size={48} />
      </div>
      <h3 className="text-slate-200 font-medium text-sm mb-1">
        {docTitle || fileName || "Document Preview"}
      </h3>
      <button
        onClick={handleDownload}
        className="mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer"
      >
        <Download size={14} /> Download File
      </button>
    </div>
  );
}
