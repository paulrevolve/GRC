// import React, { useState, useMemo } from "react";
// import {
//   Upload,
//   X,
//   FileText,
//   ChevronRight,
//   CheckCircle2,
//   AlertCircle,
//   Calendar,
//   Tag,
//   FileCheck,
//   Shield,
//   Info,
//   ArrowRight,
//   ArrowLeft,
//   Building,
//   DollarSign,
//   Briefcase,
//   Layers,
//   Scale,
//   Award,
//   ShoppingCart,
//   FolderGit2,
//   HardDrive,
// } from "lucide-react";

// // ==========================================
// // 1. METADATA SCHEMAS FOR 12 DOCUMENT TYPES
// // ==========================================
// const DOCUMENT_TYPES_CONFIG = {
//   CONTRACT: {
//     id: "CONTRACT",
//     label: "1. Contract / Agreement",
//     icon: FileText,
//     workflow: "Contract Approval Workflow",
//     retentionPolicy: "CON-7Y - 7 Years Retention",
//     reviewFrequency: "Annually",
//     allowedFiles: ".pdf, .docx, .xlsx, .jpg, .png",
//     description:
//       "All contracts and agreements with customers, vendors, or partners.",
//     fields: [
//       {
//         name: "contractNumber",
//         label: "Contract Number",
//         type: "text",
//         required: true,
//         placeholder: "e.g., CNT-2024-00087",
//       },
//       {
//         name: "contractTitle",
//         label: "Contract Title",
//         type: "text",
//         required: true,
//         placeholder: "Title or Name of the contract",
//       },
//       {
//         name: "counterparty",
//         label: "Counterparty",
//         type: "text",
//         required: true,
//         placeholder: "Party (Customer/Vendor)",
//       },
//       {
//         name: "contractType",
//         label: "Contract Type",
//         type: "dropdown",
//         required: true,
//         options: ["Service", "License", "NDA", "SLA", "Master Agreement"],
//       },
//       {
//         name: "effectiveDate",
//         label: "Effective Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "expirationDate",
//         label: "Expiration Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "contractValue",
//         label: "Contract Value",
//         type: "currency",
//         required: false,
//       },
//       {
//         name: "currency",
//         label: "Currency",
//         type: "dropdown",
//         required: false,
//         options: ["USD", "EUR", "GBP", "INR", "CAD"],
//       },
//       {
//         name: "department",
//         label: "Department",
//         type: "dropdown",
//         required: false,
//         options: ["Information Technology", "Legal", "Finance", "HR", "Sales"],
//       },
//       {
//         name: "businessOwner",
//         label: "Business Owner",
//         type: "text",
//         required: false,
//         placeholder: "Contract owner",
//       },
//       {
//         name: "paymentTerms",
//         label: "Payment Terms",
//         type: "text",
//         required: false,
//         placeholder: "e.g., Net 30, Quarterly",
//       },
//       {
//         name: "renewalTerms",
//         label: "Renewal Terms",
//         type: "text",
//         required: false,
//         placeholder: "Renewal or notice period details",
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: false,
//         options: ["Public", "Internal", "Confidential", "Restricted"],
//       },
//       {
//         name: "governingLaw",
//         label: "Governing Law",
//         type: "text",
//         required: false,
//         placeholder: "Applicable governing law",
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Contract", "ERP", "Vendor", "High-Value", "Legal"],
//       },
//       {
//         name: "description",
//         label: "Description",
//         type: "textarea",
//         required: false,
//         placeholder: "Brief summary or notes",
//       },
//     ],
//   },
//   POLICY: {
//     id: "POLICY",
//     label: "2. Policy / Procedure",
//     icon: Shield,
//     workflow: "Policy Governance & Review",
//     retentionPolicy: "POL-5Y - 5 Years Retention",
//     reviewFrequency: "Annually",
//     allowedFiles: ".pdf, .docx",
//     description:
//       "Company policies, standard operating procedures, and governance guidelines.",
//     fields: [
//       {
//         name: "policyNumber",
//         label: "Policy Number",
//         type: "text",
//         required: true,
//         placeholder: "e.g., POL-IS-001",
//       },
//       {
//         name: "policyTitle",
//         label: "Policy Title",
//         type: "text",
//         required: true,
//         placeholder: "Title of the policy",
//       },
//       {
//         name: "department",
//         label: "Department",
//         type: "dropdown",
//         required: true,
//         options: ["IT", "HR", "Compliance", "Finance", "Operations"],
//       },
//       {
//         name: "policyOwner",
//         label: "Policy Owner",
//         type: "text",
//         required: true,
//         placeholder: "Policy owner name",
//       },
//       {
//         name: "effectiveDate",
//         label: "Effective Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "reviewDate",
//         label: "Review Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "version",
//         label: "Version",
//         type: "text",
//         required: true,
//         placeholder: "e.g., v1.0",
//       },
//       {
//         name: "approvedBy",
//         label: "Approved By",
//         type: "text",
//         required: false,
//         placeholder: "Approver name",
//       },
//       {
//         name: "approvalDate",
//         label: "Approval Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "policyType",
//         label: "Policy Type",
//         type: "dropdown",
//         required: true,
//         options: ["HR", "IT", "Finance", "Legal", "Security"],
//       },
//       {
//         name: "applicability",
//         label: "Applicability",
//         type: "text",
//         required: false,
//         placeholder: "Scope / Target Audience",
//       },
//       {
//         name: "relatedPolicy",
//         label: "Related Policy",
//         type: "text",
//         required: false,
//         placeholder: "Related policy numbers/links",
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Public", "Internal", "Confidential"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Policy", "Compliance", "SOP", "Mandatory"],
//       },
//     ],
//   },
//   INVOICE: {
//     id: "INVOICE",
//     label: "3. Invoice",
//     icon: DollarSign,
//     workflow: "Accounts Payable Verification",
//     retentionPolicy: "FIN-7Y - 7 Years Retention",
//     reviewFrequency: "None",
//     allowedFiles: ".pdf, .png, .jpg",
//     description: "Invoices, billing statements, and financial vouchers.",
//     fields: [
//       {
//         name: "invoiceNumber",
//         label: "Invoice Number",
//         type: "text",
//         required: true,
//         placeholder: "e.g., INV-99210",
//       },
//       {
//         name: "vendorName",
//         label: "Vendor Name",
//         type: "text",
//         required: true,
//         placeholder: "Vendor / Supplier Name",
//       },
//       {
//         name: "invoiceDate",
//         label: "Invoice Date",
//         type: "date",
//         required: true,
//       },
//       { name: "dueDate", label: "Due Date", type: "date", required: true },
//       {
//         name: "amount",
//         label: "Amount",
//         type: "decimal",
//         required: true,
//         placeholder: "0.00",
//       },
//       {
//         name: "currency",
//         label: "Currency",
//         type: "dropdown",
//         required: true,
//         options: ["USD", "EUR", "GBP", "INR"],
//       },
//       {
//         name: "taxAmount",
//         label: "Tax Amount",
//         type: "decimal",
//         required: false,
//         placeholder: "0.00",
//       },
//       {
//         name: "totalAmount",
//         label: "Total Amount",
//         type: "decimal",
//         required: true,
//         placeholder: "0.00",
//       },
//       {
//         name: "poNumber",
//         label: "PO Number",
//         type: "text",
//         required: false,
//         placeholder: "Purchase Order #",
//       },
//       {
//         name: "costCenter",
//         label: "Cost Center",
//         type: "dropdown",
//         required: false,
//         options: [
//           "CC-101 (Engineering)",
//           "CC-102 (Marketing)",
//           "CC-103 (Sales)",
//         ],
//       },
//       {
//         name: "glAccount",
//         label: "GL Account",
//         type: "text",
//         required: false,
//         placeholder: "General ledger account",
//       },
//       {
//         name: "department",
//         label: "Department",
//         type: "dropdown",
//         required: false,
//         options: ["Finance", "IT", "Operations"],
//       },
//       {
//         name: "paymentTerms",
//         label: "Payment Terms",
//         type: "text",
//         required: false,
//         placeholder: "Net 30 / Net 60",
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Invoice", "Paid", "Pending", "Tax"],
//       },
//     ],
//   },
//   HR_RECORD: {
//     id: "HR_RECORD",
//     label: "4. HR Record",
//     icon: Briefcase,
//     workflow: "HR Document Archival",
//     retentionPolicy: "HR-10Y - 10 Years Retention",
//     reviewFrequency: "Bi-Annually",
//     allowedFiles: ".pdf, .docx, .png",
//     description:
//       "Employee records, offer letters, reviews, and HR documentations.",
//     fields: [
//       {
//         name: "employeeId",
//         label: "Employee ID",
//         type: "text",
//         required: true,
//         placeholder: "e.g., EMP-4029",
//       },
//       {
//         name: "employeeName",
//         label: "Employee Name",
//         type: "text",
//         required: true,
//         placeholder: "Full Name",
//       },
//       {
//         name: "recordType",
//         label: "Record Type",
//         type: "dropdown",
//         required: true,
//         options: [
//           "Offer Letter",
//           "Appraisal",
//           "ID Proof",
//           "Contract",
//           "Training",
//         ],
//       },
//       {
//         name: "department",
//         label: "Department",
//         type: "dropdown",
//         required: true,
//         options: ["Engineering", "HR", "Sales", "Marketing"],
//       },
//       {
//         name: "designation",
//         label: "Designation",
//         type: "text",
//         required: false,
//         placeholder: "Job Title",
//       },
//       {
//         name: "recordDate",
//         label: "Record Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "effectiveDate",
//         label: "Effective Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "expirationDate",
//         label: "Expiration Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "location",
//         label: "Location",
//         type: "dropdown",
//         required: false,
//         options: ["New York", "London", "Remote", "Bangalore"],
//       },
//       {
//         name: "manager",
//         label: "Manager",
//         type: "text",
//         required: false,
//         placeholder: "Reporting Manager",
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Confidential", "Restricted"],
//       },
//       {
//         name: "notes",
//         label: "Notes",
//         type: "textarea",
//         required: false,
//         placeholder: "Additional Notes",
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["HR", "Personal", "Onboarding", "Review"],
//       },
//     ],
//   },
//   FINANCIAL: {
//     id: "FINANCIAL",
//     label: "5. Financial Document",
//     icon: Layers,
//     workflow: "Financial Governance Review",
//     retentionPolicy: "FIN-7Y - 7 Years Retention",
//     reviewFrequency: "Quarterly",
//     allowedFiles: ".pdf, .xlsx, .docx",
//     description:
//       "Budgets, balance sheets, financial reports, and tax statements.",
//     fields: [
//       {
//         name: "documentType",
//         label: "Document Type",
//         type: "dropdown",
//         required: true,
//         options: ["Budget", "Report", "Statement", "Audit", "Tax"],
//       },
//       {
//         name: "fiscalYear",
//         label: "Fiscal Year",
//         type: "text",
//         required: true,
//         placeholder: "e.g., FY2026",
//       },
//       {
//         name: "period",
//         label: "Period",
//         type: "text",
//         required: true,
//         placeholder: "Q1, Q2, Month, Year",
//       },
//       {
//         name: "entity",
//         label: "Entity",
//         type: "dropdown",
//         required: true,
//         options: ["HQ Corp", "US Subsidiary", "EU Branch", "APAC HQ"],
//       },
//       {
//         name: "department",
//         label: "Department",
//         type: "dropdown",
//         required: true,
//         options: ["Finance", "Accounting", "Executive"],
//       },
//       {
//         name: "amount",
//         label: "Amount",
//         type: "decimal",
//         required: false,
//         placeholder: "Total amount if applicable",
//       },
//       {
//         name: "currency",
//         label: "Currency",
//         type: "dropdown",
//         required: false,
//         options: ["USD", "EUR", "GBP"],
//       },
//       {
//         name: "preparedBy",
//         label: "Prepared By",
//         type: "text",
//         required: false,
//         placeholder: "Author name",
//       },
//       {
//         name: "approvedBy",
//         label: "Approved By",
//         type: "text",
//         required: false,
//         placeholder: "Approver name",
//       },
//       {
//         name: "approvalDate",
//         label: "Approval Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Confidential", "Restricted"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Finance", "Audit", "Tax", "Budget"],
//       },
//     ],
//   },
//   COMPLIANCE: {
//     id: "COMPLIANCE",
//     label: "6. Compliance Document",
//     icon: Award,
//     workflow: "Compliance Audit Workflow",
//     retentionPolicy: "CMP-10Y - 10 Years Retention",
//     reviewFrequency: "Annually",
//     allowedFiles: ".pdf, .docx",
//     description:
//       "Certifications, ISO/SOX documents, regulatory records, and disclosures.",
//     fields: [
//       {
//         name: "complianceType",
//         label: "Compliance Type",
//         type: "dropdown",
//         required: true,
//         options: ["ISO 27001", "GDPR", "SOX", "SOC2", "HIPAA"],
//       },
//       {
//         name: "regulation",
//         label: "Regulation",
//         type: "text",
//         required: true,
//         placeholder: "Standard or Regulation name",
//       },
//       {
//         name: "applicableRegion",
//         label: "Applicable Region",
//         type: "dropdown",
//         required: true,
//         options: ["Global", "US", "EU", "APAC"],
//       },
//       {
//         name: "complianceOwner",
//         label: "Compliance Owner",
//         type: "text",
//         required: true,
//         placeholder: "Owner name",
//       },
//       {
//         name: "effectiveDate",
//         label: "Effective Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "validUntil",
//         label: "Valid Until",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "status",
//         label: "Status",
//         type: "dropdown",
//         required: true,
//         options: ["Compliant", "Non-Compliant", "Under Review"],
//       },
//       {
//         name: "referenceNumber",
//         label: "Reference Number",
//         type: "text",
//         required: false,
//         placeholder: "Certificate / Ref #",
//       },
//       {
//         name: "issuedBy",
//         label: "Issued By",
//         type: "text",
//         required: false,
//         placeholder: "Issuing authority",
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Public", "Internal", "Confidential"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Audit", "Security", "Regulatory"],
//       },
//     ],
//   },
//   LEGAL: {
//     id: "LEGAL",
//     label: "7. Legal Document",
//     icon: Scale,
//     workflow: "Legal Approval Workflow",
//     retentionPolicy: "LGL-IND - Indefinite Retention",
//     reviewFrequency: "As Needed",
//     allowedFiles: ".pdf, .docx",
//     description:
//       "Litigation records, legal cases, court filings, and IP documentation.",
//     fields: [
//       {
//         name: "matterCaseName",
//         label: "Matter / Case Name",
//         type: "text",
//         required: true,
//         placeholder: "Case or Matter title",
//       },
//       {
//         name: "caseNumber",
//         label: "Case Number",
//         type: "text",
//         required: true,
//         placeholder: "Case Reference Number",
//       },
//       {
//         name: "documentType",
//         label: "Document Type",
//         type: "dropdown",
//         required: true,
//         options: ["Pleading", "Evidence", "Filing", "Brief", "Order"],
//       },
//       {
//         name: "courtAuthority",
//         label: "Court / Authority",
//         type: "text",
//         required: true,
//         placeholder: "Court or Jurisdiction name",
//       },
//       { name: "filedOn", label: "Filed On", type: "date", required: false },
//       {
//         name: "nextHearingDate",
//         label: "Next Hearing Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "lawyerAttorney",
//         label: "Lawyer / Attorney",
//         type: "text",
//         required: false,
//         placeholder: "Responsible Attorney",
//       },
//       {
//         name: "opposingParty",
//         label: "Opposing Party",
//         type: "text",
//         required: false,
//         placeholder: "Opposing entity",
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Confidential", "Restricted"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Legal", "Litigation", "IP", "Court"],
//       },
//     ],
//   },
//   IT_SYSTEM: {
//     id: "IT_SYSTEM",
//     label: "8. IT / System Document",
//     icon: HardDrive,
//     workflow: "IT System Governance",
//     retentionPolicy: "IT-3Y - 3 Years Retention",
//     reviewFrequency: "Semi-Annually",
//     allowedFiles: ".pdf, .docx, .txt, .json",
//     description:
//       "System architecture, API documentation, SOPs, and deployment guides.",
//     fields: [
//       {
//         name: "documentType",
//         label: "Document Type",
//         type: "dropdown",
//         required: true,
//         options: ["Architecture", "SOP", "Manual", "API Spec", "Runbook"],
//       },
//       {
//         name: "systemApplication",
//         label: "System / Application",
//         type: "text",
//         required: true,
//         placeholder: "Target System Name",
//       },
//       {
//         name: "environment",
//         label: "Environment",
//         type: "dropdown",
//         required: true,
//         options: ["Dev", "Test", "UAT", "Prod"],
//       },
//       {
//         name: "version",
//         label: "Version",
//         type: "text",
//         required: false,
//         placeholder: "e.g., v2.4.0",
//       },
//       {
//         name: "owner",
//         label: "Owner",
//         type: "text",
//         required: false,
//         placeholder: "System / Doc Owner",
//       },
//       {
//         name: "effectiveDate",
//         label: "Effective Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "reviewDate",
//         label: "Review Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Internal", "Confidential"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["IT", "DevOps", "Infrastructure", "Security"],
//       },
//     ],
//   },
//   MARKETING: {
//     id: "MARKETING",
//     label: "9. Marketing Document",
//     icon: Building,
//     workflow: "Brand & Content Review",
//     retentionPolicy: "MKT-2Y - 2 Years Retention",
//     reviewFrequency: "Quarterly",
//     allowedFiles: ".pdf, .png, .jpg, .pptx, .docx",
//     description:
//       "Campaign materials, brochures, presentations, and brand collateral.",
//     fields: [
//       {
//         name: "campaignName",
//         label: "Campaign Name",
//         type: "text",
//         required: true,
//         placeholder: "Marketing campaign title",
//       },
//       {
//         name: "documentType",
//         label: "Document Type",
//         type: "dropdown",
//         required: true,
//         options: ["Brochure", "Flyer", "Presentation", "Ad", "Press Release"],
//       },
//       {
//         name: "productService",
//         label: "Product / Service",
//         type: "text",
//         required: true,
//         placeholder: "Related Product",
//       },
//       {
//         name: "targetAudience",
//         label: "Target Audience",
//         type: "text",
//         required: false,
//         placeholder: "Target demographic/segment",
//       },
//       {
//         name: "createdBy",
//         label: "Created By",
//         type: "text",
//         required: true,
//         placeholder: "Creator name",
//       },
//       {
//         name: "createdDate",
//         label: "Created Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "effectiveDate",
//         label: "Effective Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "expiryDate",
//         label: "Expiry Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Public", "Internal"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Campaign", "Brand", "2026", "Digital"],
//       },
//     ],
//   },
//   PURCHASE_ORDER: {
//     id: "PURCHASE_ORDER",
//     label: "10. Purchase Order",
//     icon: ShoppingCart,
//     workflow: "Procurement Approval Workflow",
//     retentionPolicy: "PO-7Y - 7 Years Retention",
//     reviewFrequency: "None",
//     allowedFiles: ".pdf, .xlsx",
//     description:
//       "Issued purchase orders, procurement requisitions, and vendor POs.",
//     fields: [
//       {
//         name: "poNumber",
//         label: "PO Number",
//         type: "text",
//         required: true,
//         placeholder: "e.g., PO-88391",
//       },
//       {
//         name: "vendor",
//         label: "Vendor",
//         type: "text",
//         required: true,
//         placeholder: "Vendor Name",
//       },
//       { name: "poDate", label: "PO Date", type: "date", required: true },
//       {
//         name: "amount",
//         label: "Amount",
//         type: "decimal",
//         required: true,
//         placeholder: "0.00",
//       },
//       {
//         name: "currency",
//         label: "Currency",
//         type: "dropdown",
//         required: true,
//         options: ["USD", "EUR", "GBP"],
//       },
//       {
//         name: "deliveryDate",
//         label: "Delivery Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "department",
//         label: "Department",
//         type: "dropdown",
//         required: true,
//         options: ["Procurement", "IT", "Operations"],
//       },
//       {
//         name: "requestedBy",
//         label: "Requested By",
//         type: "text",
//         required: false,
//         placeholder: "Requester Name",
//       },
//       {
//         name: "status",
//         label: "Status",
//         type: "dropdown",
//         required: false,
//         options: ["Draft", "Approved", "Closed", "Cancelled"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Procurement", "Hardware", "Software", "Vendor"],
//       },
//     ],
//   },
//   PROJECT: {
//     id: "PROJECT",
//     label: "11. Project Document",
//     icon: FolderGit2,
//     workflow: "Project Governance Review",
//     retentionPolicy: "PRJ-5Y - 5 Years Retention",
//     reviewFrequency: "Quarterly",
//     allowedFiles: ".pdf, .docx, .pptx, .xlsx",
//     description: "Project charters, design specifications, plans, and reports.",
//     fields: [
//       {
//         name: "projectName",
//         label: "Project Name",
//         type: "text",
//         required: true,
//         placeholder: "Name of the project",
//       },
//       {
//         name: "projectCode",
//         label: "Project Code",
//         type: "text",
//         required: true,
//         placeholder: "e.g., PRJ-FIN-01",
//       },
//       {
//         name: "documentType",
//         label: "Document Type",
//         type: "dropdown",
//         required: true,
//         options: ["Plan", "Report", "Design", "Charter", "Minutes"],
//       },
//       {
//         name: "phase",
//         label: "Phase",
//         type: "dropdown",
//         required: false,
//         options: ["Initiation", "Planning", "Execution", "Closing"],
//       },
//       {
//         name: "owner",
//         label: "Owner",
//         type: "text",
//         required: true,
//         placeholder: "Project Lead / Owner",
//       },
//       {
//         name: "version",
//         label: "Version",
//         type: "text",
//         required: false,
//         placeholder: "v1.0",
//       },
//       { name: "issueDate", label: "Issue Date", type: "date", required: false },
//       {
//         name: "reviewDate",
//         label: "Review Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Internal", "Confidential"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["Project", "Milestone", "Spec"],
//       },
//     ],
//   },
//   GENERAL: {
//     id: "GENERAL",
//     label: "12. General Document",
//     icon: FileCheck,
//     workflow: "Standard Archive Workflow",
//     retentionPolicy: "GEN-3Y - 3 Years Retention",
//     reviewFrequency: "Annually",
//     allowedFiles: ".pdf, .docx, .txt, .png, .jpg",
//     description:
//       "General documentation, memos, and miscellaneous enterprise files.",
//     fields: [
//       {
//         name: "documentTitle",
//         label: "Document Title",
//         type: "text",
//         required: true,
//         placeholder: "Title of the document",
//       },
//       {
//         name: "category",
//         label: "Category",
//         type: "dropdown",
//         required: true,
//         options: ["Memo", "Notes", "General", "Reference"],
//       },
//       {
//         name: "department",
//         label: "Department",
//         type: "dropdown",
//         required: true,
//         options: ["General", "Operations", "Admin"],
//       },
//       {
//         name: "owner",
//         label: "Owner",
//         type: "text",
//         required: true,
//         placeholder: "Document Owner",
//       },
//       {
//         name: "createdDate",
//         label: "Created Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "reviewDate",
//         label: "Review Date",
//         type: "date",
//         required: false,
//       },
//       {
//         name: "confidentialityLevel",
//         label: "Confidentiality Level",
//         type: "dropdown",
//         required: true,
//         options: ["Public", "Internal", "Confidential"],
//       },
//       {
//         name: "tags",
//         label: "Tags",
//         type: "multiselect",
//         required: false,
//         options: ["General", "Enterprise"],
//       },
//       {
//         name: "description",
//         label: "Description",
//         type: "textarea",
//         required: false,
//         placeholder: "Brief details",
//       },
//     ],
//   },
// };

