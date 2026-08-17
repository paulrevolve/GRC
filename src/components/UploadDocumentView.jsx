import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  Shield,
  Info,
  ArrowLeft,
  Building,
  DollarSign,
  Briefcase,
  Layers,
  Scale,
  Award,
  ShoppingCart,
  FolderGit2,
  HardDrive,
  Sparkles,
  Loader2,
} from "lucide-react";
import { backendUrlGrc, backendUrlUpload, loginRequest } from "./config";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { Client } from "@microsoft/microsoft-graph-client";

// Setup pdfjs worker using native Vite asset URL resolving
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ==========================================
// METADATA SCHEMAS FOR DOCUMENT TYPES
// ==========================================
const DOCUMENT_TYPES_CONFIG = {
  CONTRACT: {
    id: "CONTRACT",
    label: "Contract / Agreement",
    icon: FileText,
    workflow: "Contract Approval Workflow",
    retentionPolicy: "CON-7Y - 7 Years Retention",
    reviewFrequency: "Annually",
    allowedFiles: ".pdf, .docx, .xlsx, .jpg, .png",
    description:
      "All contracts and agreements with customers, vendors, or partners.",
    fields: [
      {
        name: "contractNumber",
        label: "Contract Number",
        type: "text",
        required: true,
        placeholder: "e.g., CNT-2024-00087",
      },
      {
        name: "contractTitle",
        label: "Contract Title",
        type: "text",
        required: true,
        placeholder: "Title or Name of the contract",
      },
      {
        name: "counterparty",
        label: "Counterparty",
        type: "text",
        required: true,
        placeholder: "Party (Customer/Vendor)",
      },
      {
        name: "contractType",
        label: "Contract Type",
        type: "dropdown",
        required: true,
        options: ["Service", "License", "NDA", "SLA", "Master Agreement"],
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
      },
      {
        name: "expirationDate",
        label: "Expiration Date",
        type: "date",
        required: true,
      },
      {
        name: "contractValue",
        label: "Contract Value",
        type: "currency",
        required: false,
      },
      {
        name: "currency",
        label: "Currency",
        type: "dropdown",
        required: false,
        options: ["USD", "EUR", "GBP", "INR", "AED", "CAD"],
      },
      {
        name: "department",
        label: "Department",
        type: "dropdown",
        required: false,
        options: ["Information Technology", "Legal", "Finance", "HR", "Sales"],
      },
      {
        name: "businessOwner",
        label: "Business Owner",
        type: "text",
        required: false,
        placeholder: "Contract owner",
      },
      {
        name: "paymentTerms",
        label: "Payment Terms",
        type: "text",
        required: false,
        placeholder: "e.g., Net 30, Quarterly",
      },
      {
        name: "renewalTerms",
        label: "Renewal Terms",
        type: "text",
        required: false,
        placeholder: "Renewal or notice period details",
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: false,
        options: ["Public", "Internal", "Confidential", "Restricted"],
      },
      {
        name: "governingLaw",
        label: "Governing Law",
        type: "text",
        required: false,
        placeholder: "Applicable governing law",
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Contract", "ERP", "Vendor", "High-Value", "Legal"],
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        placeholder: "Brief summary or notes",
      },
    ],
  },
  POLICY: {
    id: "POLICY",
    label: "Policy / Procedure",
    icon: Shield,
    workflow: "Policy Governance & Review",
    retentionPolicy: "POL-5Y - 5 Years Retention",
    reviewFrequency: "Annually",
    allowedFiles: ".pdf, .docx",
    description:
      "Company policies, standard operating procedures, and governance guidelines.",
    fields: [
      {
        name: "policyNumber",
        label: "Policy Number",
        type: "text",
        required: true,
        placeholder: "e.g., POL-IS-001",
      },
      {
        name: "policyTitle",
        label: "Policy Title",
        type: "text",
        required: true,
        placeholder: "Title of the policy",
      },
      {
        name: "department",
        label: "Department",
        type: "dropdown",
        required: true,
        options: ["IT", "HR", "Compliance", "Finance", "Operations"],
      },
      {
        name: "policyOwner",
        label: "Policy Owner",
        type: "text",
        required: true,
        placeholder: "Policy owner name",
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
      },
      {
        name: "reviewDate",
        label: "Review Date",
        type: "date",
        required: true,
      },
      {
        name: "version",
        label: "Version",
        type: "text",
        required: true,
        placeholder: "e.g., v1.0",
      },
      {
        name: "approvedBy",
        label: "Approved By",
        type: "text",
        required: false,
        placeholder: "Approver name",
      },
      {
        name: "approvalDate",
        label: "Approval Date",
        type: "date",
        required: false,
      },
      {
        name: "policyType",
        label: "Policy Type",
        type: "dropdown",
        required: true,
        options: ["HR", "IT", "Finance", "Legal", "Security"],
      },
      {
        name: "applicability",
        label: "Applicability",
        type: "text",
        required: false,
        placeholder: "Scope / Target Audience",
      },
      {
        name: "relatedPolicy",
        label: "Related Policy",
        type: "text",
        required: false,
        placeholder: "Related policy numbers/links",
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Public", "Internal", "Confidential"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Policy", "Compliance", "SOP", "Mandatory"],
      },
    ],
  },
  INVOICE: {
    id: "INVOICE",
    label: "Invoice",
    icon: DollarSign,
    workflow: "Accounts Payable Verification",
    retentionPolicy: "FIN-7Y - 7 Years Retention",
    reviewFrequency: "None",
    allowedFiles: ".pdf, .png, .jpg",
    description: "Invoices, billing statements, and financial vouchers.",
    fields: [
      {
        name: "invoiceNumber",
        label: "Invoice Number",
        type: "text",
        required: true,
        placeholder: "e.g., INV-99210",
      },
      {
        name: "vendorName",
        label: "Vendor Name",
        type: "text",
        required: true,
        placeholder: "Vendor / Supplier Name",
      },
      {
        name: "invoiceDate",
        label: "Invoice Date",
        type: "date",
        required: true,
      },
      { name: "dueDate", label: "Due Date", type: "date", required: true },
      {
        name: "amount",
        label: "Amount",
        type: "decimal",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "currency",
        label: "Currency",
        type: "dropdown",
        required: true,
        options: ["USD", "EUR", "GBP", "INR", "AED"],
      },
      {
        name: "taxAmount",
        label: "Tax Amount",
        type: "decimal",
        required: false,
        placeholder: "0.00",
      },
      {
        name: "totalAmount",
        label: "Total Amount",
        type: "decimal",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "poNumber",
        label: "PO Number",
        type: "text",
        required: false,
        placeholder: "Purchase Order #",
      },
      {
        name: "costCenter",
        label: "Cost Center",
        type: "dropdown",
        required: false,
        options: [
          "CC-101 (Engineering)",
          "CC-102 (Marketing)",
          "CC-103 (Sales)",
          "CC-104 (Real Estate)",
        ],
      },
      {
        name: "glAccount",
        label: "GL Account",
        type: "text",
        required: false,
        placeholder: "General ledger account",
      },
      {
        name: "department",
        label: "Department",
        type: "dropdown",
        required: false,
        options: ["Finance", "IT", "Operations"],
      },
      {
        name: "paymentTerms",
        label: "Payment Terms",
        type: "text",
        required: false,
        placeholder: "Net 30 / Net 60",
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Invoice", "Paid", "Pending", "Tax"],
      },
    ],
  },
  HR_RECORD: {
    id: "HR_RECORD",
    label: "4. HR Record",
    icon: Briefcase,
    workflow: "HR Document Archival",
    retentionPolicy: "HR-10Y - 10 Years Retention",
    reviewFrequency: "Bi-Annually",
    allowedFiles: ".pdf, .docx, .png",
    description:
      "Employee records, offer letters, reviews, and HR documentations.",
    fields: [
      {
        name: "employeeId",
        label: "Employee ID",
        type: "text",
        required: true,
        placeholder: "e.g., EMP-4029",
      },
      {
        name: "employeeName",
        label: "Employee Name",
        type: "text",
        required: true,
        placeholder: "Full Name",
      },
      {
        name: "recordType",
        label: "Record Type",
        type: "dropdown",
        required: true,
        options: [
          "Offer Letter",
          "Appraisal",
          "ID Proof",
          "Contract",
          "Training",
        ],
      },
      {
        name: "department",
        label: "Department",
        type: "dropdown",
        required: true,
        options: ["Engineering", "HR", "Sales", "Marketing"],
      },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: false,
        placeholder: "Job Title",
      },
      {
        name: "recordDate",
        label: "Record Date",
        type: "date",
        required: true,
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: false,
      },
      {
        name: "expirationDate",
        label: "Expiration Date",
        type: "date",
        required: false,
      },
      {
        name: "location",
        label: "Location",
        type: "dropdown",
        required: false,
        options: ["New York", "London", "Remote", "Bangalore", "Dubai"],
      },
      {
        name: "manager",
        label: "Manager",
        type: "text",
        required: false,
        placeholder: "Reporting Manager",
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Confidential", "Restricted"],
      },
      {
        name: "notes",
        label: "Notes",
        type: "textarea",
        required: false,
        placeholder: "Additional Notes",
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["HR", "Personal", "Onboarding", "Review"],
      },
    ],
  },
  FINANCIAL: {
    id: "FINANCIAL",
    label: "5. Financial Document",
    icon: Layers,
    workflow: "Financial Governance Review",
    retentionPolicy: "FIN-7Y - 7 Years Retention",
    reviewFrequency: "Quarterly",
    allowedFiles: ".pdf, .xlsx, .docx",
    description:
      "Budgets, balance sheets, financial reports, and tax statements.",
    fields: [
      {
        name: "documentType",
        label: "Document Type",
        type: "dropdown",
        required: true,
        options: ["Budget", "Report", "Statement", "Audit", "Tax"],
      },
      {
        name: "fiscalYear",
        label: "Fiscal Year",
        type: "text",
        required: true,
        placeholder: "e.g., FY2026",
      },
      {
        name: "period",
        label: "Period",
        type: "text",
        required: true,
        placeholder: "Q1, Q2, Month, Year",
      },
      {
        name: "entity",
        label: "Entity",
        type: "dropdown",
        required: true,
        options: ["HQ Corp", "US Subsidiary", "EU Branch", "APAC HQ"],
      },
      {
        name: "department",
        label: "Department",
        type: "dropdown",
        required: true,
        options: ["Finance", "Accounting", "Executive"],
      },
      {
        name: "amount",
        label: "Amount",
        type: "decimal",
        required: false,
        placeholder: "Total amount if applicable",
      },
      {
        name: "currency",
        label: "Currency",
        type: "dropdown",
        required: false,
        options: ["USD", "EUR", "GBP", "AED"],
      },
      {
        name: "preparedBy",
        label: "Prepared By",
        type: "text",
        required: false,
        placeholder: "Author name",
      },
      {
        name: "approvedBy",
        label: "Approved By",
        type: "text",
        required: false,
        placeholder: "Approver name",
      },
      {
        name: "approvalDate",
        label: "Approval Date",
        type: "date",
        required: false,
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Confidential", "Restricted"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Finance", "Audit", "Tax", "Budget"],
      },
    ],
  },
  COMPLIANCE: {
    id: "COMPLIANCE",
    label: "6. Compliance Document",
    icon: Award,
    workflow: "Compliance Audit Workflow",
    retentionPolicy: "CMP-10Y - 10 Years Retention",
    reviewFrequency: "Annually",
    allowedFiles: ".pdf, .docx",
    description:
      "Certifications, ISO/SOX documents, regulatory records, and disclosures.",
    fields: [
      {
        name: "complianceType",
        label: "Compliance Type",
        type: "dropdown",
        required: true,
        options: ["ISO 27001", "GDPR", "SOX", "SOC2", "HIPAA"],
      },
      {
        name: "regulation",
        label: "Regulation",
        type: "text",
        required: true,
        placeholder: "Standard or Regulation name",
      },
      {
        name: "applicableRegion",
        label: "Applicable Region",
        type: "dropdown",
        required: true,
        options: ["Global", "US", "EU", "APAC", "MEA"],
      },
      {
        name: "complianceOwner",
        label: "Compliance Owner",
        type: "text",
        required: true,
        placeholder: "Owner name",
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
      },
      {
        name: "validUntil",
        label: "Valid Until",
        type: "date",
        required: false,
      },
      {
        name: "status",
        label: "Status",
        type: "dropdown",
        required: true,
        options: ["Compliant", "Non-Compliant", "Under Review"],
      },
      {
        name: "referenceNumber",
        label: "Reference Number",
        type: "text",
        required: false,
        placeholder: "Certificate / Ref #",
      },
      {
        name: "issuedBy",
        label: "Issued By",
        type: "text",
        required: false,
        placeholder: "Issuing authority",
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Public", "Internal", "Confidential"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Audit", "Security", "Regulatory"],
      },
    ],
  },
  LEGAL: {
    id: "LEGAL",
    label: "7. Legal Document",
    icon: Scale,
    workflow: "Legal Approval Workflow",
    retentionPolicy: "LGL-IND - Indefinite Retention",
    reviewFrequency: "As Needed",
    allowedFiles: ".pdf, .docx",
    description:
      "Litigation records, legal cases, court filings, and IP documentation.",
    fields: [
      {
        name: "matterCaseName",
        label: "Matter / Case Name",
        type: "text",
        required: true,
        placeholder: "Case or Matter title",
      },
      {
        name: "caseNumber",
        label: "Case Number",
        type: "text",
        required: true,
        placeholder: "Case Reference Number",
      },
      {
        name: "documentType",
        label: "Document Type",
        type: "dropdown",
        required: true,
        options: ["Pleading", "Evidence", "Filing", "Brief", "Order"],
      },
      {
        name: "courtAuthority",
        label: "Court / Authority",
        type: "text",
        required: true,
        placeholder: "Court or Jurisdiction name",
      },
      { name: "filedOn", label: "Filed On", type: "date", required: false },
      {
        name: "nextHearingDate",
        label: "Next Hearing Date",
        type: "date",
        required: false,
      },
      {
        name: "lawyerAttorney",
        label: "Lawyer / Attorney",
        type: "text",
        required: false,
        placeholder: "Responsible Attorney",
      },
      {
        name: "opposingParty",
        label: "Opposing Party",
        type: "text",
        required: false,
        placeholder: "Opposing entity",
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Confidential", "Restricted"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Legal", "Litigation", "IP", "Court"],
      },
    ],
  },
  IT_SYSTEM: {
    id: "IT_SYSTEM",
    label: "8. IT / System Document",
    icon: HardDrive,
    workflow: "IT System Governance",
    retentionPolicy: "IT-3Y - 3 Years Retention",
    reviewFrequency: "Semi-Annually",
    allowedFiles: ".pdf, .docx, .txt, .json",
    description:
      "System architecture, API documentation, SOPs, and deployment guides.",
    fields: [
      {
        name: "documentType",
        label: "Document Type",
        type: "dropdown",
        required: true,
        options: ["Architecture", "SOP", "Manual", "API Spec", "Runbook"],
      },
      {
        name: "systemApplication",
        label: "System / Application",
        type: "text",
        required: true,
        placeholder: "Target System Name",
      },
      {
        name: "environment",
        label: "Environment",
        type: "dropdown",
        required: true,
        options: ["Dev", "Test", "UAT", "Prod"],
      },
      {
        name: "version",
        label: "Version",
        type: "text",
        required: false,
        placeholder: "e.g., v2.4.0",
      },
      {
        name: "owner",
        label: "Owner",
        type: "text",
        required: false,
        placeholder: "System / Doc Owner",
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
      },
      {
        name: "reviewDate",
        label: "Review Date",
        type: "date",
        required: false,
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Internal", "Confidential"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["IT", "DevOps", "Infrastructure", "Security"],
      },
    ],
  },
  MARKETING: {
    id: "MARKETING",
    label: "9. Marketing Document",
    icon: Building,
    workflow: "Brand & Content Review",
    retentionPolicy: "MKT-2Y - 2 Years Retention",
    reviewFrequency: "Quarterly",
    allowedFiles: ".pdf, .png, .jpg, .pptx, .docx",
    description:
      "Campaign materials, brochures, presentations, and brand collateral.",
    fields: [
      {
        name: "campaignName",
        label: "Campaign Name",
        type: "text",
        required: true,
        placeholder: "Marketing campaign title",
      },
      {
        name: "documentType",
        label: "Document Type",
        type: "dropdown",
        required: true,
        options: ["Brochure", "Flyer", "Presentation", "Ad", "Press Release"],
      },
      {
        name: "productService",
        label: "Product / Service",
        type: "text",
        required: true,
        placeholder: "Related Product",
      },
      {
        name: "targetAudience",
        label: "Target Audience",
        type: "text",
        required: false,
        placeholder: "Target demographic/segment",
      },
      {
        name: "createdBy",
        label: "Created By",
        type: "text",
        required: true,
        placeholder: "Creator name",
      },
      {
        name: "createdDate",
        label: "Created Date",
        type: "date",
        required: true,
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: false,
      },
      {
        name: "expiryDate",
        label: "Expiry Date",
        type: "date",
        required: false,
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Public", "Internal"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Campaign", "Brand", "2026", "Digital"],
      },
    ],
  },
  PURCHASE_ORDER: {
    id: "PURCHASE_ORDER",
    label: "10. Purchase Order",
    icon: ShoppingCart,
    workflow: "Procurement Approval Workflow",
    retentionPolicy: "PO-7Y - 7 Years Retention",
    reviewFrequency: "None",
    allowedFiles: ".pdf, .xlsx",
    description:
      "Issued purchase orders, procurement requisitions, and vendor POs.",
    fields: [
      {
        name: "poNumber",
        label: "PO Number",
        type: "text",
        required: true,
        placeholder: "e.g., PO-88391",
      },
      {
        name: "vendor",
        label: "Vendor",
        type: "text",
        required: true,
        placeholder: "Vendor Name",
      },
      { name: "poDate", label: "PO Date", type: "date", required: true },
      {
        name: "amount",
        label: "Amount",
        type: "decimal",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "currency",
        label: "Currency",
        type: "dropdown",
        required: true,
        options: ["USD", "EUR", "GBP", "AED"],
      },
      {
        name: "deliveryDate",
        label: "Delivery Date",
        type: "date",
        required: false,
      },
      {
        name: "department",
        label: "Department",
        type: "dropdown",
        required: true,
        options: ["Procurement", "IT", "Operations"],
      },
      {
        name: "requestedBy",
        label: "Requested By",
        type: "text",
        required: false,
        placeholder: "Requester Name",
      },
      {
        name: "status",
        label: "Status",
        type: "dropdown",
        required: false,
        options: ["Draft", "Approved", "Closed", "Cancelled"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Procurement", "Hardware", "Software", "Vendor"],
      },
    ],
  },
  PROJECT: {
    id: "PROJECT",
    label: "11. Project Document",
    icon: FolderGit2,
    workflow: "Project Governance Review",
    retentionPolicy: "PRJ-5Y - 5 Years Retention",
    reviewFrequency: "Quarterly",
    allowedFiles: ".pdf, .docx, .pptx, .xlsx",
    description: "Project charters, design specifications, plans, and reports.",
    fields: [
      {
        name: "projectName",
        label: "Project Name",
        type: "text",
        required: true,
        placeholder: "Name of the project",
      },
      {
        name: "projectCode",
        label: "Project Code",
        type: "text",
        required: true,
        placeholder: "e.g., PRJ-FIN-01",
      },
      {
        name: "documentType",
        label: "Document Type",
        type: "dropdown",
        required: true,
        options: ["Plan", "Report", "Design", "Charter", "Minutes"],
      },
      {
        name: "phase",
        label: "Phase",
        type: "dropdown",
        required: false,
        options: ["Initiation", "Planning", "Execution", "Closing"],
      },
      {
        name: "owner",
        label: "Owner",
        type: "text",
        required: true,
        placeholder: "Project Lead / Owner",
      },
      {
        name: "version",
        label: "Version",
        type: "text",
        required: false,
        placeholder: "v1.0",
      },
      { name: "issueDate", label: "Issue Date", type: "date", required: false },
      {
        name: "reviewDate",
        label: "Review Date",
        type: "date",
        required: false,
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Internal", "Confidential"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["Project", "Milestone", "Spec"],
      },
    ],
  },
  GENERAL: {
    id: "GENERAL",
    label: "12. General Document",
    icon: FileText,
    workflow: "Standard Archive Workflow",
    retentionPolicy: "GEN-3Y - 3 Years Retention",
    reviewFrequency: "Annually",
    allowedFiles: ".pdf, .docx, .txt, .png, .jpg",
    description:
      "General documentation, memos, and miscellaneous enterprise files.",
    fields: [
      {
        name: "documentTitle",
        label: "Document Title",
        type: "text",
        required: true,
        placeholder: "Title of the document",
      },
      {
        name: "category",
        label: "Category",
        type: "dropdown",
        required: true,
        options: ["Memo", "Notes", "General", "Reference"],
      },
      {
        name: "department",
        label: "Department",
        type: "dropdown",
        required: true,
        options: ["General", "Operations", "Admin"],
      },
      {
        name: "owner",
        label: "Owner",
        type: "text",
        required: true,
        placeholder: "Document Owner",
      },
      {
        name: "createdDate",
        label: "Created Date",
        type: "date",
        required: true,
      },
      {
        name: "reviewDate",
        label: "Review Date",
        type: "date",
        required: false,
      },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "dropdown",
        required: true,
        options: ["Public", "Internal", "Confidential"],
      },
      {
        name: "tags",
        label: "Tags",
        type: "multiselect",
        required: false,
        options: ["General", "Enterprise"],
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        placeholder: "Brief details",
      },
    ],
  },
};

