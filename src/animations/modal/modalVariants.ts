/**
 * Modal Animation Variants
 *
 * Note: Main variants are in modalTransitions.ts
 * This file provides additional/complementary animation presets
 */

import type { Variants } from "framer-motion";

/**
 * Alternative modal entrance - more subtle
 */
export const modalVariantsSubtle: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Alternative modal entrance - dramatic
 */
export const modalVariantsDramatic: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.1,
    rotateX: -45,
    rotateY: -45,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      mass: 1,
    },
  },
};

/**
 * Re-export main variants for convenience
 * (Primary variants are in modalTransitions.ts)
 */
export {
  backdropVariants,
  modalContainerVariants,
  portalRiftVariants,
  heroImageVariants,
  contentSectionVariants,
  chipVariants,
  closeButtonVariants,
  languageBarVariants,
  panZoomVariants,
} from "./modalTransitions";