// // ==========================================
// // MAIN UPLOAD COMPONENT
// // ==========================================
// export default function UploadDocumentView() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedTypeKey, setSelectedTypeKey] = useState("CONTRACT");
//   const [formData, setFormData] = useState({
//     currency: "USD",
//     tags: ["Contract", "ERP"],
//   });
//   const [uploadedFile, setUploadedFile] = useState({
//     name: "Master_Service_Agreement.pdf",
//     size: "1.24 MB",
//   });

//   const activeConfig = useMemo(() => {
//     return (
//       DOCUMENT_TYPES_CONFIG[selectedTypeKey] || DOCUMENT_TYPES_CONFIG.CONTRACT
//     );
//   }, [selectedTypeKey]);

//   // Handle Type Selector Change
//   const handleTypeChange = (e) => {
//     const key = e.target.value;
//     setSelectedTypeKey(key);
//     // Reset/Re-initialize form data according to default fields
//     setFormData({ currency: "USD", tags: [] });
//   };

//   // Form Field Updates
//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   // Check validation state
//   const isMetadataValid = useMemo(() => {
//     return activeConfig.fields
//       .filter((f) => f.required)
//       .every(
//         (f) => formData[f.name] && formData[f.name].toString().trim() !== "",
//       );
//   }, [activeConfig, formData]);

