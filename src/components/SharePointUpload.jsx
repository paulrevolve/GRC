// import React, { useState } from "react";
// import { useMsal } from "@azure/msal-react";
// import { Client } from "@microsoft/microsoft-graph-client";
// import { loginRequest } from "./authConfig";

// const SHAREPOINT_SITE_ID = "YOUR_SHAREPOINT_SITE_ID";
// const SHAREPOINT_DRIVE_ID = "YOUR_SHAREPOINT_DRIVE_ID";

// export const SharePointUpload = ({
//   uploadedFile,
//   formData,
//   onSubmitSuccess,
// }) => {
//   const { instance, accounts } = useMsal();
//   const [isUploading, setIsUploading] = useState(false);

//   // Helper to acquire access token silently or via popup
//   const getAccessToken = async () => {
//     const account = accounts[0];
//     if (!account) {
//       throw new Error("No active Microsoft account. Please log in.");
//     }

//     try {
//       const response = await instance.acquireTokenSilent({
//         ...loginRequest,
//         account,
//       });
//       return response.accessToken;
//     } catch (err) {
//       const response = await instance.acquireTokenPopup(loginRequest);
//       return response.accessToken;
//     }
//   };

//   const uploadToSharePointDirect = async (file, targetFolder) => {
//     const accessToken = await getAccessToken();

//     // Initialize Microsoft Graph Client with access token
//     const graphClient = Client.init({
//       authProvider: (done) => done(null, accessToken),
//     });

//     const sanitizedFileName = `${file.name.replace(/\.[^/.]+$/, "")}_${Date.now()}.${file.name.split(".").pop()}`;
//     const itemPath = `${targetFolder}/${sanitizedFileName}`;

//     // 1. Small File Upload (<= 4MB)
//     if (file.size <= 4 * 1024 * 1024) {
//       const response = await graphClient
//         .api(`/drives/${SHAREPOINT_DRIVE_ID}/root:/${itemPath}:/content`)
//         .put(file);

//       return {
//         fileName: sanitizedFileName,
//         storagePath: response.webUrl,
//         spItemId: response.id,
//       };
//     }

//     // 2. Large File Upload (> 4MB) via Upload Session
//     const session = await graphClient
//       .api(
//         `/drives/${SHAREPOINT_DRIVE_ID}/root:/${itemPath}:/createUploadSession`,
//       )
//       .post({ item: { "@microsoft.graph.conflictBehavior": "rename" } });

//     const uploadUrl = session.uploadUrl;
//     const minChunkSize = 320 * 1024; // 320 KB
//     let start = 0;

//     while (start < file.size) {
//       const end = Math.min(start + minChunkSize, file.size);
//       const chunk = file.slice(start, end);

//       const response = await fetch(uploadUrl, {
//         method: "PUT",
//         headers: {
//           "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
//         },
//         body: chunk,
//       });

//       if (!response.ok) {
//         throw new Error(`Upload failed at byte range ${start}-${end}`);
//       }

//       const resData = await response.json();
//       if (resData.id) {
//         // Upload finished
//         return {
//           fileName: sanitizedFileName,
//           storagePath: resData.webUrl,
//           spItemId: resData.id,
//         };
//       }

//       start = end;
//     }
//   };

//   const handleSubmit = async () => {
//     if (!uploadedFile?.rawFile) return;

//     setIsUploading(true);

//     try {
//       const targetFolder = `documents/${new Date().getFullYear()}/${formData?.documentNo || "drafts"}`;

//       // Step 1: Direct upload from React browser to SharePoint
//       const spResult = await uploadToSharePointDirect(
//         uploadedFile.rawFile,
//         targetFolder,
//       );

//       // Step 2: Post document metadata to your database API
//       const payload = {
//         fileName: spResult.fileName,
//         storagePath: spResult.storagePath,
//         fileSize: uploadedFile.size,
//         // ... additional metadata fields
//       };

//       const res = await fetch("/api/documents", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (res.ok) alert("Uploaded successfully!");
//     } catch (err) {
//       console.error(err);
//       alert(`Upload failed: ${err.message}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <button onClick={handleSubmit} disabled={isUploading}>
//       {isUploading ? "Uploading..." : "Submit"}
//     </button>
//   );
// };

// 1. Define your Azure App Registration Credentials
const AZURE_TENANT_ID = "YOUR_TENANT_ID";
const AZURE_CLIENT_ID = "YOUR_CLIENT_ID";
const AZURE_CLIENT_SECRET = "YOUR_CLIENT_SECRET"; // ⚠️ WARNING: Exposed in frontend source code

