import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  Users,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  role?: string; // ✅ from AuthContext (admin, po, tsm, etc.)
}

/** 
 * Define all menu items with allowed roles 
 */
const navigationItems = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home, roles: ["admin", "po", "tsm"] },
  { id: "products", label: "Products", path: "/products", icon: Package, roles: ["admin", "po"] },
  { id: "productsvaration", label: "Product Variation", path: "/products-variation", icon: Package, roles: ["admin", "po"] },
  { id: "vendors", label: "Vendor Management", path: "/vendor-managment", icon: Package, roles: ["admin","po"] },
  { id: "stock", label: "Stock Management", path: "/stock-managment", icon: Package, roles: ["admin", "po"] },
  { id: "addterritory", label: "Add Territory", path: "/add-territory", icon: Package, roles: ["admin", "tsm"] },
  { id: "addbdes", label: "Add BDEs", path: "/add-bdes", icon: Package, roles: ["admin", "tsm"] },
  { id: "addshop", label: "Add Shop", path: "/add-shop", icon: Package, roles: ["admin", "tsm"] },
  { id: "employees", label: "Employees", path: "/employees", icon: Users, roles: ["admin"] },
  { id: "brandmanagment", label: "Brand Management", path: "/brand-managment", icon: Package, roles: ["admin", "po"] },
  { id: "categorymanagment", label: "Category Management", path: "/category-managment", icon: Package, roles: ["admin", "po"] },
];

export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, role = "guest" }) => {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  // ✅ Filter menu by user role
  const filteredNavigation = navigationItems.filter((item) =>
    item.roles.includes(role)
  );

  // helper for active route
  const isPathActive = (path: string) =>
    pathname === path.toLowerCase() || pathname.startsWith(path.toLowerCase() + "/");

  return (
    <div
      className={cn(
        "bg-dashboard-sidebar text-dashboard-sidebar-foreground h-screen flex flex-col border-r border-dashboard-sidebar-hover",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dashboard-sidebar-hover flex-shrink-0">
        {!isCollapsed && (
          <h1 className="text-lg font-semibold leading-tight">
            BLK Business Solutions
          </h1>
        )}

        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-dashboard-sidebar-hover transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-4">
        <nav className="space-y-1 px-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon as any;
            const active = isPathActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-dashboard-sidebar-hover",
                  active && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    active
                      ? "text-dashboard-sidebar-active"
                      : "text-dashboard-sidebar-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "font-medium transition-colors",
                      active
                        ? "text-dashboard-sidebar-active"
                        : "text-dashboard-sidebar-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-dashboard-sidebar-hover text-sm text-gray-400">
          Role: <span className="font-medium text-white">{role}</span>
        </div>
      )}
    </div>
  );
};
