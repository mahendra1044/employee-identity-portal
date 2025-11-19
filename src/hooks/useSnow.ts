"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [snowError, setSnowError] = useState<string | null>(null);
  const [snowCount, setSnowCount] = useState<number | null>(null);
  const [snowItems, setSnowItems] = useState<any[] | null>(null);
  const [snowEmail, setSnowEmail] = useState<string | null>(null);

  // Helper: decide which email to use for SNOW incidents based on role/search
  const resolveSnowEmail = useCallback((): string | null => {
    const self = String(email || (typeof window !== 'undefined' ? localStorage.getItem("email") : '') || '').toLowerCase();
    if (role === 'ops') {
      // Only after a search should ops see incidents for a user
      if (!hasSearched) return null;
      const q = String(search || '').trim().toLowerCase();
      // If the query itself looks like an email, prefer it
      if (q && q.includes('@') && q.includes('.')) return q;
      // Otherwise try first Ping Directory result's email
      const pd = Array.isArray((searchResults as any)?.["ping-directory"]) ? (searchResults as any)["ping-directory"] : [];
      if (pd[0]?.email) return String(pd[0].email).toLowerCase();
      return null;
    }
    return self || null;
  }, [role, hasSearched, search, searchResults, email]);

  // Load SNOW incidents
  const loadSnowIncidents = useCallback(async (targetEmail: string | null) => {
    if (!token || !targetEmail) {
      setSnowError('No target email available');
      setSnowItems([]);
      setSnowCount(0);
      return;
    }

    setSnowLoading(true);
    setSnowError(null);
    try {
      const url = `/api/snow/incidents?email=${encodeURIComponent(targetEmail)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      
      let json: any;
      try {
        json = await res.json();
      } catch {
        // If JSON parsing fails, it's likely HTML (404, 500 error page)
        const text = await res.text();
        console.error('SNOW API returned non-JSON response:', { status: res.status, responseText: text.substring(0, 200) });
        setSnowError(`Server error: ${res.status}`);
        setSnowItems([]);
        setSnowCount(0);
        setSnowLoading(false);
        return;
      }

      if (!res.ok) {
        setSnowError(json.error || 'Failed to load incidents');
        setSnowItems([]);
        setSnowCount(0);
        return;
      }

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
      setSnowCount(null);
      setSnowEmail(null);
      setSnowItems(null);
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
