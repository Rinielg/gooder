"use client";

import { useState, useEffect } from "react";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage after mount (prevent hydration mismatch)
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  // Persist to localStorage when collapsed changes (only after mount)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-collapsed", String(collapsed));
    }
  }, [collapsed, mounted]);

  return { collapsed, setCollapsed, mounted };
}