//   return (
//     <div className="flex h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
//         {/* Top Header */}
//         <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">
//               Upload New Document
//             </h1>
//             <p className="text-xs text-slate-500 mt-0.5">
//               Create a new document and upload file into Governance System
//             </p>
//           </div>
//         </div>

//         {/* Wizard Container */}
//         <div className="mx-auto w-full space-y-6">
//           {/* Progress Tracker */}
//           <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between px-12">
//             <StepBadge
//               step={1}
//               title="Document Type"
//               active={currentStep === 1}
//               completed={currentStep > 1}
//             />
//             <StepDivider />
//             <StepBadge
//               step={2}
//               title="Metadata"
//               active={currentStep === 2}
//               completed={currentStep > 2}
//             />
//             <StepDivider />
//             <StepBadge
//               step={3}
//               title="File Upload"
//               active={currentStep === 3}
//               completed={currentStep > 3}
//             />
//             <StepDivider />
//             <StepBadge
//               step={4}
//               title="Review & Submit"
//               active={currentStep === 4}
//               completed={currentStep > 4}
//             />
//           </div>

//           {/* Grid Layout: Main Form Area + Right Side Panel */}
//           <div className="grid grid-cols-12 gap-6">
//             {/* Left Main Section (Dynamic Metadata Form) */}
//             <div className="col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
//               {/* Document Type Selector */}
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
//                   Select Document Type
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={selectedTypeKey}
//                     onChange={handleTypeChange}
//                     className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                   >
//                     {Object.keys(DOCUMENT_TYPES_CONFIG).map((key) => (
//                       <option key={key} value={key}>
//                         {DOCUMENT_TYPES_CONFIG[key].label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Form Header */}
//               <div className="border-b border-slate-200 pb-2">
//                 <h3 className="text-sm font-bold text-slate-800">
//                   Enter Document Metadata
//                 </h3>
//                 <p className="text-xs text-slate-500">
//                   Required fields are marked with an asterisk (
//                   <span className="text-red-500">*</span>)
//                 </p>
//               </div>

