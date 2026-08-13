import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import {
  Menu,
  X,
  Plus,
  Minus,
  PieChart,
  BarChart2,
  BarChart3,
  Settings2,
  ChevronDown,
  ChevronRight,
  Folder,
  BuildingIcon,
  LayoutDashboard,
  FileText,
  CheckSquare,
  GitMerge,
  Eye,
  CheckCircle2,
  Shield,
  Clock,
  Scale,
  History,
  Bot,
} from "lucide-react";
import { backendUrl } from "./config";

const NavigationSidebar = ({
  setIsHovered,
  isHovered,
  setIsSidebarOpen,
  isSidebarOpen,
  biReports: biReportsProp,
  visibility: visibilityProp,
  canView: canViewProp,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // 1. Fallback to Outlet Context if props are not directly passed
  const outletContext = useOutletContext() || {};
  const biReports = biReportsProp || outletContext.biReports || [];
  const visibility = visibilityProp || outletContext.visibility || {};
  const canView = canViewProp || outletContext.canView;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const [apiGroups, setApiGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Accordion toggle states
  const [generalMenuOpen, setGeneralMenuOpen] = useState(true);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [biReportingOpen, setBiReportingOpen] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(false);

  // Group level accordion toggles
  const [openGroupIds, setOpenGroupIds] = useState({});
  const [selectedPage, setSelectedPage] = useState(pathname);

  // Synchronize active page highlight when pathname changes
  useEffect(() => {
    setSelectedPage(pathname);
  }, [pathname]);

  /* ====================================================================
   * FETCH: Fetch Report Groups Specifically for Navigation Sidebar
   * ==================================================================== */
  useEffect(() => {
    let isMounted = true;

    const fetchReportGroups = async () => {
      setLoading(true);

      const userString = localStorage.getItem("currentUser");
      if (userString) {
        try {
          const userObj = JSON.parse(userString);
          const role = userObj.role ? userObj.role.toLowerCase() : null;
          if (isMounted) setCurrentUserRole(role);
        } catch (err) {
          console.error("Failed to parse user data from localStorage", err);
        }
      }

      try {
        const groupsRes = await axios.get(`${backendUrl}/api/ReportGroups`);

        if (isMounted) {
          const rawGroupsData = Array.isArray(groupsRes.data)
            ? groupsRes.data
            : [];
          setApiGroups(rawGroupsData);
        }
      } catch (error) {
        console.error("Error fetching navigation report groups:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReportGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAdmin = currentUserRole?.toUpperCase() === "ADMIN";

  const checkAccess = useCallback(
    (screenId, alternateKey) => {
      const screensMap = visibility?.screens || visibility;

      const screenConfig =
        screensMap?.[screenId] ??
        (alternateKey ? screensMap?.[alternateKey] : undefined);

      const hasInJson = screenConfig !== undefined;
      const jsonResult = screenConfig?.view;

      let canViewResult;
      if (typeof canView === "function") {
        canViewResult = canView(screenId);
        if (canViewResult === undefined && alternateKey) {
          canViewResult = canView(alternateKey);
        }
      }

      if (!hasInJson && canViewResult === undefined) {
        return false;
      }

      if (typeof jsonResult === "boolean") {
        return jsonResult;
      }

      return canViewResult === true;
    },
    [canView, visibility],
  );

  /* ====================================================================
   * FILTER: Match Groups with BI Reports and Permission Checks
   * ==================================================================== */
  const activeGroupsWithReports = useMemo(() => {
    if (!apiGroups.length || !biReports.length) return [];

    const reportIdMap = new Map();
    biReports.forEach((rep) => {
      if (rep.id) reportIdMap.set(String(rep.id), rep);
    });

    const screensMap = visibility?.screens || visibility;

    return apiGroups
      .map((grp) => {
        const rawGroupReports = Array.isArray(grp.reports)
          ? grp.reports
          : grp.reportIds || [];

        const groupReportIds = rawGroupReports.map((item) => {
          if (typeof item === "object" && item !== null) {
            return String(item.id || item.reportId || "");
          }
          return String(item);
        });

        const matchedReports = groupReportIds
          .filter((reportId) => {
            if (!reportId) return false;

            if (typeof canView === "function") {
              return canView(reportId) === true;
            }

            return screensMap?.[reportId]?.view === true;
          })
          .map((reportId) => reportIdMap.get(reportId))
          .filter(Boolean);

        return {
          id: grp.id,
          name: grp.name,
          reports: matchedReports,
        };
      })
      .filter((grp) => grp.reports.length > 0);
  }, [apiGroups, biReports, visibility, canView]);

  const totalReportCount = useMemo(() => {
    return activeGroupsWithReports.reduce(
      (acc, grp) => acc + grp.reports.length,
      0,
    );
  }, [activeGroupsWithReports]);

  /* ====================================================================
   * PERMISSION CHECKS
   * ==================================================================== */
  const canViewDashboard = checkAccess("Dashboard", "dashboard");
  const canViewDocuments = checkAccess("Documents", "documents");
  const canViewTasks = checkAccess("My_Tasks", "tasks");
  const canViewWorkflows = checkAccess("Workflows", "workflows");
  const canViewReviews = checkAccess("Reviews", "reviews");
  const canViewApprovals = checkAccess("Approvals", "approvals");
  const canViewReports = checkAccess("Reports", "reports");

  const canViewRetention = checkAccess("Retention", "retention");
  const canViewLegalHold = checkAccess("Legal_Hold", "legal_hold");

  const canViewAddBudget = checkAccess("Add_Budget");
  const canViewEditBudget = checkAccess("E_V_Budget");
  const canViewBulkBudget = checkAccess("Bulk_Budgeting");

  const canViewExpenseBudget = checkAccess("Expense_Budgeting");
  const canViewQuickBudget = checkAccess("Quick_Budgeting");

  const canViewAccessMgmt = checkAccess("Access_Management");
  const canViewCreateUser = checkAccess("Create_User");
  const canViewAssumption = checkAccess("Manage_Assumption");
  const canViewAuditTrail = checkAccess("Audit_Trail", "audit_trail");

  const hasAnyBudgetAccess =
    canViewAddBudget || canViewEditBudget || canViewBulkBudget;
  const hasAnyExpenseAccess = canViewExpenseBudget || canViewQuickBudget;
  const hasAnySettingsAccess =
    canViewAccessMgmt ||
    canViewCreateUser ||
    canViewAssumption ||
    canViewAuditTrail;

  // Expanded State Logic (Hover or Click)
  const isExpanded = isSidebarOpen || isHovered;
  const appVersion = import.meta.env.VITE_APP_VERSION || "N/A";

  const handleLinkClick = (pagePath) => {
    setSelectedPage(pagePath);
    navigate(pagePath);
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const toggleGroupAccordion = (groupId) => {
    setOpenGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div className="flex min-h-screen font-inter">
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-gray-800 p-1 rounded-md"
        onClick={() => setIsSidebarOpen(!isExpanded)}
      >
        {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Container with Locked Hover Logic */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-40 flex flex-col
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out shadow-sm
          ${isExpanded ? "translate-x-0 w-56" : "-translate-x-full w-14"}
          md:translate-x-0
        `}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4">
          <div
            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => setGeneralMenuOpen(!generalMenuOpen)}
          >
            <div className="w-8 flex justify-center">
              {generalMenuOpen ? <Minus size={16} /> : <Plus size={16} />}
            </div>
            <span
              className={`ml-2 text-sm font-semibold transition-opacity duration-200 ${
                isExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              Menu
            </span>
          </div>

          {generalMenuOpen && (
            <div className="space-y-1 mt-2">
              {/* Search Bar */}
              <div
                className={`px-3 pt-2 pb-2 ${isExpanded ? "block" : "hidden"}`}
              >
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                  className="border border-gray-300 rounded px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#17414d] w-full bg-white shadow-inner"
                />
              </div>

              {/* Revenue Budgeting Section */}
              {/* {hasAnyBudgetAccess && ( */}
              <div>
                {!searchTerm && (
                  <div
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 group"
                    onClick={() => setPlanningOpen(!planningOpen)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 flex justify-center">
                        <BarChart2 className="w-5 h-5 text-gray-600 group-hover:text-[#17414d]" />
                      </div>
                      <span
                        className={`ml-2 text-xs font-bold tracking-wider text-gray-600 transition-opacity duration-200 ${
                          isExpanded ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Governance
                      </span>
                    </div>
                    {isExpanded &&
                      (planningOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      ))}
                  </div>
                )}

                {(planningOpen || searchTerm) && isExpanded && (
                  <div className="ml-10 space-y-1 border-l border-gray-100 pl-2">
                    {/* {canViewAddBudget && ( */}
                    <NavItem
                      label="Documnet"
                      path="/dashboard/documents-details"
                      selected={selectedPage}
                      onClick={handleLinkClick}
                      searchTerm={searchTerm}
                      isExpanded={isExpanded}
                    />
                    {/* )} */}
                    {/* {canViewEditBudget && ( */}
                    <NavItem
                      label="Upload Document"
                      path="/dashboard/upload-documents"
                      selected={selectedPage}
                      onClick={handleLinkClick}
                      searchTerm={searchTerm}
                      isExpanded={isExpanded}
                    />
                    {/* )} */}
                  </div>
                )}
              </div>
              {/* )} */}
              {/* Admin & System Settings Section */}
              {/* {hasAnySettingsAccess && ( */}
              <div>
                {!searchTerm && (
                  <div
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 group"
                    onClick={() => setSettingsOpen(!settingsOpen)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 flex justify-center">
                        <Settings2 className="w-5 h-5 text-gray-600 group-hover:text-[#17414d]" />
                      </div>
                      <span
                        className={`ml-2 text-xs font-bold tracking-wider text-gray-600 transition-opacity duration-200 ${
                          isExpanded ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Settings
                      </span>
                    </div>
                    {isExpanded &&
                      (settingsOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      ))}
                  </div>
                )}
                {(settingsOpen || searchTerm) && isExpanded && (
                  <div className="ml-10 space-y-1 border-l border-gray-100 pl-2">
                    {/* {canViewCreateUser && ( */}
                    <NavItem
                      label="Manage Users"
                      path="/dashboard/create-user"
                      selected={selectedPage}
                      onClick={handleLinkClick}
                      searchTerm={searchTerm}
                      isExpanded={isExpanded}
                    />
                    {/* )} */}
                    {/* {canViewAccessMgmt && (
                        <NavItem
                          label="Access Management"
                          path="/dashboard/manage-users"
                          selected={selectedPage}
                          onClick={handleLinkClick}
                          searchTerm={searchTerm}
                          isExpanded={isExpanded}
                        />
                      )}
                      {canViewAssumption && (
                        <NavItem
                          label="Manage Assumptions"
                          path="/dashboard/manage-assumptions"
                          selected={selectedPage}
                          onClick={handleLinkClick}
                          searchTerm={searchTerm}
                          isExpanded={isExpanded}
                        />
                      )} */}
                    {/* {canViewAuditTrail && (
                        <NavItem
                          icon={<History size={16} />}
                          label="Audit Trail"
                          path="/dashboard/audit-trail"
                          selected={selectedPage}
                          onClick={handleLinkClick}
                          searchTerm={searchTerm}
                          isExpanded={isExpanded}
                        />
                      )} */}
                  </div>
                )}
              </div>
              {/* )} */}
            </div>
          )}
        </div>

        {/* AI Navigation Feature Link */}
        <div className="px-3 mb-2">
          <div className="px-1.5 py-1">
            <Link
              to="/dashboard/our-ai"
              onClick={() => handleLinkClick("/dashboard/our-ai")}
              className={`flex items-center rounded-md transition-all duration-200 ${
                !isExpanded
                  ? "justify-center w-6 h-7 mx-auto"
                  : "px-3 py-2 text-xs w-full gap-2.5"
              } ${
                selectedPage === "/dashboard/our-ai"
                  ? "text-white font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor:
                  selectedPage === "/dashboard/our-ai" ? "#17414d" : "",
              }}
              title={!isExpanded ? "R-AI" : ""}
            >
              <Bot
                className={`${!isExpanded ? "w-5 h-5" : "w-4 h-4"} shrink-0`}
              />
              {isExpanded && <span className="truncate">R-AI</span>}
            </Link>
          </div>
        </div>

        {/* Footer Version Info */}
        <div
          className={`mt-auto p-4 border-t border-gray-100 transition-opacity duration-200 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-[10px] text-gray-400 font-mono select-none">
            v{appVersion}
          </div>
        </div>
      </div>

      {/* Overlay for Mobile Screens */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  badge,
  path,
  selected,
  onClick,
  searchTerm,
  isExpanded = true,
}) => {
  if (searchTerm && !label.toLowerCase().includes(searchTerm)) {
    return null;
  }

  const isSelected = selected === path;

  return (
    <Link
      to={path}
      className={`flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors rounded ${
        isSelected
          ? "bg-[#17414d] text-white font-semibold shadow-sm"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      }`}
      onClick={(e) => {
        e.preventDefault();
        onClick(path);
      }}
      title={!isExpanded ? label : ""}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {icon && <span className="shrink-0">{icon}</span>}
        {isExpanded && <span className="truncate">{label}</span>}
      </div>
      {badge && isExpanded && (
        <span className="ml-auto bg-gray-100 text-gray-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-gray-200">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default NavigationSidebar;
