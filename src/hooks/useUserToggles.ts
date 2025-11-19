"use client";

import { useCallback, useState } from "react";

export type SystemKey =
  | "ping-directory"
  | "ping-federate"
  | "ping-mfa"
  | "azure-ad"
  | "cyberark"
  | "saviynt";

const DEFAULT_SYSTEMS: Record<SystemKey, boolean> = {
  "ping-directory": true,
  "ping-federate": true,
  "ping-mfa": true,
  "azure-ad": true,
  "cyberark": true,
  "saviynt": true,
};

export function useUserToggles() {
  const [userToggles, setUserToggles] = useState<Record<SystemKey, boolean>>(() => {
    if (typeof window === 'undefined') return DEFAULT_SYSTEMS;
    try {
      const stored = localStorage.getItem("systemToggles");
      if (!stored) return DEFAULT_SYSTEMS;
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all systems are present
      return { ...DEFAULT_SYSTEMS, ...parsed };
    } catch {
      return DEFAULT_SYSTEMS;
    }
  });

  const handleToggleChange = useCallback((system: SystemKey, checked: boolean) => {
    setUserToggles(prevToggles => {
      const updated = { ...prevToggles, [system]: checked };
      try {
        localStorage.setItem("systemToggles", JSON.stringify(updated));
      } catch {
        // localStorage not available, just use state
      }
      return updated;
    });
  }, []);

  return { userToggles, handleToggleChange };
}

export default useUserToggles;
