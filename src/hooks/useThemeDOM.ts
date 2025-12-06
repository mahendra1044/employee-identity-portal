/**
 * useThemeDOM Hook
 * 
 * Side effect hook that applies theme CSS classes to the document root element.
 * Handles theme changes reactively and only runs on client side.
 * 
 * Supported themes:
 * - 'light': No CSS classes applied
 * - 'dark': 'dark' class applied
 * - 'navy': 'dark navy' classes applied
 * 
 * @hook
 * @param {string} theme - Theme name to apply ('light', 'dark', or 'navy')
 * @returns {void}
 * 
 * @example
 * useThemeDOM(theme);
 */

"use client";

import { useEffect } from "react";
import { THEME_CLASSES } from "@/lib/ui-config";

/**
 * Hook for applying theme classes to the document root
 * Updates the document.documentElement.className based on theme value
 * 
 * @param theme - The current theme ('light', 'dark', or 'navy')
 */
export function useThemeDOM(theme: string | null): void {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || !theme) {
      return;
    }

    // Get the CSS classes for the theme
    const themeClasses = THEME_CLASSES[theme as keyof typeof THEME_CLASSES];
    
    if (themeClasses !== undefined) {
      document.documentElement.className = themeClasses;
    }
  }, [theme]);
}

export default useThemeDOM;