//               {/* Dynamic Metadata Fields Grid */}
//               <div className="grid grid-cols-2 gap-4">
//                 {activeConfig.fields.map((field) => (
//                   <div
//                     key={field.name}
//                     className={
//                       field.type === "textarea" ? "col-span-2" : "col-span-1"
//                     }
//                   >
//                     <label className="block text-xs font-semibold text-slate-700 mb-1">
//                       {field.label}{" "}
//                       {field.required && (
//                         <span className="text-red-500">*</span>
//                       )}
//                     </label>

//                     {/* TEXT FIELD */}
//                     {field.type === "text" && (
//                       <input
//                         type="text"
//                         placeholder={field.placeholder}
//                         value={formData[field.name] || ""}
//                         onChange={(e) =>
//                           handleInputChange(field.name, e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                       />
//                     )}

//                     {/* DATE FIELD */}
//                     {field.type === "date" && (
//                       <div className="relative">
//                         <input
//                           type="date"
//                           value={formData[field.name] || ""}
//                           onChange={(e) =>
//                             handleInputChange(field.name, e.target.value)
//                           }
//                           className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
//                         />
//                       </div>
//                     )}

//                     {/* DROPDOWN FIELD */}
//                     {field.type === "dropdown" && (
//                       <select
//                         value={formData[field.name] || ""}
//                         onChange={(e) =>
//                           handleInputChange(field.name, e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                       >
//                         <option value="">Select {field.label}</option>
//                         {field.options?.map((opt) => (
//                           <option key={opt} value={opt}>
//                             {opt}
//                           </option>
//                         ))}
//                       </select>
//                     )}

