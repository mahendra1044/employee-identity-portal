/**
 * useFeatures Hook
 * 
 * Loads feature configuration from the backend API.
 * Falls back to defaults if API fails.
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { FEATURE_FLAGS } from "@/config";
import type { Features } from "@/lib/types";

// Default features when API is unavailable
const DEFAULT_FEATURES: Features = {
  credentialSource: "env",
  useMocks: FEATURE_FLAGS.useMockData,
  useMockAuth: FEATURE_FLAGS.useMockAuth,
  systems: {
    "ping-directory": true,
    "ping-federate": true,
    "cyberark": true,
    "saviynt": true,
    "azure-ad": true,
    "ping-mfa": true,
    "ping-access": true,
    "ping-authorize": true,
    "ping-intelligence": true,
  },
};

interface UseFeatureResult {
  features: Features | undefined;
  educateEnabled: boolean;
  isLoading: boolean;
}

/**
 * Hook for loading and managing application features
 */
export function useFeatures(token: string | null): UseFeatureResult {
  const [features, setFeatures] = useState<Features | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const loadFeatures = async () => {
      try {
        const res = await fetch('/api/config/features');
        if (res.ok) {
          const data = await res.json();
          setFeatures(data);
        } else {
          setFeatures(DEFAULT_FEATURES);
        }
      } catch {
        // Failed to load features, use defaults
        setFeatures(DEFAULT_FEATURES);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatures();
  }, [token]);

  // Check if educational guide is enabled
  const educateEnabled = useMemo(() => {
    // Environment variable takes precedence
    const envVal = (process.env.NEXT_PUBLIC_EDUCATE_GUIDE || "")
      .toString()
      .trim()
      .toLowerCase();
    
    if (envVal) {
      return ["1", "true", "on", "yes", "enabled"].includes(envVal);
    }

    // Fall back to feature configuration, then to centralized config
    return features?.employeeEducateGuideEnabled ?? FEATURE_FLAGS.educateGuideEnabled;
  }, [features]);

  return {
    features: features || DEFAULT_FEATURES,
    educateEnabled,
    isLoading,
  };
}

export default useFeatures;