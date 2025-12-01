/**
 * Theme Manager Hook
 *
 * Manages accessibility theme application to document root
 * Syncs settings with CSS custom properties and data attributes
 */

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useThemeManager() {
  const { accessibility } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme data attribute
    root.setAttribute("data-theme", accessibility.theme);

    // Apply reduced motion data attribute
    root.setAttribute(
      "data-reduced-motion",
      accessibility.reducedMotion.toString()
    );

    // Detect system preferences on mount
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)");

    // Auto-enable if system preference detected (only on first visit)
    const isFirstVisit = !localStorage.getItem("temporal-portal-accessibility");
    if (isFirstVisit) {
      if (prefersReducedMotion.matches) {
        useAppStore.getState().setReducedMotion(true);
      }
      if (prefersHighContrast.matches) {
        useAppStore.getState().setHighContrast(true);
      }
    }

    // Listen for system preference changes
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (isFirstVisit) {
        useAppStore.getState().setReducedMotion(e.matches);
      }
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (isFirstVisit) {
        useAppStore.getState().setHighContrast(e.matches);
      }
    };

    prefersReducedMotion.addEventListener("change", handleReducedMotionChange);
    prefersHighContrast.addEventListener("change", handleContrastChange);

    return () => {
      prefersReducedMotion.removeEventListener(
        "change",
        handleReducedMotionChange
      );
      prefersHighContrast.removeEventListener("change", handleContrastChange);
    };
  }, [accessibility.theme, accessibility.reducedMotion]);

  return { accessibility };
}
