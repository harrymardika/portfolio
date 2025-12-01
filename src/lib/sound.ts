/**
 * Sound Manager Module
 * Handles audio playback with accessibility support
 *
 * - Respects `prefers-reduced-motion` media query
 * - Checks `soundEnabled` setting from app store
 * - Prevents overlapping rapid plays with debouncing
 * - Gracefully handles audio errors
 * - Dev console logging for debugging
 */

import { useAppStore } from "@/store/useAppStore";

type SoundName = "portalEnter" | "projectOpen" | "back" | "click";

interface SoundConfig {
  name: SoundName;
  path: string;
  volume: number;
}

const SOUND_CONFIGS: Record<SoundName, SoundConfig> = {
  portalEnter: {
    name: "portalEnter",
    path: "/sounds/portal-enter.mp3",
    volume: 0.6,
  },
  projectOpen: {
    name: "projectOpen",
    path: "/sounds/project-open.mp3",
    volume: 0.5,
  },
  back: {
    name: "back",
    path: "/sounds/back.mp3",
    volume: 0.5,
  },
  click: {
    name: "click",
    path: "/sounds/ui-click.mp3",
    volume: 0.3,
  },
};

// Track currently playing sounds to prevent overlap
const activeSounds = new Map<string, HTMLAudioElement>();

// Debounce timers per sound
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_DELAY = 100; // ms

/**
 * Check if reduced motion is preferred by user
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Play a sound effect with accessibility checks
 * @param soundName - The sound to play
 */
export function playSound(soundName: SoundName): void {
  try {
    // Don't play if client-side rendering is not ready
    if (typeof window === "undefined") return;

    // Respect prefers-reduced-motion
    if (prefersReducedMotion()) {
      if (import.meta.env.DEV) {
        console.log(
          `[Sound] Skipped due to prefers-reduced-motion: ${soundName}`
        );
      }
      return;
    }

    // Get current sound setting from store
    const state = useAppStore.getState();
    if (!state.accessibility.soundEnabled) {
      if (import.meta.env.DEV) {
        console.log(`[Sound] Skipped (disabled): ${soundName}`);
      }
      return;
    }

    // Debounce rapid consecutive plays
    if (debounceTimers.has(soundName)) {
      if (import.meta.env.DEV) {
        console.log(`[Sound] Debounced: ${soundName}`);
      }
      return;
    }

    const config = SOUND_CONFIGS[soundName];
    if (!config) {
      console.warn(`[Sound] Unknown sound: ${soundName}`);
      return;
    }

    // Stop any currently playing instance of this sound
    if (activeSounds.has(soundName)) {
      const existing = activeSounds.get(soundName);
      if (existing) {
        existing.pause();
        existing.currentTime = 0;
      }
      activeSounds.delete(soundName);
    }

    // Create and play audio
    const audio = new Audio(config.path);
    audio.volume = Math.min(1, Math.max(0, config.volume));

    audio.addEventListener("ended", () => {
      activeSounds.delete(soundName);
    });

    audio.addEventListener("error", (e) => {
      if (import.meta.env.DEV) {
        console.warn(`[Sound] Error playing ${soundName}:`, e);
      }
      activeSounds.delete(soundName);
    });

    // Play the sound
    activeSounds.set(soundName, audio);
    const playPromise = audio.play();

    // Handle play() promise rejection (common on mobile/browser autoplay restrictions)
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        if (import.meta.env.DEV) {
          console.warn(
            `[Sound] Play rejected for ${soundName}:`,
            error.message
          );
        }
        activeSounds.delete(soundName);
      });
    }

    if (import.meta.env.DEV) {
      console.log(`[Sound] Playing: ${soundName}`);
    }

    // Set debounce timer
    const timer = setTimeout(() => {
      debounceTimers.delete(soundName);
    }, DEBOUNCE_DELAY);

    debounceTimers.set(soundName, timer);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[Sound] Exception in playSound(${soundName}):`, error);
    }
  }
}

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds(): void {
  activeSounds.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeSounds.clear();
}

/**
 * Stop a specific sound
 */
export function stopSound(soundName: SoundName): void {
  const audio = activeSounds.get(soundName);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    activeSounds.delete(soundName);
  }
}
