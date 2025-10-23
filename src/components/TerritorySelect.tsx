// src/components/TerritorySelect.tsx (debug-friendly)
import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getTerritories } from "@/api/authApi";
import { cn } from "@/lib/utils";

export interface Territory {
  id: string;
  name: string;
}

interface TerritorySelectProps {
  value?: string;
  onChange?: (id: string) => void;
  fallback?: Territory[];
  className?: string;
  ariaLabel?: string;
}

export const TerritorySelect: React.FC<TerritorySelectProps> = ({
  value,
  onChange,
  fallback,
  className,
  ariaLabel = "Select territory",
}) => {
  const [remote, setRemote] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState<string | undefined>();

  const effectiveValue = value ?? localValue;

  const merged = useMemo(() => {
    if (remote && remote.length) return remote;
    if (fallback && fallback.length) return fallback;
    return [];
  }, [remote, fallback]);

  const current = useMemo(() => {
    if (!merged.length) return undefined;
    return merged.find((m) => String(m.id) === String(effectiveValue)) ?? merged[0];
  }, [merged, effectiveValue]);

useEffect(() => {
  let cancelled = false;
  const load = async () => {
    console.log("Fetching territories from API...");
    setLoading(true);
    setError(null);

    try {
      const data = await getTerritories();
      console.log("Raw API response:", data);

      // Handle different response shapes
      let list: any[] = [];

      if (Array.isArray(data?.data?.data)) {
        list = data.data.data; // ✅ your actual data array
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.territories)) {
        list = data.territories;
      } else if (Array.isArray(data?.rows)) {
        list = data.rows;
      } else if (Array.isArray(data)) {
        list = data;
      } else {
        // fallback if object map
        const maybe = Object.values(data || {});
        if (Array.isArray(maybe) && maybe.length > 0 && typeof maybe[0] === "object") {
          list = maybe as any[];
        }
      }

      console.log("Extracted list:", list);

      const normalized: Territory[] = (list || [])
        .map((t: any) => ({
          id: String(t.id ?? t.ID ?? t._id ?? t.territory_id ?? ""),
          name: t.name ?? t.label ?? t.title ?? t.territory_name ?? String(t.id ?? ""),
        }))
        .filter((x) => x.id);

      console.log("Normalized territories:", normalized);

      if (!cancelled) {
        setRemote(normalized);

        if (value === undefined) {
          const exists = normalized.some((n) => String(n.id) === String(effectiveValue));

          if (!effectiveValue && normalized.length > 0) {
            const initial = normalized[0].id;
            console.log("Default selected territory:", initial);
            setLocalValue(initial);
            onChange?.(initial);
          } else if (!exists && normalized.length > 0) {
            const initial = normalized[0].id;
            console.log("Fallback selected territory:", initial);
            setLocalValue(initial);
            onChange?.(initial);
          }
        }
      }
    } catch (err: any) {
      console.error("Territory fetch error:", err);
      if (!cancelled) setError(err?.message ?? "Failed to load territories");
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  load();
  return () => {
    cancelled = true;
  };
}, []);


  const handleChange = (newId: string) => {
    console.log("User selected territory:", newId);
    if (!newId) return;
    if (value === undefined) {
      setLocalValue(newId);
    }
    onChange?.(newId);
  };

  console.log("Current selected territory:", current);

  return (
    <div className={cn("w-full", className)}>
      {loading ? (
        <div className="h-9 flex items-center px-3 text-sm text-gray-300">Loading territories...</div>
      ) : merged.length > 0 ? (
        <div className="relative">
          <label htmlFor="territory-select" className="sr-only">
            {ariaLabel}
          </label>
          <select
            id="territory-select"
            aria-label={ariaLabel}
            value={current?.id ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-9 rounded-md bg-dashboard-sidebar text-white px-3 pr-8 border border-dashboard-sidebar-hover focus:outline-none"
          >
            {merged.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 pointer-events-none" />
        </div>
      ) : (
        <div className="text-sm text-white">{error ? "Failed to load territories" : "No territory available"}</div>
      )}
    </div>
  );
};

export default TerritorySelect;
