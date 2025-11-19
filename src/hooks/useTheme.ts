"use client";

import { useCallback, useState } from "react";

export function useTheme(initialTheme?: "light" | "dark" | "navy") {
  const [theme, setTheme] = useState<"light" | "dark" | "navy">(() => {
    if (typeof window === 'undefined') return initialTheme || "light";
    try {
      return (localStorage.getItem("appTheme") as "light" | "dark" | "navy") || initialTheme || "light";
    } catch {
      return initialTheme || "light";
    }
  });

  const changeTheme = useCallback((newTheme: "light" | "dark" | "navy") => {
    setTheme(newTheme);
    try {
      localStorage.setItem("appTheme", newTheme);
    } catch {
      // localStorage not available, just use state
    }
  }, []);

  return { theme, changeTheme };
}

export default useTheme;
