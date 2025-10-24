// src/components/DashboardSidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import { getTerritories } from "@/api/authApi"; // your API helper
import TerritorySelect from "@/components/TerritorySelect";
import {
  Home,
  Package,
  Users,
  Menu,
  X,
  MapPin,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  role?: string; // from AuthContext (admin, po, tsm, etc.)
  // legacy/optional props (kept for compatibility)
  dcs?: { id: string; name: string }[];
  selectedDcId?: string;
  onDcChange?: (dcId: string) => void;
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

const LOCAL_STORAGE_DC_KEY = "selected_dc_id";

export const DashboardSidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  role = "guest",
  dcs, // kept for backward compatibility but we fetch live anyway
  selectedDcId,
  onDcChange,
}) => {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  // Filter menu by user role
  const filteredNavigation = navigationItems.filter((item) =>
    item.roles.includes(role)
  );

  // Active route helper
  const isPathActive = (path: string) =>
    pathname === path.toLowerCase() || pathname.startsWith(path.toLowerCase() + "/");

  // Territories state (we'll refer to them as DCs here to match your prop names)
  const [remoteDcs, setRemoteDcs] = useState<{ id: string; name: string }[]>([]);
  const [loadingDcs, setLoadingDcs] = useState<boolean>(false);
  const [dcsError, setDcsError] = useState<string | null>(null);

  // Local selected id with localStorage fallback
  const [localDcId, setLocalDcId] = useState<string | undefined>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_DC_KEY) ?? undefined;
    } catch {
      return undefined;
    }
  });

  // effective selected id: parent-controlled or local
  const effectiveDcId = selectedDcId ?? localDcId;

  // Show a merged list: prefer remote fetch, fallback to dcs prop if provided
  const mergedDcs = useMemo(() => {
    if (remoteDcs && remoteDcs.length > 0) return remoteDcs;
    if (dcs && dcs.length > 0) return dcs;
    return [];
  }, [remoteDcs, dcs]);

  // current DC object for display
  const currentDc = useMemo(() => {
    if (!mergedDcs || mergedDcs.length === 0) return undefined;
    return mergedDcs.find((x) => String(x.id) === String(effectiveDcId)) ?? mergedDcs[0];
  }, [mergedDcs, effectiveDcId]);

  // fetch territories from API
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingDcs(true);
      setDcsError(null);
      try {
        const data = await getTerritories(); // your API helper
        // getTerritories likely returns response.data; accept multiple shapes:
        // if it's an array already -> use it
        // if it's an object with .data -> try .data
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray((data as any).data)) list = (data as any).data;
        else if (Array.isArray((data as any).territories)) list = (data as any).territories;
        else if (Array.isArray((data as any).rows)) list = (data as any).rows;
        else {
          // try to coerce if object keyed by id
          const maybe = Object.values(data || {});
          if (Array.isArray(maybe) && maybe.length > 0 && typeof maybe[0] === "object") {
            list = maybe as any[];
          }
        }

        // normalize to objects with id & name strings
        const normalized = (list || []).map((t: any) => ({
          id: String(t.id ?? t.ID ?? t._id ?? t.territory_id ?? ""),
          name: t.name ?? t.label ?? t.title ?? t.territory_name ?? String(t.id ?? ""),
        })).filter((x: any) => x.id);

        if (!cancelled) {
          setRemoteDcs(normalized);
          // ensure we have a selected id
          if (!effectiveDcId && normalized.length > 0) {
            const initial = normalized[0].id;
            setLocalDcId(initial);
            try { localStorage.setItem(LOCAL_STORAGE_DC_KEY, initial); } catch {}
            onDcChange?.(initial);
          } else if (effectiveDcId) {
            // if effectiveId exists but not in list, choose first
            const exists = normalized.some((t) => String(t.id) === String(effectiveDcId));
            if (!exists && normalized.length > 0) {
              const initial = normalized[0].id;
              setLocalDcId(initial);
              try { localStorage.setItem(LOCAL_STORAGE_DC_KEY, initial); } catch {}
              onDcChange?.(initial);
            }
          }
        }
      } catch (err: any) {
        console.error("Failed to load territories (DCs)", err);
        if (!cancelled) {
          setDcsError(err?.message ?? "Failed to load territories");
          // fallback to dcs prop is handled via mergedDcs
        }
      } finally {
        if (!cancelled) setLoadingDcs(false);
      }
    };

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  // When parent provides a selectedDcId, we don't modify local stor; otherwise we persist changes
  const handleDcChange = (newId: string) => {
    if (!newId) return;
    if (!selectedDcId) {
      setLocalDcId(newId);
      try { localStorage.setItem(LOCAL_STORAGE_DC_KEY, newId); } catch {}
    }
    onDcChange?.(newId);
  };

  return (
    <div
      className={cn(
        "bg-dashboard-sidebar text-dashboard-sidebar-foreground h-screen flex flex-col border-r border-dashboard-sidebar-hover",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* DC selector area (above header) */}


          <div className="px-3 py-3 border-b border-dashboard-sidebar-hover flex items-center gap-3">
        {!isCollapsed ? (
          <div className="w-full">
            <label htmlFor="dc-select" className="block text-xs text-gray-400 mb-1">
              Territory
            </label>

            {/* Loading / select / empty states */}
            <TerritorySelect
              value={selectedDcId}         // optional: pass to control externally; omit to let the component persist to localStorage
              onChange={(id) => {
               
                handleDcChange(id);         // re-use your function so behavior stays identical
              }}
              fallback={dcs}               // optional: use legacy prop as fallback list
              persist={true}               // optional; defaults to true when uncontrolled
              className="w-full"
            />




          </div>
        ) : (
          // Collapsed: show compact indicator (initial or icon) with tooltip title
          <div className="flex items-center justify-center w-full" title={currentDc?.name ?? "Territory"}>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium">
              {currentDc?.name?.[0] ?? <MapPin className="w-4 h-4" />}
            </div>
          </div>
        )}
      </div>

  
      {/* Header (logo / title / collapse button) */}
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

export default DashboardSidebar;
