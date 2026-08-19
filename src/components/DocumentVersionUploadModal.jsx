import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  History,
  AlertCircle,
  CheckCircle2,
  GitCommit,
  Tag,
} from "lucide-react";
import { backendUrlGrc } from "./config";

// Utility function for readable file sizes
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function DocumentVersionUploadModal({
  existingDocument,
  onClose,
  onUploadSuccess,
}) {
  // Normalize and extract details safely from props
  const docId = existingDocument?.documentId || existingDocument?.id || "";
  const docTitle =
    existingDocument?.title || existingDocument?.docName || "Untitled Document";
  const rawVersion =
    existingDocument?.currentVersion || existingDocument?.version || "1.0";
  const docVersion = rawVersion.startsWith("v") ? rawVersion : `v${rawVersion}`;
  const docType =
    existingDocument?.documentType ||
    existingDocument?.type ||
    "General Document";

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [versionType, setVersionType] = useState("minor"); // 'minor' | 'major'
  const [changeComment, setChangeComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Compute next version string based on selection
  const getNextVersion = () => {
    const cleanVersion = docVersion.replace("v", "");
    const [major, minor] = cleanVersion.split(".").map(Number);

    if (versionType === "major") {
      return `v${(major || 1) + 1}.0`;
    }
    return `v${major || 1}.${(minor || 0) + 1}`;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select or drop an updated file.");
      return;
    }
    if (!changeComment.trim()) {
      alert("Please provide a comment explaining what changes were made.");
      return;
    }

    setIsSubmitting(true);

    try {
      const isMajor = versionType === "major";
      const comments = changeComment.trim();

      // 1. Build FormData matching exact C# backend Swagger DTO casing
      const formData = new FormData();
      formData.append("File", file); // Capital 'F'
      formData.append("IsMajor", isMajor); // Capital 'I' and 'M'
      formData.append("ChangesSummary", comments); // Matches 'ChangesSummary' field in API

      // 2. Ensure base URL trailing slash format is safe
      const baseUrl = backendUrlGrc.endsWith("/")
        ? backendUrlGrc
        : `${backendUrlGrc}/`;

      const response = await fetch(
        `${baseUrl}api/documents/${docId}/upload/new_version`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      if (onUploadSuccess) {
        onUploadSuccess({
          ...data,
          newVersion: getNextVersion(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to upload document version:", error);
      alert("An error occurred while uploading. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Upload New Document Version
              </h3>
              <p className="text-xs text-slate-500">
                Update existing file and log your revision comments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Target Document Meta Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" size={20} />
              <div>
                <p className="font-semibold text-slate-800">
                  {existingDocument.title}
                </p>
                <p className="text-[11px] text-slate-500">
                  ID: {existingDocument.id} • {existingDocument.documentType}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block  font-medium">
                Current
              </span>
              <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[11px]">
                {existingDocument.currentVersion}
              </span>
            </div>
          </div>

          {/* File Upload / Dropzone */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Updated File Attachment <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                }`}
              >
                <Upload size={22} className="mx-auto text-blue-600 mb-1" />
                <p className="font-semibold text-slate-700">
                  Click or drag updated file here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF, DOCX, XLSX up to 25MB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-blue-50/40">
                <div className="flex items-center gap-3 truncate">
                  <div className="bg-blue-600 text-white font-bold text-[10px] px-2 py-1 rounded">
                    {file.name.split(".").pop()?.toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Version Increment Selector */}
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3 border rounded-lg cursor-pointer flex items-start gap-2.5 transition-colors ${
                versionType === "minor"
                  ? "border-blue-500 bg-blue-50/30"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="versionType"
                value="minor"
                checked={versionType === "minor"}
                onChange={() => setVersionType("minor")}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>Minor Revision</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold">
                    {getNextVersion()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Small edits, typo fixes, or minor formatting updates.
                </p>
              </div>
            </label>

            <label
              className={`p-3 border rounded-lg cursor-pointer flex items-start gap-2.5 transition-colors ${
                versionType === "major"
                  ? "border-blue-500 bg-blue-50/30"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="versionType"
                value="major"
                checked={versionType === "major"}
                onChange={() => setVersionType("major")}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>Major Revision</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-semibold">
                    {getNextVersion()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Substantial clause changes, terms updates, or re-approvals.
                </p>
              </div>
            </label>
          </div>

          {/* Revision Changelog / Comment Area */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Revision Notes / Change Summary{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={changeComment}
              onChange={(e) => setChangeComment(e.target.value)}
              placeholder="Describe what specific changes were made in this version (e.g., Updated payment terms in Section 4.2)..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                "Saving Version..."
              ) : (
                <>
                  <GitCommit size={14} /> Submit New Version
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