//                     {/* CURRENCY / DECIMAL COMBO */}
//                     {field.type === "currency" && (
//                       <div className="flex gap-2">
//                         <select
//                           value={formData.currency || "USD"}
//                           onChange={(e) =>
//                             handleInputChange("currency", e.target.value)
//                           }
//                           className="w-24 border border-slate-300 rounded-md px-2 py-2 text-xs bg-white focus:outline-none"
//                         >
//                           <option value="USD">USD</option>
//                           <option value="EUR">EUR</option>
//                           <option value="GBP">GBP</option>
//                           <option value="INR">INR</option>
//                         </select>
//                         <input
//                           type="number"
//                           placeholder="0.00"
//                           value={formData[field.name] || ""}
//                           onChange={(e) =>
//                             handleInputChange(field.name, e.target.value)
//                           }
//                           className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                         />
//                       </div>
//                     )}

//                     {/* DECIMAL / NUMBER FIELD */}
//                     {field.type === "decimal" && (
//                       <input
//                         type="number"
//                         placeholder={field.placeholder || "0.00"}
//                         value={formData[field.name] || ""}
//                         onChange={(e) =>
//                           handleInputChange(field.name, e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                       />
//                     )}

//                     {/* MULTISELECT / TAGS FIELD */}
//                     {field.type === "multiselect" && (
//                       <div className="border border-slate-300 rounded-md p-1.5 flex flex-wrap items-center gap-1.5 bg-white min-h-[34px]">
//                         {(formData.tags || []).map((tag) => (
//                           <span
//                             key={tag}
//                             className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 border border-blue-200"
//                           >
//                             {tag}
//                             <X
//                               size={12}
//                               className="cursor-pointer hover:text-blue-900"
//                               onClick={() =>
//                                 handleInputChange(
//                                   "tags",
//                                   formData.tags.filter((t) => t !== tag),
//                                 )
//                               }
//                             />
//                           </span>
//                         ))}
//                         <input
//                           type="text"
//                           placeholder="Add tags..."
//                           className="flex-1 text-xs outline-none px-1 bg-transparent"
//                           onKeyDown={(e) => {
//                             if (e.key === "Enter" && e.target.value.trim()) {
//                               handleInputChange("tags", [
//                                 ...(formData.tags || []),
//                                 e.target.value.trim(),
//                               ]);
//                               e.target.value = "";
//                             }
//                           }}
//                         />
//                       </div>
//                     )}

