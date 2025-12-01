/**
 * Keyboard Navigation Hook
 *
 * Provides keyboard navigation functionality for project nodes:
 * - Tab: Navigate between focusable elements
 * - Enter: Activate/open focused project
 * - Escape: Close modal
 * - Arrow keys: Navigate between projects
 */

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Project } from "@/types";

interface UseKeyboardNavOptions {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
  enabled?: boolean;
}

export function useKeyboardNav({
  projects,
  onProjectSelect,
  enabled = true,
}: UseKeyboardNavOptions) {
  const { accessibility, openModal } = useAppStore();
  const focusedIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (
      !enabled ||
      !accessibility.keyboardNavEnabled ||
      projects.length === 0
    ) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow navigation
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        focusedIndexRef.current = Math.min(
          focusedIndexRef.current + 1,
          projects.length - 1
        );
        focusProjectNode(focusedIndexRef.current);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0);
        focusProjectNode(focusedIndexRef.current);
      }
      // Enter to open
      else if (e.key === "Enter" && focusedIndexRef.current >= 0) {
        const project = projects[focusedIndexRef.current];
        if (project) {
          e.preventDefault();
          openModal(project);
          if (onProjectSelect) {
            onProjectSelect(project);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    accessibility.keyboardNavEnabled,
    projects,
    openModal,
    onProjectSelect,
  ]);

  const focusProjectNode = (index: number) => {
    const node = document.querySelector(
      `[data-project-index="${index}"]`
    ) as HTMLElement;
    if (node) {
      node.focus();
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return {
    focusedIndex: focusedIndexRef.current,
    focusProject: focusProjectNode,
  };
}

/**
 * Hook for managing accessibility keyboard shortcuts
 * - A: Toggle accessibility panel
 * - ?: Show help
 */
export function useAccessibilityShortcuts(
  onTogglePanel?: () => void,
  onShowHelp?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Toggle accessibility panel with 'A'
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        onTogglePanel?.();
      }
      // Show help with '?'
      else if (e.key === "?") {
        e.preventDefault();
        onShowHelp?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onTogglePanel, onShowHelp]);
}
