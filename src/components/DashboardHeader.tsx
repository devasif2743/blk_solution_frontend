// src/components/DashboardHeader.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Bell,
  Settings,
  LogOut,
  Home,
  Package,
  Map,
  Users,
  ClipboardList,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { IMAGES } from "@/assets/Images";
import { useAuth } from "@/api/AuthContext";

interface HeaderProps {
  onMenuToggle?: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  // Optional override for the page title. If provided, this will be used instead of auto-derived title.
  pageTitle?: string;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  onMenuToggle,
  searchValue,
  onSearchChange,
  pageTitle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [plusOpen, setPlusOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // refs for outside click detection and focus
  const plusBtnRef = useRef<HTMLButtonElement | null>(null);
  const plusPanelRef = useRef<HTMLDivElement | null>(null);

  const userBtnRef = useRef<HTMLDivElement | null>(null);
  const userPanelRef = useRef<HTMLDivElement | null>(null);

  const notifBtnRef = useRef<HTMLButtonElement | null>(null);
  const notifPanelRef = useRef<HTMLDivElement | null>(null);

  // tabs to show in plus popover (icons included)
  const tabs = [
    { key: "dashboard", label: "Dashboard", path: "/dashboard", Icon: Home },
    { key: "products", label: "Products", path: "/products", Icon: Package },
    { key: "routemap", label: "RouteMap", path: "/routemap", Icon: Map },
    { key: "employees", label: "Employees", path: "/employees", Icon: Users },
    { key: "inventory", label: "Inventory Management", path: "/inventory", Icon: ClipboardList },
  ];

  // utility: convert a slug/camel/kebab to Title Case (Product Variation, Product, etc.)
  const slugToTitle = (slug: string) => {
    if (!slug) return "";
    // replace separators with spaces, also turn camelCase boundaries into spaces
    // examples:
    // product-variation -> product variation
    // productVariation -> product Variation (then lowercase fix)
    const withSpaces = slug
      .replace(/[-_]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/\b([a-z])([A-Z])/, "$1 $2"); // more robust
    // split words, capitalize first letter of each
    return withSpaces
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Convert full path to a readable title. Handles /products, /products/123/variation, /product-variation
  const pathToTitle = (pathname: string) => {
    if (!pathname || pathname === "/") return "Dashboard";
    // remove trailing slash
    const p = pathname.replace(/\/+$/, "");
    const parts = p.split("/").filter(Boolean); // ['products', '123', 'variation']
    // Filter out numeric ids (common pattern). Keep meaningful segments.
    const meaningful = parts.filter((segment) => !/^\d+$/.test(segment));
    if (meaningful.length === 0) return "Dashboard";
    // If first segment is 'dashboard', show 'Dashboard', else join like 'Products · Variation'
    const titles = meaningful.map((seg) => slugToTitle(seg));
    // If path starts with 'dashboard', or only one segment, show single title
    return titles.join(" · ");
  };

  // Derived title: prop override -> location-based
  const derivedTitle = pageTitle ? pageTitle : pathToTitle(location.pathname);

  // close popovers on outside click and ESC
  useEffect(() => {
    function handleDocClick(e: MouseEvent | TouchEvent | KeyboardEvent) {
      const target = (e as MouseEvent).target as Node | null;

      // ESC handling
      if ((e as KeyboardEvent).key === "Escape") {
        setPlusOpen(false);
        setUserOpen(false);
        setNotifOpen(false);
        return;
      }

      if (!target) return;

      if (plusOpen && plusPanelRef.current && plusBtnRef.current) {
        if (!plusPanelRef.current.contains(target) && !plusBtnRef.current.contains(target)) {
          setPlusOpen(false);
        }
      }

      if (userOpen && userPanelRef.current && userBtnRef.current) {
        if (!userPanelRef.current.contains(target) && !userBtnRef.current.contains(target)) {
          setUserOpen(false);
        }
      }

      if (notifOpen && notifPanelRef.current && notifBtnRef.current) {
        if (!notifPanelRef.current.contains(target) && !notifBtnRef.current.contains(target)) {
          setNotifOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("touchstart", handleDocClick);
    document.addEventListener("keydown", handleDocClick);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("touchstart", handleDocClick);
      document.removeEventListener("keydown", handleDocClick);
    };
  }, [plusOpen, userOpen, notifOpen]);

  // keep document.title in sync
  useEffect(() => {
    document.title = `${derivedTitle} • BLK Business Solutions`;
  }, [derivedTitle]);

  // logout helper
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

  // when clicking an action/tab from plus menu
  const onPlusNavigate = (path: string) => {
    setPlusOpen(false);
    navigate(path);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Logo + Page Title + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-3xl">
        <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
          <img src={IMAGES.logo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        {/* Page title */}
        <div className="pr-4 border-r border-gray-100 mr-4 hidden sm:block">
          <div className="text-lg font-semibold text-gray-800">{derivedTitle}</div>
          <div className="text-xs text-gray-500">{location.pathname}</div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-full h-10 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right: Plus popup, Notifications, Settings, User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifBtnRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((s) => !s);
              setPlusOpen(false);
              setUserOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </button>

          {notifOpen && (
            <div
              ref={notifPanelRef}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
            >
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

        {/* User dropdown */}
        <div className="relative">
          <div
            ref={userBtnRef}
            tabIndex={0}
            role="button"
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={() => {
              setUserOpen((s) => !s);
              setPlusOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 ml-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">{user?.name?.[0] ?? "A"}</span>
            </div>
            <span className="text-sm font-medium text-gray-800 hidden sm:inline">{user?.name ?? "Admin"}</span>
          </div>

          {userOpen && (
            <div
              ref={userPanelRef}
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
            >
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
                    role="menuitem"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                    role="menuitem"
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