//                     {/* TEXTAREA FIELD */}
//                     {field.type === "textarea" && (
//                       <textarea
//                         rows={3}
//                         placeholder={field.placeholder}
//                         value={formData[field.name] || ""}
//                         onChange={(e) =>
//                           handleInputChange(field.name, e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
//                       />
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
//                 <button
//                   type="button"
//                   className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setCurrentStep((prev) => Math.min(prev + 1, 4))
//                   }
//                   className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
//                 >
//                   Next: File Upload <ArrowRight size={14} />
//                 </button>
//               </div>
//             </div>

//             {/* Right Side Panel (Contextual System Information & File Drop zone) */}
//             <div className="col-span-4 space-y-6">
//               {/* Type Metadata Rule Context */}
//               <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
//                 <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
//                   <activeConfig.icon className="h-5 w-5 text-blue-600" />
//                   <span>Document Type Information</span>
//                 </div>

//                 <div className="space-y-2 text-xs divide-y divide-slate-200/60 pt-1">
//                   <ContextRow
//                     label="Document Type"
//                     value={activeConfig.label.split(". ")[1]}
//                   />
//                   <ContextRow label="Workflow" value={activeConfig.workflow} />
//                   <ContextRow
//                     label="Retention Policy"
//                     value={activeConfig.retentionPolicy}
//                   />
//                   <ContextRow
//                     label="Default Review"
//                     value={activeConfig.reviewFrequency}
//                   />
//                   <ContextRow
//                     label="Allowed File Types"
//                     value={activeConfig.allowedFiles}
//                   />
//                   <ContextRow label="Max File Size" value="50 MB" />
//                 </div>

