/**
 * Modal Animation Variants
 *
 * Cinematic zoom-in and portal-like opening animations for ProjectModal
 */

import type { Variants } from "framer-motion";

/**
 * Main modal backdrop variants
 */
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * Cinematic zoom-in animation
 * Starts from project node position, scales and centers into view
 */
export const modalContainerVariants: Variants = {
  hidden: {
    scale: 0.3,
    opacity: 0,
    rotateX: -15,
    y: 50,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      mass: 0.8,
      opacity: { duration: 0.3 },
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    rotateX: 15,
    y: 30,
    transition: {
      duration: 0.3,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};

/**
 * Portal rift opening effect
 * Creates expanding circular reveal
 */
export const portalRiftVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: [0, 1, 0.8],
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      opacity: {
        times: [0, 0.5, 1],
        duration: 0.8,
      },
    },
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};

/**
 * Hero image reveal with parallax zoom
 */
export const heroImageVariants: Variants = {
  hidden: {
    scale: 1.2,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.2,
    },
  },
};

/**
 * Content sections stagger animation
 */
export const contentSectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.3 + index * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/**
 * Tag/chip stagger animations
 */
export const chipVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300,
      delay: 0.5 + index * 0.05,
    },
  }),
};

/**
 * Close button entrance
 */
export const closeButtonVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
      delay: 0.4,
    },
  },
  hover: {
    scale: 1.1,
    rotate: 90,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.9,
  },
};

/**
 * Language bar reveal animation
 */
export const languageBarVariants: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
  },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.4,
    },
  },
};

/**
 * Pan/zoom container for interactive viewing
 */
export const panZoomVariants: Variants = {
  default: {
    scale: 1,
    x: 0,
    y: 0,
  },
  zoomed: {
    scale: 1.5,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
};
