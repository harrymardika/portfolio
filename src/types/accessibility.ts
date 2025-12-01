/**
 * Accessibility Settings Types
 *
 * Defines types for accessibility features following WCAG 2.1 AA standards
 */

export type ThemeMode = "dark" | "high-contrast";

export interface AccessibilitySettings {
  // Motion preferences
  reducedMotion: boolean;

  // Visual preferences
  highContrast: boolean;
  theme: ThemeMode;

  // Navigation preferences
  keyboardNavEnabled: boolean;

  // Audio preferences (future)
  soundEnabled: boolean;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  theme: "dark",
  keyboardNavEnabled: true,
  soundEnabled: false,
};

export const STORAGE_KEY = "temporal-portal-accessibility";
