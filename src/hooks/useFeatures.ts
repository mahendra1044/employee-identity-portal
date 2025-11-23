/**
 * useFeatures Hook
 * 
 * Manages application features state including:
 * - Loading features configuration from backend API
 * - Falling back to default features if API fails
 * - Calculating educateEnabled based on environment overrides
 * 
 * @hook
 * @param {string | null} token - Authentication token for API requests
 * @returns {UseFeatureResult} Object containing features, educateEnabled, and isLoading state
 * 
 * @example
 * const { features, educateEnabled, isLoading } = useFeatures(token);
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { API_BASE } from "@/lib/constants";
import { FEATURE_DEFAULTS } from "@/lib/ui-config";
import type { Features } from "@/lib/types";

const DEFAULT_FEATURES: Features = {
  credentialSource: "env",
  useMocks: FEATURE_DEFAULTS.USE_MOCKS,
  useMockAuth: FEATURE_DEFAULTS.USE_MOCK_AUTH,
  systems: {
    "ping-directory": true,
    "ping-federate": true,
    "cyberark": true,
    "saviynt": true,
    "azure-ad": true,
    "ping-mfa": true,
  },
};

interface UseFeatureResult {
  features: Features | undefined;
  educateEnabled: boolean;
  isLoading: boolean;
}

/**
 * Hook for loading and managing application features
 * Fetches from /config/features endpoint and handles environment overrides
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
        const res = await fetch(`${API_BASE}/config/features`);
        if (res.ok) {
          const data = await res.json();
          setFeatures(data);
        } else {
          setFeatures(DEFAULT_FEATURES);
        }
      } catch (error) {
        console.error("Failed to load features:", error);
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

    // Fall back to feature configuration
    return features?.employeeEducateGuideEnabled ?? FEATURE_DEFAULTS.EDUCATE_ENABLED;
  }, [features]);

  return {
    features: features || DEFAULT_FEATURES,
    educateEnabled,
    isLoading,
  };
}

export default useFeatures;
