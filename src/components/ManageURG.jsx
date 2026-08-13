import React, { useState } from "react";
import { Users, Shield, FolderGit2, TablePropertiesIcon } from "lucide-react";
import ManageUsers from "./ManageUser";
import ManageGroupScreen from "./ManageGroup";
import RoleManagement from "./ManageRole";
import ManageUserAccess from "./ManageUserAccess";

const UserManagementSuite = () => {
  // Navigation State: 'users' | 'groups' | 'roles'
  const [activeTab, setActiveTab] = useState("usersAccess");

  // Dynamic roles state shared across modules

  return (
    // <div className="p-6 max-w-7xl mx-auto space-y-6 font-inter">
    //   {/* Top Header & Navigation Bar */}
    //   <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
    //     <div>
    //       <h1 className="text-xl font-bold text-gray-800">
    //         Administration Control Panel
    //       </h1>
    //       <p className="text-xs text-gray-500">
    //         Manage application user accounts, report access groups, and system
    //         security roles.
    //       </p>
    //     </div>

    <div className="w-full bg-slate-50 text-slate-700 text-xs antialiased">
      <div className="max-w-auto mx-auto bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-4">
        <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2">
          <span className="font-bold text-slate-800 text-[11px]">
            Access Management
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 mt-2 rounded-lg">
          {/* <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "users"
                ? "bg-white text-[#17414d] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users size={14} />
            Users
          </button> */}
          <button
            onClick={() => setActiveTab("usersAccess")}
            className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "usersAccess"
                ? "bg-white text-[#17414d] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users size={14} />
            Users
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "groups"
                ? "bg-white text-[#17414d] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FolderGit2 size={14} />
            Groups
          </button>

          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "roles"
                ? "bg-white text-[#17414d] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield size={14} />
            Roles
          </button>
          <button
            onClick={() => setActiveTab("userProperty")}
            className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "userProperty"
                ? "bg-white text-[#17414d] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TablePropertiesIcon size={14} />
            User Property Mapping
          </button>
        </div>
      </div>

      {/* Dynamic Tab Body Render */}
      <div className="transition-all duration-200">
        {/* {activeTab === "users" && (
          <ManageUsers onNavigateToRoles={() => setActiveTab("roles")} />
        )} */}
        {activeTab === "usersAccess" && (
          <ManageUserAccess onNavigateToRoles={() => setActiveTab("roles")} />
        )}
        {activeTab === "groups" && <ManageGroupScreen />}
        {activeTab === "roles" && <RoleManagement />}
        {activeTab === "userProperty" && <UserPropertyMapping />}
      </div>
    </div>
  );
};

export default UserManagementSuite;