const SHAREPOINT_DRIVE_ID = "YOUR_SHAREPOINT_DRIVE_ID"; // or Drive ID where files should go

// 2. Helper to fetch Access Token using Client Secret (Client Credentials Flow)
const getAccessTokenWithSecret = async () => {
  const tokenEndpoint = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", AZURE_CLIENT_ID);
  params.append("client_secret", AZURE_CLIENT_SECRET);
  params.append("scope", "https://graph.microsoft.com/.default");

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Azure Token Error: ${errorData.error_description || response.statusText}`,
    );
  }

  const data = await response.json();
  return data.access_token;
};

// 3. Helper to upload directly to SharePoint via Graph API
const uploadToSharePointDirect = async (file, targetFolder) => {
  // Obtain app token using Secret
  const accessToken = await getAccessTokenWithSecret();

  // Sanitize filename to avoid collisions
  const sanitizedFileName = `${file.name.replace(/\.[^/.]+$/, "")}_${Date.now()}.${file.name.split(".").pop()}`;
  const itemPath = `${targetFolder}/${sanitizedFileName}`;

  // SMALL FILE UPLOAD (<= 4MB)
  if (file.size <= 4 * 1024 * 1024) {
    const uploadUrl = `https://graph.microsoft.com/v1.0/drives/${SHAREPOINT_DRIVE_ID}/root:/${itemPath}:/content`;

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`SharePoint Upload Failed: ${errText}`);
    }

    const data = await response.json();
    return {
      fileName: sanitizedFileName,
      storagePath: data.webUrl,
      spItemId: data.id,
    };
  }

  // LARGE FILE UPLOAD (> 4MB using Upload Session)
  const sessionUrl = `https://graph.microsoft.com/v1.0/drives/${SHAREPOINT_DRIVE_ID}/root:/${itemPath}:/createUploadSession`;

  const sessionResponse = await fetch(sessionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item: {
        "@microsoft.graph.conflictBehavior": "rename",
      },
    }),
  });

  if (!sessionResponse.ok) {
    const errText = await sessionResponse.text();
    throw new Error(`Failed to create Upload Session: ${errText}`);
  }

  const sessionData = await sessionResponse.json();
  const uploadUrl = sessionData.uploadUrl;

  const chunkSize = 320 * 1024 * 10; // 3.2 MB chunks
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const chunkResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
      },
      body: chunk,
    });

    if (!chunkResponse.ok) {
      const errText = await chunkResponse.text();
      throw new Error(`Chunk upload failed at byte ${start}: ${errText}`);
    }

    const resData = await chunkResponse.json();
    if (resData.id) {
      // Completed upload
      return {
        fileName: sanitizedFileName,
        storagePath: resData.webUrl,
        spItemId: resData.id,
      };
    }

    start = end;
  }
};

// 4. Update handleSubmit in your React Component
const handleSubmit = async () => {
  if (!uploadedFile?.rawFile) {
    alert("Please select a file to attach.");
    return;
  }

  if (!isMetadataValid) {
    alert("Please fill in all mandatory fields before submitting.");
    return;
  }

  setIsUploading(true);

  try {
    // Step 1: Target path in SharePoint
    const generatedDocNo =
      formData.documentNo || generateDocumentNo(selectedTypeKey);
    const targetFolder = `documents/${new Date().getFullYear()}/${generatedDocNo}`;

    // Step 2: Directly upload file to SharePoint using Secret Key token
    const spResult = await uploadToSharePointDirect(
      uploadedFile.rawFile,
      targetFolder,
    );

    // Step 3: Build Payload
    const documentPayload = buildDocumentPayload(
      {
        fileName: spResult.fileName,
        extension: uploadedFile.extension,
        fileSize: uploadedFile.size,
        storagePath: spResult.storagePath,
      },
      selectedTypeKey,
      { ...formData, documentNo: generatedDocNo },
    );

    // Step 4: Save metadata to backend DB
    const createDocResponse = await fetch(`${backendUrlGrc}/api/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(documentPayload),
    });

    if (!createDocResponse.ok) {
      const errorText = await createDocResponse.text();
      throw new Error(
        `Document Creation Failed (${createDocResponse.status}): ${errorText}`,
      );
    }

    const responseData = await createDocResponse.json();
    alert("Document successfully uploaded to SharePoint and metadata saved!");

    if (onSubmitSuccess) {
      onSubmitSuccess(responseData);
    }
  } catch (error) {
    console.error("Upload Error:", error);
    alert(`Error submitting document: ${error.message}`);
  } finally {
    setIsUploading(false);
  }
};
