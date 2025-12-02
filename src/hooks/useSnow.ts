"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

export function useSnow(
  token: string | null,
  role: string | null,
  search: string,
  searchResults: any,
  hasSearched: boolean,
  email: string | null
) {
  const [snowOpen, setSnowOpen] = useState(false);
  const [snowLoading, setSnowLoading] = useState(false);
  const [snowError, setSnowError] = useState<string | undefined>(undefined);
  const [snowCount, setSnowCount] = useState<number | undefined>(undefined);
  const [snowItems, setSnowItems] = useState<any[] | undefined>(undefined);
  const [snowEmail, setSnowEmail] = useState<string | undefined>(undefined);

  // Helper: decide which email to use for SNOW incidents based on role/search
  const resolveSnowEmail = useCallback((): string | undefined => {
    const self = String(email || '').toLowerCase();
    if (role === 'ops') {
      // Only after a search should ops see incidents for a user
      if (!hasSearched) return undefined;
      const q = String(search || '').trim().toLowerCase();
      // If the query itself looks like an email, prefer it
      if (q && q.includes('@') && q.includes('.')) return q;
      // Otherwise try first Ping Directory result's email
      const pd = Array.isArray((searchResults as any)?.["ping-directory"]) ? (searchResults as any)["ping-directory"] : [];
      if (pd[0]?.email) return String(pd[0].email).toLowerCase();
      return undefined;
    }
    return self || undefined;
  }, [role, hasSearched, search, searchResults, email]);

  // Load SNOW incidents
  const loadSnowIncidents = useCallback(async (targetEmail: string | undefined) => {
    if (!token || !targetEmail) {
      setSnowError('No target email available');
      setSnowItems([]);
      setSnowCount(0);
      return;
    }

    setSnowLoading(true);
    setSnowError(undefined);
    try {
      const response = await api.ops.snow.getIncidents(targetEmail, { token });
      
      if (!response.ok) {
        setSnowError(response.error || 'Failed to load incidents');
        setSnowItems([]);
        setSnowCount(0);
        return;
      }

      const json = response.data as { items?: unknown[]; open?: number; in_progress?: number };
      const items = Array.isArray(json?.items) ? json.items : [];
      
      // Generate demo incidents if empty
      const mkDemo = () => {
        const now = Date.now();
        const iso = (t: number) => new Date(t).toISOString();
        const assigned = targetEmail;
        return [
          { number: `INC-DEMO-${Math.floor(Math.random()*1_000_000).toString().padStart(6,'0')}`, short_description: 'Demo: Password reset pending', state: 'open', priority: '3 - Moderate', updatedAt: iso(now), assigned_to: assigned },
          { number: `INC-DEMO-${Math.floor(Math.random()*1_000_000).toString().padStart(6,'0')}`, short_description: 'Demo: Account unlock requested', state: 'in_progress', priority: '2 - High', updatedAt: iso(now - 60*60*1000), assigned_to: assigned },
          { number: `INC-DEMO-${Math.floor(Math.random()*1_000_000).toString().padStart(6,'0')}`, short_description: 'Demo: Password reset completed', state: 'closed', priority: '4 - Low', updatedAt: iso(now - 24*60*60*1000), assigned_to: assigned },
        ];
      };

      const finalItems = items.length > 0 ? items : mkDemo();
      setSnowItems(finalItems);
      
      const computedCount = finalItems.reduce((acc: number, it: any) => {
        const st = String(it.state || '').toLowerCase();
        if (st === 'open' || st.includes('progress')) return acc + 1;
        return acc;
      }, 0);
      
      setSnowCount(
        typeof json?.open === 'number' && typeof json?.in_progress === 'number'
          ? Number(json.open) + Number(json.in_progress)
          : computedCount
      );
    } catch (e: any) {
      setSnowError(e.message || 'Failed to load incidents');
      setSnowItems([]);
      setSnowCount(0);
    } finally {
      setSnowLoading(false);
    }
  }, [token]);

  // Open SNOW dialog and fetch incidents
  const openSnowDialog = useCallback(async () => {
    if (!token) return;
    const target = resolveSnowEmail();
    // Only block when ops has no valid searched target; employees can proceed (backend uses self email)
    if (role === 'ops' && !target) {
      toast.error('No target user found for SNOW incidents');
      return;
    }
    setSnowOpen(true);
    setSnowEmail(target);
    await loadSnowIncidents(target);
  }, [token, role, resolveSnowEmail, loadSnowIncidents]);

  // Reset SNOW context on ops search changes to avoid stale counts/targets
  useEffect(() => {
    if (role === 'ops') {
      setSnowCount(undefined);
      setSnowEmail(undefined);
      setSnowItems(undefined);
    }
  }, [role, hasSearched, search]);

  return {
    snowOpen,
    setSnowOpen,
    snowLoading,
    snowError,
    snowCount,
    snowItems,
    snowEmail,
    openSnowDialog,
    resolveSnowEmail,
  };
}

export default useSnow;
