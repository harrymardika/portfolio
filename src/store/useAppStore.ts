// Global app store
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/types";
import type { AccessibilitySettings } from "@/types/accessibility";
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  STORAGE_KEY,
} from "@/types/accessibility";

interface AppState {
  projects: Project[];
  selectedProject: Project | null;
  isModalOpen: boolean;

  // Accessibility settings
  accessibility: AccessibilitySettings;

  // Actions
  setProjects: (projects: Project[]) => void;
  openModal: (project: Project) => void;
  closeModal: () => void;

  // Accessibility actions
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setTheme: (theme: "dark" | "high-contrast") => void;
  setKeyboardNavEnabled: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  updateAccessibilitySettings: (
    settings: Partial<AccessibilitySettings>
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [],
      selectedProject: null,
      isModalOpen: false,
      accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,

      // Project actions
      setProjects: (projects) => set({ projects }),
      openModal: (project) =>
        set({ selectedProject: project, isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),

      // Accessibility actions
      setReducedMotion: (value) =>
        set((state) => ({
          accessibility: { ...state.accessibility, reducedMotion: value },
        })),
      setHighContrast: (value) =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            highContrast: value,
            theme: value ? "high-contrast" : "dark",
          },
        })),
      setTheme: (theme) =>
        set((state) => ({
          accessibility: { ...state.accessibility, theme },
        })),
      setKeyboardNavEnabled: (value) =>
        set((state) => ({
          accessibility: { ...state.accessibility, keyboardNavEnabled: value },
        })),
      setSoundEnabled: (value) =>
        set((state) => ({
          accessibility: { ...state.accessibility, soundEnabled: value },
        })),
      updateAccessibilitySettings: (settings) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings },
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ accessibility: state.accessibility }),
    }
  )
);
