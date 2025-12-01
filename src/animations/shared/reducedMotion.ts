import type { Variants } from "framer-motion";

/**
 * Reduced Motion Utilities
 *
 * For users with prefers-reduced-motion enabled, provide static/minimal animation variants
 * that respect accessibility preferences while maintaining visual polish
 */

/**
 * Get animation variant based on reduced motion preference
 * Returns static versions of animations when needed
 */
export const getVariant = (_reducedMotion: boolean) => {
  // When reduced motion is enabled, return minimal/static variants
  if (_reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
    };
  }

  // Otherwise return empty object - let component use full animations
  return {};
};

/**
 * Reduced motion variants for fade-in only
 * No transform, scale, or movement animations
 */
export const reducedMotionVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Wrapper for any animation variant to respect reduced motion
 * Usage: Apply to component and pass result to framer motion 'variants' prop
 */
export const applyReducedMotion = (
  variants: Variants,
  reducedMotion: boolean
): Variants => {
  if (!reducedMotion) return variants;

  // Convert to reduced motion variant
  const reduced: Variants = {};

  for (const key in variants) {
    const state = variants[key];
    if (typeof state === "object") {
      reduced[key] = {
        opacity: state.opacity ?? 1,
        // Transition only opacity, ignore other transforms
        transition: { duration: 0.2 },
      };
    }
  }

  return reduced;
};