//                 <div className="pt-2 text-xs text-slate-500 border-t border-slate-200">
//                   <p className="font-semibold text-slate-700 mb-0.5">
//                     Description
//                   </p>
//                   <p>{activeConfig.description}</p>
//                 </div>
//               </div>

//               {/* File Upload Box */}
//               <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
//                 <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
//                   File Upload
//                 </h4>

//                 {/* Drag and Drop Zone */}
//                 <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer space-y-2">
//                   <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
//                     <Upload size={20} />
//                   </div>
//                   <div className="text-xs">
//                     <p className="font-semibold text-slate-800">
//                       Drag & drop file here or{" "}
//                       <span className="text-blue-600 underline">
//                         click to browse
//                       </span>
//                     </p>
//                     <p className="text-[11px] text-slate-400 mt-1">
//                       Maximum file size: 50 MB
//                     </p>
//                     <p className="text-[10px] text-slate-400">
//                       Allowed types: {activeConfig.allowedFiles}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Selected File Card */}
//                 {uploadedFile && (
//                   <div className="space-y-1.5">
//                     <p className="text-[11px] font-semibold text-slate-600">
//                       Selected File
//                     </p>
//                     <div className="flex items-center justify-between border border-slate-200 rounded-md p-2.5 bg-slate-50">
//                       <div className="flex items-center gap-2.5 min-w-0">
//                         <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-1 rounded">
//                           PDF
//                         </div>
//                         <div className="truncate text-xs">
//                           <p className="font-semibold text-slate-800 truncate">
//                             {uploadedFile.name}
//                           </p>
//                           <p className="text-[10px] text-slate-400">
//                             {uploadedFile.size}
//                           </p>
//                         </div>
//                       </div>
//                       <button className="text-slate-400 hover:text-slate-600">
//                         <X size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Validation Readiness Card */}
//               <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 space-y-2">
//                 <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
//                   <Info size={16} />
//                   <span>Required Fields</span>
//                 </div>
//                 <p className="text-[11px] text-amber-700">
//                   Please fill all mandatory fields (
//                   <span className="text-red-500">*</span>) to proceed.
//                 </p>

//                 <div className="space-y-1 pt-1 text-xs">
//                   <StatusCheck label="Document Type Selected" checked={true} />
//                   <StatusCheck
//                     label="All Required Metadata Entered"
//                     checked={isMetadataValid}
//                   />
//                   <StatusCheck label="File Uploaded" checked={!!uploadedFile} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ==========================================
// // REUSABLE HELPER COMPONENTS
// // ==========================================

// function StepBadge({ step, title, active, completed }) {
//   return (
//     <div className="flex items-center gap-2">
//       <div
//         className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
//           completed
//             ? "bg-emerald-500 text-white"
//             : active
//               ? "bg-blue-600 text-white shadow"
//               : "bg-slate-200 text-slate-500"
//         }`}
//       >
//         {completed ? "✓" : step}
//       </div>
//       <span
//         className={`text-xs font-semibold ${active ? "text-blue-600" : "text-slate-600"}`}
//       >
//         {title}
//       </span>
//     </div>
//   );
// }

// function StepDivider() {
//   return <div className="h-px bg-slate-200 w-12" />;
// }

// function ContextRow({ label, value }) {
//   return (
//     <div className="flex justify-between py-1">
//       <span className="text-slate-500 font-medium">{label}</span>
//       <span className="text-slate-800 font-semibold text-right">{value}</span>
//     </div>
//   );
// }

// function StatusCheck({ label, checked }) {
//   return (
//     <div className="flex items-center gap-2">
//       <CheckCircle2
//         size={14}
//         className={
//           checked ? "text-emerald-600 fill-emerald-100" : "text-slate-300"
//         }
//       />
//       <span
//         className={`text-[11px] ${checked ? "text-slate-700 font-medium" : "text-slate-400"}`}
//       >
//         {label}
//       </span>
//     </div>
//   );
// }

import React, { useState, useMemo, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  Shield,
  Info,
  ArrowRight,
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
} from "lucide-react";