// Utility function to format file sizes
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Convert dates formatted like '06-Jul-26' or '13/08/2026' into 'YYYY-MM-DD'
const parseToISODate = (dateStr) => {
  if (!dateStr) return "";
  try {
    let day, month, year;
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        day = parts[0].padStart(2, "0");
        const months = {
          jan: "01",
          feb: "02",
          mar: "03",
          apr: "04",
          may: "05",
          jun: "06",
          jul: "07",
          aug: "08",
          sep: "09",
          oct: "10",
          nov: "11",
          dec: "12",
        };
        month = months[parts[1].toLowerCase()] || "01";
        year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${year}-${month}-${day}`;
      }
    } else if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        day = parts[0].padStart(2, "0");
        month = parts[1].padStart(2, "0");
        year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${year}-${month}-${day}`;
      }
    }
  } catch (e) {
    console.warn("Date parsing error:", e);
  }
  return "";
};

// Helper components
const StepBadge = ({ step, title, active, completed }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${completed ? "bg-emerald-600 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}
    >
      {completed ? <CheckCircle2 size={14} /> : step}
    </div>
    <span
      className={`text-xs font-medium ${active ? "text-slate-900 font-bold" : "text-slate-500"}`}
    >
      {title}
    </span>
  </div>
);

const StepDivider = () => <div className="h-0.5 w-8 bg-slate-200" />;

const ContextRow = ({ label, value }) => (
  <div className="flex justify-between py-1.5">
    <span className="text-slate-500 font-medium">{label}:</span>
    <span className="text-slate-800 font-semibold text-right">{value}</span>
  </div>
);

const SHAREPOINT_DRIVE_ID = "YOUR_SHAREPOINT_DRIVE_ID";
// ==========================================
// MAIN COMPONENT
// ==========================================
export function UploadDocumentView({
  onCancel,
  onSubmitSuccess,
  currentUser,
  showBackButton = false,
}) {
  const { instance, accounts } = useMsal();
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedTypeKey, setSelectedTypeKey] = useState("INVOICE");
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [formData, setFormData] = useState({
    documentNo: "",
    title: "",
    documentTypeId: "",
    categoryId: "",
    classificationId: "",
    organizationId: "",
    departmentId: "",
    ownerUserId: currentUser?.userId || 1,
    status: "DRAFT",
    createdBy: currentUser?.userId || 1,
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // --- New API States ---
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [selectedBackendType, setSelectedBackendType] = useState(null);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  // Helper to acquire MSAL access token
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

  // Upload file directly to SharePoint via Graph API
  const uploadToSharePointDirect = async (file, targetFolder) => {
    const accessToken = await getAccessToken();

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
    const minChunkSize = 320 * 1024; // 320 KB chunks
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
        return {
          fileName: sanitizedFileName,
          storagePath: resData.webUrl,
          spItemId: resData.id,
        };
      }

      start = end;
    }
  };

  // const activeConfig = useMemo(() => {
  //   return (
  //     DOCUMENT_TYPES_CONFIG[selectedTypeKey] || DOCUMENT_TYPES_CONFIG.INVOICE
  //   );
  // }, [selectedTypeKey]);

  // Fetch document types from the backend endpoint
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const response = await fetch(`${backendUrlGrc}/api/documents/types`);
        if (response.ok) {
          const data = await response.json();
          setDocumentTypeOptions(data);

          // Default selection to first active backend item or POLICY
          if (data && data.length > 0) {
            const initialItem =
              data.find((d) => d.typeCode === "POLICY") || data[0];
            setSelectedBackendType(initialItem);
            setSelectedTypeKey(initialItem.typeCode);
            setFormData((prev) => ({
              ...prev,
              documentTypeId: initialItem.documentTypeId,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load document types:", err);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  // const handleTypeChange = (e) => {
  //   const key = e.target.value;
  //   setSelectedTypeKey(key);
  //   setFormData({ currency: "USD", tags: [] });
  // };

  const handleTypeChange = (e) => {
    const key = e.target.value;
    setSelectedTypeKey(key);

    const backendMatch = documentTypeOptions.find(
      (item) => item.typeCode === key,
    );
    setSelectedBackendType(backendMatch || null);

    setFormData((prev) => ({
      ...prev,
      documentTypeId: backendMatch ? backendMatch.documentTypeId : "",
      currency: "USD",
      tags: [],
    }));
  };

  // Merge dynamic backend workflow details with local form schema
  const activeConfig = useMemo(() => {
    const localConfig =
      DOCUMENT_TYPES_CONFIG[selectedTypeKey] || DOCUMENT_TYPES_CONFIG.GENERAL;

    return {
      ...localConfig,
      // Priority given to live backend workflow details if available
      workflow:
        selectedBackendType?.workflowDefinition?.workflowName ||
        localConfig.workflow,
      workflowDescription:
        selectedBackendType?.workflowDefinition?.description || "",
      reviewFrequencyDays: selectedBackendType?.reviewFrequencyDays,
      backendId: selectedBackendType?.documentTypeId || null,
    };
  }, [selectedTypeKey, selectedBackendType]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateDocumentNo = (selectedTypeKey) => {
    const prefix = selectedTypeKey
      ? selectedTypeKey.slice(0, 3).toUpperCase()
      : "DOC";
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit random

    return `${prefix}-${year}-${timestamp}${randomSuffix}`;
  };

  // 1. Enhanced Line-preserving PDF text extractor
  const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let lastY = null;
      let pageText = "";

      for (const item of textContent.items) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += "\n";
        }
        pageText += item.str + " ";
        lastY = item.transform[5];
      }

      fullText += pageText + "\n";
    }
    return fullText;
  };

  // 1. Updated Invoice Metadata Parser to reliably match invoice layout
  const parseInvoiceMetadata = (text) => {
    const parsed = {};

    // Normalize whitespace while preserving essential breaks
    const cleanText = text.replace(/[ \t]+/g, " ");

    // --- Invoice Number ---
    // Handles "Invoice Number : 202600000119" or "Invoice Number: 202600000119"
    const invMatch = cleanText.match(
      /Invoice\s*Number\s*[:\s]*([A-Za-z0-9]+)/i,
    );
    if (invMatch) {
      parsed.invoiceNumber = invMatch[1].trim();
    }

    // --- Bill To / Customer ---
    const billToMatch = cleanText.match(/Bill\s*To\s*[:\s]*([^\n\r]+)/i);
    if (billToMatch) {
      parsed.counterparty = billToMatch[1].trim();
    }

    // --- Vendor / Issuer Name ---
    const issuerMatch =
      cleanText.match(
        /Payments\s*are\s*for\s*and\s*on\s*behalf\s*of\s*([^\.\n\r]+)/i,
      ) || cleanText.match(/Bank\s*Account\s*Name\s*[:\s]*([^\n\r]+)/i);
    if (issuerMatch) {
      parsed.vendorName = issuerMatch[1].trim();
    } else {
      parsed.vendorName = "Afra Ghanim Ali Khalifa Alfalasi";
    }

    // --- Invoice Date ---
    const invDateMatch = cleanText.match(
      /Invoice\s*Date\s*[:\s]*([0-9]{2}-[A-Za-z]{3}-[0-9]{2,4})/i,
    );
    if (invDateMatch) {
      parsed.invoiceDate = parseToISODate(invDateMatch[1].trim());
    }

    // --- Amounts & Totals ---
    // Robust extraction for "Total (AED) 2,600.00 0.00 2,600.00"
    const totalLineMatch = cleanText.match(
      /Total\s*\([A-Z]+\)\s*([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/i,
    );
    if (totalLineMatch) {
      parsed.amount = totalLineMatch[1].replace(/,/g, "");
      parsed.taxAmount = totalLineMatch[2].replace(/,/g, "");
      parsed.totalAmount = totalLineMatch[3].replace(/,/g, "");
    } else {
      // Fallback searches for total AED
      const amounts = cleanText.match(/[\d,]+\.\d{2}/g);
      if (amounts && amounts.length > 0) {
        parsed.totalAmount = amounts[amounts.length - 1].replace(/,/g, "");
        parsed.amount = amounts[0].replace(/,/g, "");
      }
    }

    // --- Currency ---
    if (/AED/i.test(cleanText)) parsed.currency = "AED";
    else if (/USD/i.test(cleanText)) parsed.currency = "USD";
    else if (/EUR/i.test(cleanText)) parsed.currency = "EUR";

    // --- Payment Terms & Due Date ---
    const dueDaysMatch = cleanText.match(
      /Payment\s*due\s*within\s*(\d+)\s*days/i,
    );
    if (dueDaysMatch) {
      const days = parseInt(dueDaysMatch[1], 10);
      parsed.paymentTerms = `Net ${days}`;

      if (parsed.invoiceDate) {
        const d = new Date(parsed.invoiceDate);
        d.setDate(d.getDate() + days);
        parsed.dueDate = d.toISOString().split("T")[0];
      }
    }

    parsed.tags = ["Invoice", "Tax", "Auto-Extracted"];

    return parsed;
  };

  // 2. Updated Dispatch & Map Extraction Handler (Aligned with INVOICE schema fields)
  const processPdfAndMapFields = async (file) => {
    try {
      setIsExtracting(true);
      const text = await extractPdfText(file);

      let extracted = {};
      if (selectedTypeKey === "INVOICE") {
        extracted = parseInvoiceMetadata(text);
      }

      setFormData((prev) => ({
        ...prev,
        // Document level fields
        documentNo: extracted.invoiceNumber || prev.documentNo,
        title: extracted.invoiceNumber
          ? `Invoice #${extracted.invoiceNumber}`
          : prev.title,

        // Form Fields (Matching DOCUMENT_TYPES_CONFIG.INVOICE field names)
        invoiceNumber: extracted.invoiceNumber || prev.invoiceNumber,
        vendorName: extracted.vendorName || prev.vendorName,
        invoiceDate: extracted.invoiceDate || prev.invoiceDate,
        dueDate: extracted.dueDate || prev.dueDate,
        amount: extracted.amount || prev.amount,
        taxAmount: extracted.taxAmount || prev.taxAmount,
        totalAmount: extracted.totalAmount || prev.totalAmount,
        currency: extracted.currency || prev.currency || "AED",
        paymentTerms: extracted.paymentTerms || prev.paymentTerms,
        tags: Array.from(
          new Set([...(prev.tags || []), ...(extracted.tags || [])]),
        ),
      }));
    } catch (err) {
      console.error("Failed to parse metadata from document:", err);
    } finally {
      setIsExtracting(false);
    }
  };
  // Process File selection
  const processSelectedFile = async (file) => {
    if (!file) return;

    const allowedExtensions = activeConfig.allowedFiles
      .split(",")
      .map((ext) => ext.trim().toLowerCase());
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      alert(
        `Invalid file type. Allowed extensions for ${activeConfig.label}: ${activeConfig.allowedFiles}`,
      );
      return;
    }

    setUploadedFile({
      rawFile: file,
      name: file.name,
      size: file.size,
      extension: fileExtension.replace(".", "").toUpperCase(),
    });

    if (fileExtension === ".pdf") {
      await processPdfAndMapFields(file);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await processSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const isMetadataValid = useMemo(() => {
    return activeConfig.fields
      .filter((f) => f.required)
      .every(
        (f) => formData[f.name] && formData[f.name].toString().trim() !== "",
      );
  }, [activeConfig, formData]);

  const buildDocumentPayload = (fileData, selectedTypeKey, formData) => {
    const todayDate = new Date().toISOString().split("T")[0];

    // Retrieve schema configuration for the current document type
    const activeConfig =
      DOCUMENT_TYPES_CONFIG[selectedTypeKey] || DOCUMENT_TYPES_CONFIG.GENERAL;

    const generatedDocNo = generateDocumentNo(selectedTypeKey);

    // Map user inputs into the metadata key-value array format
    const metadataPayload = activeConfig.fields
      .filter(
        (field) =>
          formData[field.name] !== undefined && formData[field.name] !== "",
      )
      .map((field) => ({
        metadataKey: field.name,
        // If the field is a multiselect array, format as a comma-separated string or stringify as needed
        metadataValue: Array.isArray(formData[field.name])
          ? formData[field.name].join(", ")
          : String(formData[field.name]),
      }));

    return {
      documentNo: generatedDocNo,
      title: formData.title || uploadedFile?.name || "Untitled Document",
      documentTypeId: Number(formData.documentTypeId),
      categoryId: Number(formData.categoryId) || 6,
      classificationId: Number(formData.classificationId) || 1,
      organizationId: Number(formData.organizationId) || 1,
      departmentId: Number(formData.departmentId) || 1,
      ownerUserId: Number(formData.ownerUserId),
      status: formData.status || "DRAFT",
      version: {
        versionNo: "1.0",
        majorVersion: 1,
        minorVersion: 0,
        fileName: fileData?.fileName || uploadedFile?.name || "document.pdf",
        fileExtension: fileData?.extension || uploadedFile?.extension || ".pdf",
        fileSize: fileData?.fileSize || uploadedFile?.size || 0,
        storagePath:
          fileData?.storagePath ||
          `/documents/${new Date().getFullYear()}/${formData.documentNo}/1.0/`,
        contentHash: "SHA256_HASH_VALUE",
        status: "Draft",
        changeSummary: "Initial document version",
        changeReason: "New document",
        effectiveDate: todayDate,
      },
      metadata: metadataPayload, // Dynamic metadata list populated here
      createdBy: Number(formData.createdBy),
    };
  };

  /**
   * Post Payload to target endpoint AWS
   */
  const handleSubmit = async () => {
    if (!uploadedFile) {
      alert("Please select a file to attach.");
      return;
    }

    setIsUploading(true);

    try {
      const sanitizedFileName = uploadedFile.name.replace(/\s+/g, "_");
      let storagePath = `/documents/${new Date().getFullYear()}/${formData.documentNo}/1.0/`;

      // Step 1: Optional Presigned Upload handling
      try {
        const presignResp = await fetch(
          `${backendUrlUpload}/api/Timesheet/GetPresignedUrl/${encodeURIComponent(sanitizedFileName)}`,
        );
        if (presignResp.ok) {
          const presignedUrl = await presignResp.text();
          await fetch(presignedUrl, {
            method: "PUT",
            headers: {
              "Content-Type":
                uploadedFile.rawFile?.type || "application/octet-stream",
            },
            body: uploadedFile.rawFile,
          });
          storagePath = presignedUrl.split("?")[0];
        }
      } catch (err) {
        console.warn(
          "Presigned upload skipped/failed, proceeding to record API creation.",
        );
      }

      // Step 2: Build Clean Payload with metadata
      const documentPayload = buildDocumentPayload(
        {
          fileName: sanitizedFileName,
          extension: uploadedFile.extension,
          fileSize: uploadedFile.size,
          storagePath: storagePath,
        },
        selectedTypeKey, // Current document type (e.g., 'POLICY', 'CONTRACT')
        formData, // Current form inputs object
      );

      // Step 3: Call Document Creation API
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
      alert("Document successfully created!");

      if (onSubmitSuccess) {
        onSubmitSuccess(responseData);
      }
    } catch (error) {
      console.error("API POST Error:", error);
      alert(`Error submitting document: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // share point submit

  // const handleSubmit = async () => {
  //   if (!uploadedFile) {
  //     alert("Please select a file to attach.");
  //     return;
  //   }

  //   if (!isMetadataValid) {
  //     alert("Please fill in all mandatory fields before submitting.");
  //     return;
  //   }

  //   setIsUploading(true);

  //   try {
  //     // Step 1: Determine SharePoint Target Folder Path
  //     const generatedDocNo =
  //       formData.documentNo || generateDocumentNo(selectedTypeKey);
  //     const targetFolder = `documents/${new Date().getFullYear()}/${generatedDocNo}`;

  //     // Step 2: Directly upload file to SharePoint via Microsoft Graph
  //     const spResult = await uploadToSharePointDirect(
  //       uploadedFile.rawFile,
  //       targetFolder,
  //     );

  //     // Step 3: Build Clean Payload using returned SharePoint webUrl and metadata
  //     const documentPayload = buildDocumentPayload(
  //       {
  //         fileName: spResult.fileName,
  //         extension: uploadedFile.extension,
  //         fileSize: uploadedFile.size,
  //         storagePath: spResult.storagePath, // SharePoint Web URL
  //       },
  //       selectedTypeKey,
  //       { ...formData, documentNo: generatedDocNo },
  //     );

  //     // Step 4: Call backend GRC API to save metadata record
  //     const createDocResponse = await fetch(`${backendUrlGrc}/api/documents`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //       },
  //       body: JSON.stringify(documentPayload),
  //     });

  //     if (!createDocResponse.ok) {
  //       const errorText = await createDocResponse.text();
  //       throw new Error(
  //         `Document Creation Failed (${createDocResponse.status}): ${errorText}`,
  //       );
  //     }

  //     const responseData = await createDocResponse.json();
  //     alert("Document successfully uploaded to SharePoint and metadata saved!");

  //     if (onSubmitSuccess) {
  //       onSubmitSuccess(responseData);
  //     }
  //   } catch (error) {
  //     console.error("Upload/API POST Error:", error);
  //     alert(`Error submitting document: ${error.message}`);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  return (
    <div className="flex bg-slate-100 text-slate-800 font-sans min-h-screen">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Upload New Document
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new document entry in the Governance System
            </p>
          </div>
          {showBackButton && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Documents
            </button>
          )}
        </div>

        <div className="mx-auto w-full space-y-6 p-2">
          {/* <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between px-12">
            <StepBadge
              step={1}
              title="Document Type"
              active={currentStep === 1}
              completed={currentStep > 1}
            />
            <StepDivider />
            <StepBadge
              step={2}
              title="Metadata"
              active={currentStep === 2}
              completed={currentStep > 2}
            />
            <StepDivider />
            <StepBadge
              step={3}
              title="File Upload"
              active={currentStep === 3}
              completed={currentStep > 3}
            />
            <StepDivider />
            <StepBadge
              step={4}
              title="Review & Submit"
              active={currentStep === 4}
              completed={currentStep > 4}
            />
          </div> */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700  tracking-wider">
                  Select Document Type
                </label>
                <select
                  value={selectedTypeKey}
                  onChange={handleTypeChange}
                  disabled={isLoadingTypes}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {/* {Object.keys(DOCUMENT_TYPES_CONFIG).map((key) => (
                    <option key={key} value={key}>
                      {DOCUMENT_TYPES_CONFIG[key].label}
                    </option>
                  ))} */}
                  {documentTypeOptions.length > 0
                    ? documentTypeOptions
                        .filter((item) => item.isActive)
                        .map((item) => (
                          <option
                            key={item.documentTypeId}
                            value={item.typeCode}
                          >
                            {item.typeName} ({item.typeCode})
                          </option>
                        ))
                    : // Fallback options while loading or if offline
                      Object.keys(DOCUMENT_TYPES_CONFIG).map((key) => (
                        <option key={key} value={key}>
                          {DOCUMENT_TYPES_CONFIG[key].label}
                        </option>
                      ))}
                </select>
              </div>

              {isExtracting && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-xs">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>
                    Extracting metadata automatically from uploaded PDF...
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {activeConfig.fields.map((field) => (
                  <div
                    key={field.name}
                    className={
                      field.type === "textarea" ? "col-span-2" : "col-span-1"
                    }
                  >
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {field.type === "text" && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                      />
                    )}

                    {field.type === "date" && (
                      <input
                        type="date"
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                    )}

                    {field.type === "dropdown" && (
                      <select
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select Option</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "currency" && (
                      <div className="flex gap-2">
                        <select
                          value={formData.currency || "USD"}
                          onChange={(e) =>
                            handleInputChange("currency", e.target.value)
                          }
                          className="w-20 border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="INR">INR</option>
                          <option value="AED">AED</option>
                        </select>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.value)
                          }
                          className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {field.type === "decimal" && (
                      <input
                        type="number"
                        placeholder={field.placeholder || "0.00"}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                      />
                    )}

                    {field.type === "multiselect" && (
                      <div className="border border-slate-300 rounded p-1.5 flex flex-wrap items-center gap-1.5 bg-white min-h-[34px]">
                        {(formData.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 border border-blue-200"
                          >
                            {tag}
                            <X
                              size={12}
                              className="cursor-pointer hover:text-blue-900"
                              onClick={() =>
                                handleInputChange(
                                  "tags",
                                  formData.tags.filter((t) => t !== tag),
                                )
                              }
                            />
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="Add tags..."
                          className="flex-1 text-xs outline-none px-1 bg-transparent"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              handleInputChange("tags", [
                                ...(formData.tags || []),
                                e.target.value.trim(),
                              ]);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 resize-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Submit & Save Document"
                  )}
                </button>
              </div>
            </div>

            <div className="col-span-4 space-y-6">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <activeConfig.icon className="h-5 w-5 text-blue-600" />
                  <span>Document Type Context</span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-200/60 pt-1">
                  <ContextRow label="Workflow" value={activeConfig.workflow} />
                  {/* <ContextRow
                    label="Retention"
                    value={activeConfig.retentionPolicy}
                  /> */}
                  <ContextRow
                    label="Review Freq."
                    value={activeConfig.reviewFrequencyDays}
                  />
                  <ContextRow
                    label="Allowed Files"
                    value={activeConfig.allowedFiles}
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-800  tracking-wider">
                  File Attachment
                </h4>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={activeConfig.allowedFiles}
                  className="hidden"
                />

                <div
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center space-y-2 cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-100/60" : "border-blue-200 bg-blue-50/40 hover:border-blue-400"}`}
                >
                  <Upload size={20} className="mx-auto text-blue-600" />
                  <p className="text-xs font-semibold text-slate-800">
                    Drag & drop file or click to browse
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Accepts: {activeConfig.allowedFiles}
                  </p>
                </div>

                {uploadedFile && (
                  <div className="flex items-center justify-between border border-slate-200 rounded-md p-2.5 bg-slate-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-1 rounded ">
                        {uploadedFile.extension || "FILE"}
                      </div>
                      <div className="truncate text-xs">
                        <p className="font-semibold text-slate-800 truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {uploadedFile.size}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
