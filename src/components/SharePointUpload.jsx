import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Client } from "@microsoft/microsoft-graph-client";
import { loginRequest } from "./authConfig";

const SHAREPOINT_SITE_ID = "YOUR_SHAREPOINT_SITE_ID";
const SHAREPOINT_DRIVE_ID = "YOUR_SHAREPOINT_DRIVE_ID";

export const SharePointUpload = ({
  uploadedFile,
  formData,
  onSubmitSuccess,
}) => {
  const { instance, accounts } = useMsal();
  const [isUploading, setIsUploading] = useState(false);

  // Helper to acquire access token silently or via popup
  const getAccessToken = async () => {
    const account = accounts[0];
    if (!account) {
      throw new Error("No active Microsoft account. Please log in.");
    }

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      return response.accessToken;
    } catch (err) {
      const response = await instance.acquireTokenPopup(loginRequest);
      return response.accessToken;
    }
  };

  const uploadToSharePointDirect = async (file, targetFolder) => {
    const accessToken = await getAccessToken();

    // Initialize Microsoft Graph Client with access token
    const graphClient = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    const sanitizedFileName = `${file.name.replace(/\.[^/.]+$/, "")}_${Date.now()}.${file.name.split(".").pop()}`;
    const itemPath = `${targetFolder}/${sanitizedFileName}`;

    // 1. Small File Upload (<= 4MB)
    if (file.size <= 4 * 1024 * 1024) {
      const response = await graphClient
        .api(`/drives/${SHAREPOINT_DRIVE_ID}/root:/${itemPath}:/content`)
        .put(file);

      return {
        fileName: sanitizedFileName,
        storagePath: response.webUrl,
        spItemId: response.id,
      };
    }

    // 2. Large File Upload (> 4MB) via Upload Session
    const session = await graphClient
      .api(
        `/drives/${SHAREPOINT_DRIVE_ID}/root:/${itemPath}:/createUploadSession`,
      )
      .post({ item: { "@microsoft.graph.conflictBehavior": "rename" } });

    const uploadUrl = session.uploadUrl;
    const minChunkSize = 320 * 1024; // 320 KB
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + minChunkSize, file.size);
      const chunk = file.slice(start, end);

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
        },
        body: chunk,
      });

      if (!response.ok) {
        throw new Error(`Upload failed at byte range ${start}-${end}`);
      }

      const resData = await response.json();
      if (resData.id) {
        // Upload finished
        return {
          fileName: sanitizedFileName,
          storagePath: resData.webUrl,
          spItemId: resData.id,
        };
      }

      start = end;
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile?.rawFile) return;

    setIsUploading(true);

    try {
      const targetFolder = `documents/${new Date().getFullYear()}/${formData?.documentNo || "drafts"}`;

      // Step 1: Direct upload from React browser to SharePoint
      const spResult = await uploadToSharePointDirect(
        uploadedFile.rawFile,
        targetFolder,
      );

      // Step 2: Post document metadata to your database API
      const payload = {
        fileName: spResult.fileName,
        storagePath: spResult.storagePath,
        fileSize: uploadedFile.size,
        // ... additional metadata fields
      };

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) alert("Uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isUploading}>
      {isUploading ? "Uploading..." : "Submit"}
    </button>
  );
};
