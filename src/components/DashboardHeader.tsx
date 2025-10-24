// src/components/DashboardHeader.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Bell, LogOut, MapPin, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { IMAGES } from "@/assets/Images";
import { useAuth } from "@/api/AuthContext";
import TerritorySelect from "@/components/TerritorySelect";
import { getTerritories } from "@/api/authApi";

interface HeaderProps {
  onMenuToggle?: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  pageTitle?: string;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  searchValue,
  onSearchChange,
  pageTitle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [territoryOpen, setTerritoryOpen] = useState(false); // mobile popover

  // ===== Territory state =====
  const [remoteDcs, setRemoteDcs] = useState<{ id: string; name: string }[]>([]);
  const [selectedDcId, setSelectedDcId] = useState<string | undefined>(() => {
    try {
      return localStorage.getItem("selected_dc_id") ?? undefined;
    } catch {
      return undefined;
    }
  });

  const currentDc = useMemo(() => {
    if (!remoteDcs || remoteDcs.length === 0) return undefined;
    return remoteDcs.find((x) => String(x.id) === String(selectedDcId)) ?? remoteDcs[0];
  }, [remoteDcs, selectedDcId]);

  const handleDcChange = (newId: string) => {
    if (!newId) return;
    setSelectedDcId(newId);
    try {
      localStorage.setItem("selected_dc_id", newId);
    } catch {}
    setTerritoryOpen(false);
  };

  // robust fetch (handles multiple shapes)
  useEffect(() => {
    (async () => {
      try {
        const data = await getTerritories();
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray((data as any)?.data)) list = (data as any).data;
        else if (Array.isArray((data as any)?.territories)) list = (data as any).territories;
        else if (Array.isArray((data as any)?.rows)) list = (data as any).rows;
        else {
          const maybe = Object.values(data || {});
          if (Array.isArray(maybe) && maybe.length && typeof maybe[0] === "object") list = maybe as any[];
        }

        const normalized = (list || [])
          .map((t: any) => ({
            id: String(t.id ?? t.ID ?? t._id ?? t.territory_id ?? ""),
            name: String(t.name ?? t.label ?? t.title ?? t.territory_name ?? t.id ?? ""),
          }))
          .filter((x) => x.id);

        setRemoteDcs(normalized);
        if (!selectedDcId && normalized.length > 0) {
          handleDcChange(normalized[0].id);
        }
      } catch (e) {
        console.error("Failed to load territories", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Title =====
  const slugToTitle = (slug: string) =>
    slug
      .replace(/[-_]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const pathToTitle = (pathname: string) => {
    if (!pathname || pathname === "/") return "Dashboard";
    const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    const meaningful = parts.filter((segment) => !/^\d+$/.test(segment));
    if (meaningful.length === 0) return "Dashboard";
    return meaningful.map(slugToTitle).join(" · ");
  };

  const derivedTitle = pageTitle || pathToTitle(location.pathname);

  useEffect(() => {
    document.title = `${derivedTitle} • BLK Business Solutions`;
  }, [derivedTitle]);

  // ===== Outside click for mobile territory popover =====
  const territoryBtnRef = useRef<HTMLButtonElement | null>(null);
  const territoryPanelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent | TouchEvent) => {
      if (!territoryOpen) return;
      const t = e.target as Node;
      if (
        territoryPanelRef.current &&
        !territoryPanelRef.current.contains(t) &&
        territoryBtnRef.current &&
        !territoryBtnRef.current.contains(t)
      ) {
        setTerritoryOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [territoryOpen]);

  // ===== Logout =====
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUserOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Logo, Title, Search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
          <img src={IMAGES.logo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div className="hidden md:block pr-4 border-r border-gray-100 mr-4">
          <div className="text-lg font-semibold text-gray-800">{derivedTitle}</div>
          <div className="text-xs text-gray-500 truncate">{location.pathname}</div>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-full h-10 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 w-full"
          />
        </div>
      </div>

      {/* Right: Territory, Notifications, User */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Desktop Territory */}
        <div className="hidden sm:flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">Territory:</label>
          <div className="min-w-[180px]">
            <TerritorySelect
              value={selectedDcId}
              onChange={handleDcChange}
              // use fetched list as fallback to ensure names render
              fallback={remoteDcs}
              persist
              className="w-full"
            />
          </div>
        </div>

        {/* Mobile Territory (badge + popover with SAME TerritorySelect) */}
        <div className="relative sm:hidden">
          <button
            ref={territoryBtnRef}
            onClick={() => setTerritoryOpen((s) => !s)}
            className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium"
            title={currentDc?.name ?? "Territory"}
          >
            {currentDc?.name?.[0] ?? <MapPin className="w-4 h-4" />}
          </button>

          {territoryOpen && (
            <div
              ref={territoryPanelRef}
              className="absolute right-0 top-11 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-[999]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Select Territory</span>
                <button
                  onClick={() => setTerritoryOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Use the SAME component so names always render */}
              <TerritorySelect
                value={selectedDcId}
                onChange={handleDcChange}
                fallback={remoteDcs}
                persist
                className="w-full"
              />

              {/* If you prefer a simple list instead of the component, uncomment:
              <ul className="mt-2 max-h-60 overflow-y-auto divide-y divide-gray-100">
                {remoteDcs.map((dc) => (
                  <li
                    key={dc.id}
                    onClick={() => handleDcChange(dc.id)}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                      dc.id === selectedDcId ? "bg-indigo-100 text-indigo-700" : "text-gray-700"
                    }`}
                  >
                    {dc.name}
                  </li>
                ))}
              </ul>
              */}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((s) => !s)}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50">
              <div className="p-3">
                <div className="text-sm font-semibold mb-2">Notifications</div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="p-2 rounded-md hover:bg-gray-50">New order received</li>
                  <li className="p-2 rounded-md hover:bg-gray-50">Stock update</li>
                  <li className="p-2 rounded-md hover:bg-gray-50">Employee request pending</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <div
            onClick={() => setUserOpen((s) => !s)}
            className="flex items-center gap-2 ml-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.[0] ?? "A"}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-800 hidden sm:inline">
              {user?.name ?? "Admin"}
            </span>
          </div>

          {userOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50">
              <div className="p-3">
                <div className="flex items-center gap-3 px-1 py-2">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{user?.name?.[0] ?? "A"}</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{user?.name ?? "Admin"}</div>
                    <div className="text-xs text-gray-500">{user?.email ?? ""}</div>
                  </div>
                </div>

                <div className="mt-2 border-t border-gray-100 pt-2">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