// ==========================================
// METADATA SCHEMAS FOR DOCUMENT TYPES
// ==========================================
const DOCUMENT_TYPES_CONFIG = {
  CONTRACT: {
    id: "CONTRACT",
    label: "1. Contract / Agreement",
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
        options: ["USD", "EUR", "GBP", "INR", "CAD"],
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
    label: "2. Policy / Procedure",
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
    label: "3. Invoice",
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
        options: ["USD", "EUR", "GBP", "INR"],
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
        options: ["New York", "London", "Remote", "Bangalore"],
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
        options: ["USD", "EUR", "GBP"],
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
        options: ["Global", "US", "EU", "APAC"],
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
        options: ["USD", "EUR", "GBP"],
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

// Utility function to format raw byte values into human-readable strings
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ==========================================
// UPLOAD DOCUMENT VIEW COMPONENT
// ==========================================
export function UploadDocumentView({ onCancel, onSubmitSuccess }) {
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedTypeKey, setSelectedTypeKey] = useState("CONTRACT");
  const [formData, setFormData] = useState({
    currency: "USD",
    tags: ["Contract", "ERP"],
  });

  // File state & drag state hooks
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const activeConfig = useMemo(() => {
    return (
      DOCUMENT_TYPES_CONFIG[selectedTypeKey] || DOCUMENT_TYPES_CONFIG.CONTRACT
    );
  }, [selectedTypeKey]);

  const handleTypeChange = (e) => {
    const key = e.target.value;
    setSelectedTypeKey(key);
    setFormData({ currency: "USD", tags: [] });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Process File selection
  const processSelectedFile = (file) => {
    if (!file) return;

    // Optional extension check against schema configuration
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
      size: formatFileSize(file.size),
      extension: fileExtension.replace(".", "").toUpperCase(),
    });
  };

  // Event handlers for file input and drag and drop
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processSelectedFile(file);
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

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert("Please attach a document before submitting.");
      return;
    }
    alert("Document Saved & Uploaded!");
    if (onSubmitSuccess) onSubmitSuccess();
  };

  return (
    <div className="flex bg-slate-100 text-slate-800 font-sans min-h-screen">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Nav Action */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Upload New Document
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new document entry in the Governance System
            </p>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Documents
          </button>
        </div>

        {/* Form Container */}
        <div className="mx-auto w-full space-y-6">
          {/* Progress Step Indicator */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between px-12">
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
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Main Metadata Section */}
            <div className="col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
              {/* Type Selection Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Document Type
                </label>
                <select
                  value={selectedTypeKey}
                  onChange={handleTypeChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {Object.keys(DOCUMENT_TYPES_CONFIG).map((key) => (
                    <option key={key} value={key}>
                      {DOCUMENT_TYPES_CONFIG[key].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Form Schema Rendering */}
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

                    {/* Text Field */}
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

                    {/* Date Field */}
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

                    {/* Dropdown Field */}
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

                    {/* Currency Field */}
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

                    {/* Decimal Field */}
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

                    {/* Multiselect / Tags */}
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

                    {/* Textarea Field */}
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

              {/* Action Buttons */}
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  Submit & Save Document
                </button>
              </div>
            </div>

            {/* Sidebar Details Panel */}
            <div className="col-span-4 space-y-6">
              {/* Type Metadata Rules Context */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <activeConfig.icon className="h-5 w-5 text-blue-600" />
                  <span>Document Type Context</span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-200/60 pt-1">
                  <ContextRow label="Workflow" value={activeConfig.workflow} />
                  <ContextRow
                    label="Retention"
                    value={activeConfig.retentionPolicy}
                  />
                  <ContextRow
                    label="Review Freq."
                    value={activeConfig.reviewFrequency}
                  />
                  <ContextRow
                    label="Allowed Files"
                    value={activeConfig.allowedFiles}
                  />
                </div>
              </div>

              {/* File Attachment Dropzone & Status */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  File Attachment
                </h4>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={activeConfig.allowedFiles}
                  className="hidden"
                />

                {/* Drop Area with Click and Drag Handlers */}
                <div
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center space-y-2 cursor-pointer transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-100/60"
                      : "border-blue-200 bg-blue-50/40 hover:border-blue-400"
                  }`}
                >
                  <Upload size={20} className="mx-auto text-blue-600" />
                  <p className="text-xs font-semibold text-slate-800">
                    Drag & drop file or click to browse
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Accepts: {activeConfig.allowedFiles}
                  </p>
                </div>

                {/* File Attachment Preview Card */}
                {uploadedFile && (
                  <div className="flex items-center justify-between border border-slate-200 rounded-md p-2.5 bg-slate-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-1 rounded uppercase">
                        {uploadedFile.extension || "FILE"}
                      </div>
                      <div className="truncate text-xs">
                        <p className="font-semibold text-slate-800 truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {uploadedFile.size}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Form Validation Readiness */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                  <Info size={16} />
                  <span>Validation Check</span>
                </div>
                <div className="space-y-1 pt-1 text-xs">
                  <StatusCheck label="Document Type Selected" checked={true} />
                  <StatusCheck
                    label="All Required Fields Populated"
                    checked={isMetadataValid}
                  />
                  <StatusCheck label="File Attached" checked={!!uploadedFile} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Subcomponents
function StepBadge({ step, title, active, completed }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
          completed
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-blue-600 text-white shadow"
              : "bg-slate-200 text-slate-500"
        }`}
      >
        {completed ? "✓" : step}
      </div>
      <span
        className={`text-xs font-semibold ${active ? "text-blue-600" : "text-slate-600"}`}
      >
        {title}
      </span>
    </div>
  );
}

function StepDivider() {
  return <div className="h-px bg-slate-200 w-12" />;
}

function ContextRow({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-800 font-semibold text-right">{value}</span>
    </div>
  );
}

function StatusCheck({ label, checked }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        size={14}
        className={
          checked ? "text-emerald-600 fill-emerald-100" : "text-slate-300"
        }
      />
      <span
        className={`text-[11px] ${checked ? "text-slate-700 font-medium" : "text-slate-400"}`}
      >
        {label}
      </span>
    </div>
  );
}
