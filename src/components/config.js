import { PublicClientApplication } from "@azure/msal-browser";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const backendUrlUpload = import.meta.env.VITE_BACKEND_URL_UPLOAD;
export const backendUrlGrc = import.meta.env.VITE_BACKEND_URL_GRC;
export const loginBackendUrl = import.meta.env.VITE_LOGIN_BACKEND_URL;

const AzureClientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const AzureTenantId = import.meta.env.VITE_AZURE_TENANT_ID;

export const msalConfig = {
  auth: {
    clientId: AzureClientId, // Application (client) ID
    authority: `https://login.microsoftonline.com/${AzureTenantId}`,
    redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Files.ReadWrite.All", "Sites.ReadWrite.All"],
};

export const msalInstance = new PublicClientApplication(msalConfig);
